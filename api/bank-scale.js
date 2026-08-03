// Stores each basket's "bank scale" multiplier in Upstash Redis - a
// 0.25x-4x sensitivity dial on the doubling-tier take-profit rule's bank
// increment. Both trade-run.js (live) and CombinedCycleStrategy.js
// (backtest) multiply their computed bank increment by this value, so
// live trading and the backtest always agree. Defaults to 1x (unscaled)
// if nothing has been set yet.

import { getBankScale, setBankScale } from "./baskets.js";

export default async function handler(req, res) {
  const basketName = req.query.basket === "ai" ? "ai" : "main";

  if (req.method === "GET" && !req.query.action) {
    const scale = await getBankScale(basketName);
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
    res.status(200).json({ basket: basketName, scale });
    return;
  }

  // Changing the scale requires the trade secret.
  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.query.action !== "set") {
    res.status(400).json({ error: "action must be 'set'" });
    return;
  }

  const scale = parseFloat(req.query.scale);
  if (!Number.isFinite(scale) || scale < 0.25 || scale > 4) {
    res.status(400).json({ error: "Provide ?scale= between 0.25 and 4" });
    return;
  }

  const ok = await setBankScale(basketName, scale);
  if (!ok) {
    res.status(500).json({ error: "Failed to save - check KV storage is connected" });
    return;
  }

  res.status(200).json({ basket: basketName, scale });
}
