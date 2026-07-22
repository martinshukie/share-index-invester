// Read-only view of the paper trading account, for the dashboard to poll.
// Cannot place trades - only api/trade-run.js (secret-protected) can do that.

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

export default async function handler(req, res) {
  if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
    res.status(500).json({ error: "Alpaca API keys not configured" });
    return;
  }

  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";

  try {
    const [accountRes, ordersRes, ...positionResults] = await Promise.all([
      fetch(`${base}/v2/account`, { headers: alpacaHeaders() }),
      fetch(`${base}/v2/orders?status=all&limit=10&direction=desc`, { headers: alpacaHeaders() }),
      ...TRADE_BASKET.map((symbol) => getPosition(base, symbol)),
    ]);

    const account = accountRes.ok ? await accountRes.json() : null;
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    const holdings = TRADE_BASKET.map((symbol, i) => {
      const p = positionResults[i];
      if (!p) return null;
      return {
        symbol,
        qty: parseFloat(p.qty),
        marketValue: parseFloat(p.market_value),
        costBasis: parseFloat(p.cost_basis),
        unrealizedPl: parseFloat(p.unrealized_pl),
      };
    }).filter(Boolean);

    const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json({
      cash: account ? parseFloat(account.cash) : null,
      equity: account ? parseFloat(account.equity) : null,
      holdings,
      totalHoldingsValue,
      recentOrders: orders.slice(0, 10).map((o) => ({
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