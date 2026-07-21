// Tracked instruments. Yahoo Finance ticker conventions:
//  - Futures use "=F" suffix (gold, oil, natural gas)
//  - Equities use plain tickers
// Extend this list toward the "top 500" goal by adding more entries here —
// the rest of the app already handles any number of symbols.
export const ASSETS = [
  { symbol: "GC=F", label: "Gold", short: "GOLD", category: "Commodity", unit: "oz" },
  { symbol: "CL=F", label: "Crude Oil (WTI)", short: "OIL", category: "Commodity", unit: "bbl" },
  { symbol: "NG=F", label: "Natural Gas", short: "NATGAS", category: "Commodity", unit: "MMBtu" },
  { symbol: "AAPL", label: "Apple", short: "AAPL", category: "Stock" },
  { symbol: "MSFT", label: "Microsoft", short: "MSFT", category: "Stock" },
  { symbol: "NVDA", label: "NVIDIA", short: "NVDA", category: "Stock" },
  { symbol: "XOM", label: "Exxon Mobil", short: "XOM", category: "Stock" },
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
