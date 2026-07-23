// Adds simulated funds to the paper account by buying evenly across the
// trading basket. This does NOT touch any real bank account - it only
// works within Alpaca's simulated paper-trading balance.
// Protected by the same secret as trade-run.js.

const TRADE_BASKET = ["GLD", "USO", "UNG", "AAPL", "MSFT", "NVDA", "XOM"];

function alpacaHeaders() {
  return {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
    "Content-Type": "application/json",
  };
}

async function buyNotional(base, symbol, notional) {
  const r = await fetch(`${base}/v2/orders`, {
    method: "POST",
    headers: alpacaHeaders(),
    body: JSON.stringify({
      symbol,
      notional: notional.toFixed(2),
      side: "buy",
      type: "market",
      time_in_force: "day",
    }),
  });
  if (!r.ok) throw new Error(`buy order failed for ${symbol}: ${r.status} ${await r.text()}`);
  return r.json();
}

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const amount = parseFloat(req.query.amount);
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Provide a positive ?amount=" });
    return;
  }

  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";
  const perAsset = amount / TRADE_BASKET.length;

  try {
    const orders = await Promise.all(
      TRADE_BASKET.map((symbol) => buyNotional(base, symbol, perAsset))
    );
    res.status(200).json({ action: "funds_added", amount, perAsset, orders });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
