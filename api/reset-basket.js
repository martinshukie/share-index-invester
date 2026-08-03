// Sells every current position in a basket back to cash and zeroes its
// banked total - PAPER or LIVE depending on alpaca-config.js. "Zeroing"
// is done by advancing the basket's reset timestamp (see baskets.js);
// trade-run.js and trade-status.js only count "bank-" orders submitted
// after that point, so older banked amounts stop counting without
// needing to touch Alpaca's own order history. The next trade-run.js
// cycle sees no held positions and reopens the basket from scratch, same
// as a brand new basket. Protected by the same secret as trade-run.js.

import { getBasketSymbols, setResetTimestamp } from "./baskets.js";
import { getAlpacaConfig } from "./alpaca-config.js";

async function getPosition(base, headers, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, { headers });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`position fetch failed for ${symbol}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function closePosition(base, headers, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, { method: "DELETE", headers });
  if (!r.ok) throw new Error(`close position failed for ${symbol}: ${r.status} ${await r.text()}`);
  return r.json();
}

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
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
  const basketName = req.query.basket === "ai" ? "ai" : "main";
  const basketSymbols = await getBasketSymbols(basketName);

  try {
    const positions = await Promise.all(basketSymbols.map((s) => getPosition(base, headers, s)));
    const held = basketSymbols.filter((_, i) => positions[i] !== null);
    const closedOrders = await Promise.all(held.map((s) => closePosition(base, headers, s)));

    const resetAt = Date.now();
    const ok = await setResetTimestamp(basketName, resetAt);
    if (!ok) {
      res.status(500).json({
        error: "Positions closed, but failed to save the reset timestamp - check KV storage is connected",
      });
      return;
    }

    res.status(200).json({
      basket: basketName,
      isLive,
      action: "basket_reset",
      resetAt,
      closedOrders,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
