// Manually buys more of ONE specific asset - PAPER or LIVE depending on
// alpaca-config.js. Validates the symbol against whatever is currently in
// either basket (from Upstash storage). Never touches any bank account
// directly. Protected by the same secret as trade-run.js.

import { getAllSymbols } from "./baskets.js";
import { getAlpacaConfig } from "./_lib/alpaca-config.js";

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

  const config = await getAlpacaConfig();
  if (!config.keysConfigured) {
    res.status(500).json({
      error: config.isLive ? "Live Alpaca API keys not configured" : "Paper Alpaca API keys not configured",
    });
    return;
  }
  const { base, headers, isLive } = config;

  try {
    const r = await fetch(`${base}/v2/orders`, {
      method: "POST",
      headers,
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
    res.status(200).json({ action: "asset_funded", isLive, symbol, amount, order });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
