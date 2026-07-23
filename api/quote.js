// Serverless function (runs on Vercel's server, not in the browser).
// Proxies Yahoo Finance's public chart endpoint so the frontend never
// has to deal with CORS, and no API key is required.
export default async function handler(req, res) {
  const { symbol = "GC=F", range = "6mo", interval = "1d" } = req.query;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;

    const upstream = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BuilderApp/1.0)" },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream error ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      res.status(404).json({ error: `No data found for symbol "${symbol}"` });
      return;
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const meta = result.meta || {};

    const series = timestamps
      .map((t, i) => ({ t: t * 1000, close: closes[i] }))
      .filter((p) => typeof p.close === "number");

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({
      symbol,
      currency: meta.currency || "USD",
      price: meta.regularMarketPrice ?? null,
      previousClose: meta.chartPreviousClose ?? null,
      series,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch market data", detail: String(err) });
  }
}
