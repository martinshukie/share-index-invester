// Read-only view of a paper OR live trading basket (see alpaca-config.js
// for how the mode is chosen), for the dashboard to poll. ?basket=main or
// ?basket=ai selects which independent basket to report on. Basket
// composition comes from Upstash storage (see baskets.js).

import { getBasketSymbols, getResetTimestamp, getBankScale, getDailySnapshot } from "./baskets.js";
import { getAlpacaConfig } from "./alpaca-config.js";

async function getPosition(base, headers, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, { headers });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json();
}

function findEntryTimes(orders, basketSymbols) {
  const bySymbol = {};
  for (const o of orders) {
    if (o.side === "buy" && o.status === "filled" && basketSymbols.includes(o.symbol) && !bySymbol[o.symbol]) {
      bySymbol[o.symbol] = o.filled_at || o.submitted_at;
    }
  }
  return bySymbol;
}

function computeBanked(orders, basketSymbols, sinceTs) {
  let total = 0;
  const bySymbol = {};
  basketSymbols.forEach((s) => (bySymbol[s] = 0));
  for (const o of orders) {
    const id = o.client_order_id || "";
    if (id.startsWith("bank-")) {
      const parts = id.split("-");
      const amt = parseFloat(parts[1]);
      const symbol = parts[2];
      const submittedAt = new Date(o.submitted_at).getTime();
      if (!isNaN(amt) && bySymbol[symbol] != null && submittedAt >= sinceTs) {
        total += amt;
        bySymbol[symbol] += amt;
      }
    }
  }
  return { total, bySymbol };
}

export default async function handler(req, res) {
  const config = await getAlpacaConfig();
  if (!config.keysConfigured) {
    res.status(500).json({
      error: config.isLive ? "Live Alpaca API keys not configured" : "Paper Alpaca API keys not configured",
    });
    return;
  }

  const { base, headers, isLive } = config;
  const basketName = req.query.basket === "ai" ? "ai" : "main";
  const basketSymbols = await getBasketSymbols(basketName);

  try {
    const [accountRes, allOrdersRes, recentOrdersRes, resetTs, bankScale, dailySnapshot, ...positionResults] =
      await Promise.all([
        fetch(`${base}/v2/account`, { headers }),
        fetch(`${base}/v2/orders?status=all&limit=500&direction=desc`, { headers }),
        fetch(`${base}/v2/orders?status=all&limit=10&direction=desc`, { headers }),
        getResetTimestamp(basketName),
        getBankScale(basketName),
        getDailySnapshot(basketName),
        ...basketSymbols.map((symbol) => getPosition(base, headers, symbol)),
      ]);

    const account = accountRes.ok ? await accountRes.json() : null;
    const allOrders = allOrdersRes.ok ? await allOrdersRes.json() : [];
    const recentOrders = recentOrdersRes.ok ? await recentOrdersRes.json() : [];
    const banked = computeBanked(allOrders, basketSymbols, resetTs);
    const entryTimes = findEntryTimes(allOrders, basketSymbols);

    const holdings = basketSymbols.map((symbol, i) => {
      const p = positionResults[i];
      return {
        symbol,
        qty: p ? parseFloat(p.qty) : 0,
        marketValue: p ? parseFloat(p.market_value) : 0,
        costBasis: p ? parseFloat(p.cost_basis) : 0,
        unrealizedPl: p ? parseFloat(p.unrealized_pl) : 0,
        avgEntryPrice: p ? parseFloat(p.avg_entry_price) : 0,
        entryTime: p ? entryTimes[symbol] || null : null,
        banked: banked.bySymbol[symbol] || 0,
      };
    });

    const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const basketRecentOrders = recentOrders.filter((o) => basketSymbols.includes(o.symbol));
    const strategyWealth = banked.total + totalHoldingsValue;
    const dailyChange = dailySnapshot ? strategyWealth - dailySnapshot.value : null;
    const dailyChangePct = dailySnapshot && dailySnapshot.value > 0 ? (dailyChange / dailySnapshot.value) * 100 : null;

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json({
      basket: basketName,
      isLive,
      bankScale,
      cash: account ? parseFloat(account.cash) : null,
      equity: account ? parseFloat(account.equity) : null,
      holdings: holdings.filter((h) => h.marketValue > 0 || h.banked > 0),
      allHoldings: holdings,
      totalHoldingsValue,
      strategyBanked: banked.total,
      strategyWealth,
      dailyChange,
      dailyChangePct,
      recentOrders: basketRecentOrders.slice(0, 10).map((o) => ({
        id: o.id,
        symbol: o.symbol,
        side: o.side,
        status: o.status,
        submittedAt: o.submitted_at,
        filledAvgPrice: o.filled_avg_price,
        notional: o.notional,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
