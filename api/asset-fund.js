// Manually buys more of ONE specific asset - simulated paper money only,
// no real bank connection. Validates the symbol against whatever is
// currently in either basket (from Upstash storage). Protected by the
// same secret as trade-run.js.

import { getAllSymbols } from "./baskets.js";

function alpacaHeaders() {
  return {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
    "Content-Type": "application/json",
  };
}

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const symbol = req.query.symbol;
  const amount = parseFloat(req.query.amount);
  const allSymbols = await getAllSymbols();
  if (!allSymbols.includes(symbol)) {
    res.status(400).json({ error: `Unknown symbol "${symbol}"` });
    return;
  }
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Provide a positive ?amount=" });
    return;
  }

  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";

  try {
    const r = await fetch(`${base}/v2/orders`, {
      method: "POST",
      headers: alpacaHeaders(),
      body: JSON.stringify({
        symbol,
        notional: amount.toFixed(2),
        side: "buy",
        type: "market",
        time_in_force: "day",
        client_order_id: `fund-${amount.toFixed(2)}-${symbol}-${Date.now()}`,
      }),
    });
    if (!r.ok) throw new Error(`buy order failed: ${r.status} ${await r.text()}`);
    const order = await r.json();
    res.status(200).json({ action: "asset_funded", symbol, amount, order });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
