// Stores each basket's stock list in Upstash Redis (added via Vercel
// Storage), so the app can add/remove stocks at runtime without needing a
// code change or redeploy. Falls back to sensible defaults if the store is
// empty or unreachable, so nothing breaks if this hasn't been used yet.

const DEFAULTS = {
  main: ["GLD", "USO", "AAPL", "MSFT", "NVDA", "XOM"],
  ai: ["NBIS", "CRWV", "AVGO"],
};

function kvHeaders() {
  return { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` };
}

async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  if (!url) return null;
  const r = await fetch(`${url}/get/${key}`, { headers: kvHeaders() });
  if (!r.ok) return null;
  const data = await r.json();
  return data.result;
}

async function kvSet(key, value) {
  const url = process.env.KV_REST_API_URL;
  if (!url) return false;
  const r = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { ...kvHeaders(), "Content-Type": "text/plain" },
    body: value,
  });
  return r.ok;
}

export async function getBasketSymbols(basketName) {
  try {
    const raw = await kvGet(`basket:${basketName}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fall through to defaults
  }
  return DEFAULTS[basketName] || [];
}

export async function getAllSymbols() {
  const [main, ai] = await Promise.all([getBasketSymbols("main"), getBasketSymbols("ai")]);
  return [...main, ...ai];
}

// Reset timestamp: advanced by reset-basket.js whenever a basket is sold
// back to cash. trade-run.js and trade-status.js only count "bank-" orders
// submitted after this point, so a reset zeroes the basket's banked total
// without needing to touch Alpaca's own order history.
export async function getResetTimestamp(basketName) {
  const raw = await kvGet(`reset-ts:${basketName}`);
  const ts = parseInt(raw, 10);
  return Number.isFinite(ts) ? ts : 0;
}

export async function setResetTimestamp(basketName, ts) {
  return kvSet(`reset-ts:${basketName}`, String(ts));
}

// Bank scale: a per-basket multiplier (0.25x-4x) on the doubling-tier
// strategy's bank increment, set via BankScaleControl.js and read by both
// trade-run.js (live) and CombinedCycleStrategy.js (backtest).
const MIN_BANK_SCALE = 0.25;
const MAX_BANK_SCALE = 4;

export async function getBankScale(basketName) {
  const raw = await kvGet(`bank-scale:${basketName}`);
  const scale = parseFloat(raw);
  if (!Number.isFinite(scale)) return 1;
  return Math.min(MAX_BANK_SCALE, Math.max(MIN_BANK_SCALE, scale));
}

export async function setBankScale(basketName, scale) {
  const clamped = Math.min(MAX_BANK_SCALE, Math.max(MIN_BANK_SCALE, scale));
  return kvSet(`bank-scale:${basketName}`, String(clamped));
}

// A single rolling "value ~24h ago" snapshot per basket, used to show
// daily change. Alpaca's account-level equity/last_equity fields cover
// both baskets (and MrCrypto, which shares this same account) combined,
// so they can't answer "how did just this basket do today" - this
// tracks each basket's own strategy wealth instead. Written by
// trade-run.js (rolled forward once it's more than a day old), read by
// trade-status.js for display.
export async function getDailySnapshot(basketName) {
  const [rawValue, rawTs] = await Promise.all([
    kvGet(`daily-snapshot-value:${basketName}`),
    kvGet(`daily-snapshot-ts:${basketName}`),
  ]);
  const value = parseFloat(rawValue);
  const ts = parseInt(rawTs, 10);
  if (!Number.isFinite(value) || !Number.isFinite(ts)) return null;
  return { value, ts };
}

export async function setDailySnapshot(basketName, value, ts) {
  await kvSet(`daily-snapshot-value:${basketName}`, String(value));
  await kvSet(`daily-snapshot-ts:${basketName}`, String(ts));
}

export default async function handler(req, res) {
  const basketName = req.query.basket === "ai" ? "ai" : "main";

  if (req.method === "GET" && !req.query.action) {
    const symbols = await getBasketSymbols(basketName);
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
    res.status(200).json({ basket: basketName, symbols });
    return;
  }

  // Adding/removing requires the trade secret.
  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const action = req.query.action;
  const symbol = (req.query.symbol || "").toUpperCase().trim();
  if (!symbol) {
    res.status(400).json({ error: "Provide ?symbol=" });
    return;
  }

  let symbols = await getBasketSymbols(basketName);

  if (action === "add") {
    if (!symbols.includes(symbol)) symbols = [...symbols, symbol];
  } else if (action === "remove") {
    if (symbols.length <= 1) {
      res.status(400).json({ error: "Can't remove the last stock in a basket" });
      return;
    }
    symbols = symbols.filter((s) => s !== symbol);
  } else {
    res.status(400).json({ error: "action must be 'add' or 'remove'" });
    return;
  }

  const ok = await kvSet(`basket:${basketName}`, JSON.stringify(symbols));
  if (!ok) {
    res.status(500).json({ error: "Failed to save - check KV storage is connected" });
    return;
  }

  res.status(200).json({ basket: basketName, symbols });
}
