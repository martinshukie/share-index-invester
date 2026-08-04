// Central switch between PAPER and LIVE Alpaca trading. The actual mode
// (paper/live) is stored in Upstash Redis and toggled via the in-app
// "Go Live" button (see trading-mode.js and LiveSwitch.js) - not an
// environment variable anymore, for simplicity.
//
// Live mode only activates if BOTH of these are true:
//  1. The stored mode is "live" (set via the app's Go Live button, which
//     requires typing an exact confirmation phrase first)
//  2. APCA_LIVE_API_KEY_ID and APCA_LIVE_API_SECRET_KEY are actually set
//     in Vercel - these are real secrets and must live there, never
//     enterable through the app itself.
//
// If either condition isn't met, everything safely falls back to paper.

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

export async function getTradingMode() {
  const mode = await kvGet("trading-mode");
  return mode === "live" ? "live" : "paper";
}

export async function setTradingMode(mode) {
  return kvSet("trading-mode", mode === "live" ? "live" : "paper");
}

export function liveKeysConfigured() {
  return !!(process.env.APCA_LIVE_API_KEY_ID && process.env.APCA_LIVE_API_SECRET_KEY);
}

export async function getAlpacaConfig() {
  const mode = await getTradingMode();
  const isLive = mode === "live" && liveKeysConfigured();

  if (isLive) {
    return {
      isLive: true,
      base: process.env.APCA_LIVE_API_BASE_URL || "https://api.alpaca.markets",
      headers: {
        "APCA-API-KEY-ID": process.env.APCA_LIVE_API_KEY_ID,
        "APCA-API-SECRET-KEY": process.env.APCA_LIVE_API_SECRET_KEY,
        "Content-Type": "application/json",
      },
      keysConfigured: true,
    };
  }

  return {
    isLive: false,
    base: process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets",
    headers: {
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
      "Content-Type": "application/json",
    },
    keysConfigured: !!(process.env.APCA_API_KEY_ID && process.env.APCA_API_SECRET_KEY),
  };
}
