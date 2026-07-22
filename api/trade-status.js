// Proxies Alpaca's account equity history so the holdings screen can draw
// a real "total portfolio value over time" chart, same idea as the
// screenshot reference.

function alpacaHeaders() {
  return {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
  };
}

const PERIOD_MAP = {
  "1D": { period: "1D", timeframe: "5Min" },
  "1W": { period: "1W", timeframe: "1H" },
  "1M": { period: "1M", timeframe: "1D" },
  "6M": { period: "6M", timeframe: "1D" },
  "1Y": { period: "1A", timeframe: "1D" },
  ALL: { period: "all", timeframe: "1D" },
};

export default async function handler(req, res) {
  if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
    res.status(500).json({ error: "Alpaca API keys not configured" });
    return;
  }

  const range = PERIOD_MAP[req.query.range] || PERIOD_MAP["1M"];
  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";

  try {
    const url = `${base}/v2/account/portfolio/history?period=${range.period}&timeframe=${range.timeframe}`;
    const r = await fetch(url, { headers: alpacaHeaders() });
    if (!r.ok) {
      res.status(r.status).json({ error: `Upstream error ${r.status}` });
      return;
    }
    const data = await r.json();
    const timestamps = data.timestamp || [];
    const equity = data.equity || [];
    const series = timestamps
      .map((t, i) => ({ t: t * 1000, close: equity[i] }))
      .filter((p) => typeof p.close === "number");

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json({ series });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}