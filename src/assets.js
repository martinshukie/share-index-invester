// Tracked instruments. Yahoo Finance ticker conventions:
//  - Futures use "=F" suffix (gold, oil)
//  - Equities use plain tickers
// Extend this list toward the "top 500" goal by adding more entries here —
// the rest of the app already handles any number of symbols.
export const ASSETS = [
  { symbol: "GC=F", label: "Gold", short: "GOLD", category: "Commodity", unit: "oz" },
  { symbol: "CL=F", label: "Crude Oil (WTI)", short: "OIL", category: "Commodity", unit: "bbl" },
  { symbol: "AAPL", label: "Apple", short: "AAPL", category: "Stock" },
  { symbol: "MSFT", label: "Microsoft", short: "MSFT", category: "Stock" },
  { symbol: "NVDA", label: "NVIDIA", short: "NVDA", category: "Stock" },
  { symbol: "XOM", label: "Exxon Mobil", short: "XOM", category: "Stock" },
  { symbol: "NBIS", label: "Nebius", short: "NBIS", category: "AI" },
  { symbol: "CRWV", label: "CoreWeave", short: "CRWV", category: "AI" },
  { symbol: "AVGO", label: "Broadcom", short: "AVGO", category: "AI" },
];

// Main basket - tradable via Alpaca (ETF proxies for commodities, since
// Alpaca can't trade futures directly).
export const TRADE_BASKET = [
  { symbol: "GLD", label: "Gold (GLD)" },
  { symbol: "USO", label: "Oil (USO)" },
  { symbol: "AAPL", label: "Apple" },
  { symbol: "MSFT", label: "Microsoft" },
  { symbol: "NVDA", label: "NVIDIA" },
  { symbol: "XOM", label: "Exxon Mobil" },
];

// AI basket - runs as a fully separate strategy with its own banked total,
// independent from the main basket above.
export const AI_BASKET = [
  { symbol: "NBIS", label: "Nebius" },
  { symbol: "CRWV", label: "CoreWeave" },
  { symbol: "AVGO", label: "Broadcom" },
];

export const RANGES = [
  { value: "1mo", label: "1M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
];

export async function fetchQuote(symbol, range = "6mo", interval = "1d") {
  const res = await fetch(
    `/api/quote?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`
  );
  if (!res.ok) throw new Error(`Failed to load ${symbol}`);
  return res.json();
}
