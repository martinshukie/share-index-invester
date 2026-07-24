import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { ASSETS, RANGES, TRADE_BASKET, AI_BASKET, fetchQuote } from "./assets";
import TickerTape from "./components/TickerTape";
import PriceChart from "./components/PriceChart";
import HoldingsScreen from "./components/HoldingsScreen";
import Portfolio from "./components/Portfolio";
import CombinedCycleStrategy from "./components/CombinedCycleStrategy";
import PaperTrading from "./components/PaperTrading";
import AssetTable from "./components/AssetTable";

const REFRESH_MS = 60000;

export default function App() {
  const [quotes, setQuotes] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState(ASSETS[0].symbol);
  const [range, setRange] = useState("6mo");
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshQuotes = useCallback(() => {
    Promise.allSettled(ASSETS.map((a) => fetchQuote(a.symbol, "5d", "1d"))).then((results) => {
      const next = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          next[ASSETS[i].short] = { price: r.value.price, previousClose: r.value.previousClose };
        }
      });
      setQuotes(next);
      setLastUpdated(new Date());
    });
  }, []);

  useEffect(() => {
    refreshQuotes();
    const id = setInterval(refreshQuotes, REFRESH_MS);
    return () => clearInterval(id);
  }, [refreshQuotes]);

  const loadSeries = useCallback((symbol, range) => {
    setLoading(true);
    setError(null);
    fetchQuote(symbol, range)
      .then((d) => setSeries(d.series))
      .catch(() => setError("Couldn't load price history. Pull to refresh and try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSeries(selectedSymbol, range);
  }, [selectedSymbol, range, loadSeries]);

  const asset = ASSETS.find((a) => a.symbol === selectedSymbol);

  return (
    <div className="app">
      <TickerTape quotes={quotes} />

      <header className="app__header">
        <h1>Builder</h1>
        <p className="app__tagline">Markets research dashboard — gold, oil, equities &amp; AI</p>
        {lastUpdated && (
          <p className="app__updated">
            Live prices updated {lastUpdated.toLocaleTimeString()} · refreshes every 60s
          </p>
        )}
      </header>

      <main className="app__main">
        <HoldingsScreen />
      </main>

      <nav className="asset-tabs">
        {ASSETS.map((a) => (
          <button
            key={a.symbol}
            className={`asset-tabs__tab ${a.symbol === selectedSymbol ? "asset-tabs__tab--on" : ""}`}
            onClick={() => setSelectedSymbol(a.symbol)}
          >
            {a.short}
          </button>
        ))}
      </nav>

      <div className="range-select">
        {RANGES.map((r) => (
          <button
            key={r.value}
            className={`range-select__btn ${r.value === range ? "range-select__btn--on" : ""}`}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <main className="app__main">
        {loading && <div className="loading">Loading {asset?.label}…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && series && (
          <PriceChart series={series} label={asset?.label} unit={asset?.unit} />
        )}

        <h2 className="section-heading">Main basket — gold, oil &amp; equities</h2>
        <CombinedCycleStrategy range={range} basket={TRADE_BASKET} title="Main basket strategy (tiered)" />
        <PaperTrading basket="main" title="Main basket — paper trading account" />
        <AssetTable basket="main" symbols={TRADE_BASKET.map((a) => a.symbol)} />

        <h2 className="section-heading">AI basket — separate strategy</h2>
        <CombinedCycleStrategy range={range} basket={AI_BASKET} title="AI basket strategy (tiered)" />
        <PaperTrading basket="ai" title="AI basket — paper trading account" />
        <AssetTable basket="ai" symbols={AI_BASKET.map((a) => a.symbol)} />

        <Portfolio range={range} />
      </main>

      <footer className="app__footer">
        Educational / research tool only — not financial advice. Prices are delayed, free-tier
        market data. Not connected to any real bank account — "Add funds" only affects the
        simulated paper trading balance. The main and AI baskets run as fully independent
        strategies with separate banked totals.
      </footer>
    </div>
  );
}
