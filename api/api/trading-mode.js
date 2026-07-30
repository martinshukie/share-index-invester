// Reports and changes the paper/live trading mode. GET is public (just
// tells the dashboard which mode is active). Switching TO live requires
// the trade secret AND typing the exact confirmation phrase - switching
// back to paper only requires the secret, since going back to safety
// should never be the hard path.

import { getTradingMode, setTradingMode, liveKeysConfigured } from "./alpaca-config.js";

const CONFIRM_PHRASE = "I_UNDERSTAND_THIS_IS_REAL_MONEY";

export default async function handler(req, res) {
  if (!req.query.action) {
    const mode = await getTradingMode();
    res.status(200).json({
      mode,
      isLive: mode === "live" && liveKeysConfigured(),
      liveKeysConfigured: liveKeysConfigured(),
    });
    return;
  }

  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.query.action === "go-live") {
    if (req.query.confirm !== CONFIRM_PHRASE) {
      res.status(400).json({ error: "Confirmation phrase doesn't match" });
      return;
    }
    if (!liveKeysConfigured()) {
      res.status(400).json({
        error: "Live Alpaca API keys aren't set up in Vercel yet - add APCA_LIVE_API_KEY_ID and APCA_LIVE_API_SECRET_KEY first",
      });
      return;
    }
    const ok = await setTradingMode("live");
    if (!ok) {
      res.status(500).json({ error: "Failed to save - check KV storage is connected" });
      return;
    }
    res.status(200).json({ mode: "live", isLive: true });
    return;
  }

  if (req.query.action === "go-paper") {
    const ok = await setTradingMode("paper");
    if (!ok) {
      res.status(500).json({ error: "Failed to save - check KV storage is connected" });
      return;
    }
    res.status(200).json({ mode: "paper", isLive: false });
    return;
  }

  res.status(400).json({ error: "action must be 'go-live' or 'go-paper'" });
}
