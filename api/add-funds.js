// Adds funds to a basket by buying evenly across it - PAPER or LIVE
// depending on alpaca-config.js. ?basket=main or ?basket=ai selects which.
// Basket composition comes from Upstash storage (see baskets.js). This
// only works within whatever balance already exists in the connected
// Alpaca account - it never touches any bank account directly, live or
// otherwise. Protected by the same secret as trade-run.js.

import { getBasketSymbols } from "./baskets.js";
import { getAlpacaConfig } from "./alpaca-config.js";

async function buyNotional(base, headers, symbol, notional) {
  const r = await fetch(`${base}/v2/orders`, {
    method: "POST",
    headers,
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

  const config = getAlpacaConfig();
  if (!config.keysConfigured) {
    res.status(500).json({
      error: config.isLive ? "Live Alpaca API keys not configured" : "Paper Alpaca API keys not configured",
    });
    return;
  }

  const { base, headers, isLive } = config;
  const basketName = req.query.basket === "ai" ? "ai" : "main";
  const basketSymbols = await getBasketSymbols(basketName);
  const perAsset = amount / basketSymbols.length;

  try {
    const orders = await Promise.all(
      basketSymbols.map((symbol) => buyNotional(base, headers, symbol, perAsset))
    );
    res.status(200).json({ basket: basketName, isLive, action: "funds_added", amount, perAsset, orders });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
