// Read-only view of the paper trading account, for the dashboard to poll.
// Cannot place trades - only trade-run.js / asset-fund.js / asset-bank.js
// (all secret-protected) can do that.

const TRADE_BASKET = ["GLD", "USO", "UNG", "AAPL", "MSFT", "NVDA", "XOM"];

function alpacaHeaders() {
  return {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
  };
}

async function getPosition(base, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, { headers: alpacaHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json();
}

function computeBanked(orders) {
  let total = 0;
  const bySymbol = {};
  TRADE_BASKET.forEach((s) => (bySymbol[s] = 0));
  for (const o of orders) {
    const id = o.client_order_id || "";
    if (id.startsWith("bank-")) {
      const parts = id.split("-");
      const amt = parseFloat(parts[1]);
      const symbol = parts[2];
      if (!isNaN(amt)) {
        total += amt;
        if (bySymbol[symbol] != null) bySymbol[symbol] += amt;
      }
    }
  }
  return { total, bySymbol };
}

export default async function handler(req, res) {
  if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
    res.status(500).json({ error: "Alpaca API keys not configured" });
    return;
  }

  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";

  try {
    const [accountRes, allOrdersRes, recentOrdersRes, ...positionResults] = await Promise.all([
      fetch(`${base}/v2/account`, { headers: alpacaHeaders() }),
      fetch(`${base}/v2/orders?status=all&limit=500&direction=desc`, { headers: alpacaHeaders() }),
      fetch(`${base}/v2/orders?status=all&limit=10&direction=desc`, { headers: alpacaHeaders() }),
      ...TRADE_BASKET.map((symbol) => getPosition(base, symbol)),
    ]);

    const account = accountRes.ok ? await accountRes.json() : null;
    const allOrders = allOrdersRes.ok ? await allOrdersRes.json() : [];
    const recentOrders = recentOrdersRes.ok ? await recentOrdersRes.json() : [];
    const banked = computeBanked(allOrders);

    const holdings = TRADE_BASKET.map((symbol, i) => {
      const p = positionResults[i];
      return {
        symbol,
        qty: p ? parseFloat(p.qty) : 0,
        marketValue: p ? parseFloat(p.market_value) : 0,
        costBasis: p ? parseFloat(p.cost_basis) : 0,
        unrealizedPl: p ? parseFloat(p.unrealized_pl) : 0,
        banked: banked.bySymbol[symbol] || 0,
      };
    });

    const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json({
      cash: account ? parseFloat(account.cash) : null,
      equity: account ? parseFloat(account.equity) : null,
      holdings: holdings.filter((h) => h.marketValue > 0 || h.banked > 0),
      allHoldings: holdings,
      totalHoldingsValue,
      strategyBanked: banked.total,
      strategyWealth: banked.total + totalHoldingsValue,
      recentOrders: recentOrders.slice(0, 10).map((o) => ({
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
