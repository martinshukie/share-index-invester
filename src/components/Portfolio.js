import React, { useMemo, useState } from "react";
import { ASSETS, fetchQuote } from "../assets";

const START_CAPITAL = 250;

export default function Portfolio({ range }) {
  const [selected, setSelected] = useState(["GC=F", "AAPL"]);
  const [seriesBySymbol, setSeriesBySymbol] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function toggle(symbol) {
    setSelected((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }

  async function runBacktest() {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        selected.map((symbol) => fetchQuote(symbol, range).then((d) => [symbol, d.series]))
      );
      const map = {};
      results.forEach(([symbol, series]) => (map[symbol] = series));
      setSeriesBySymbol(map);
    } catch (e) {
      setError("Couldn't load historical data for one or more assets. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const backtest = useMemo(() => {
    const symbols = selected.filter((s) => seriesBySymbol[s]?.length > 1);
    if (symbols.length === 0) return null;

    const perAsset = START_CAPITAL / symbols.length;
    const maxLen = Math.min(...symbols.map((s) => seriesBySymbol[s].length));

    const values = [];
    for (let i = 0; i < maxLen; i++) {
      let total = 0;
      symbols.forEach((s) => {
        const series = seriesBySymbol[s];
        const growth = series[i].close / series[0].close;
        total += perAsset * growth;
      });
      values.push(total);
    }

    const finalValue = values[values.length - 1];
    const pnl = finalValue - START_CAPITAL;
    const pnlPct = (pnl / START_CAPITAL) * 100;

    return { values, finalValue, pnl, pnlPct, symbols };
  }, [seriesBySymbol, selected]);

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>Theoretical portfolio</h3>
        <p>
          Starts with ${START_CAPITAL} split evenly across the assets you pick below, then replays
          what would have happened using real historical closing prices. This is a backtest, not a
          forecast — past price moves don't predict future ones.
        </p>
      </div>

      <div className="portfolio__picker">
        {ASSETS.map((a) => (
          <button
            key={a.symbol}
            className={`chip ${selected.includes(a.symbol) ? "chip--on" : ""}`}
            onClick={() => toggle(a.symbol)}
          >
            {a.short}
          </button>
        ))}
      </div>

      <button className="btn" onClick={runBacktest} disabled={loading || selected.length === 0}>
        {loading ? "Running…" : "Run backtest"}
      </button>

      {error && <p className="portfolio__error">{error}</p>}

      {backtest && (
        <div className="portfolio__result">
          <div>
            <div className="portfolio__stat-label">Final value</div>
            <div className="portfolio__stat-value">${backtest.finalValue.toFixed(2)}</div>
          </div>
          <div>
            <div className="portfolio__stat-label">P/L</div>
            <div className={`portfolio__stat-value ${backtest.pnl >= 0 ? "up" : "down"}`}>
              {backtest.pnl >= 0 ? "+" : ""}
              ${backtest.pnl.toFixed(2)} ({backtest.pnlPct.toFixed(2)}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
