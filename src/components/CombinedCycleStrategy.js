import React, { useMemo, useState } from "react";
import PriceChart from "./PriceChart";
import { fetchQuote } from "../assets";

const START_STAKE = 250;

// Doubling-tier take-profit rule: bank a fixed amount every time the
// position climbs that same amount above its current base. Once total
// wealth (banked + invested) crosses the current tier ceiling, both the
// ceiling AND the bank increment double for the next tier.
//   Tier 1: bank $50 per $50 climb, until wealth hits $500
//   Tier 2: bank $100 per $100 climb, until wealth hits $1,000
//   Tier 3: bank $200 per $200 climb, until wealth hits $2,000
//   ...continues doubling indefinitely
function runTieredBacktest(seriesBySymbol, symbols) {
  const usable = symbols.filter((s) => seriesBySymbol[s]?.length > 1);
  if (usable.length === 0) return null;

  const n = usable.length;
  const shares = {};
  usable.forEach((s) => {
    shares[s] = START_STAKE / n / seriesBySymbol[s][0].close;
  });

  let banked = 0;
  let cycleStartValue = START_STAKE;
  const events = [];
  const wealthSeries = [];
  const maxLen = Math.min(...usable.map((s) => seriesBySymbol[s].length));

  for (let i = 0; i < maxLen; i++) {
    const t = seriesBySymbol[usable[0]][i].t;
    const currentValue = usable.reduce(
      (sum, s) => sum + shares[s] * seriesBySymbol[s][i].close,
      0
    );
    const wealth = banked + currentValue;
    wealthSeries.push({ t, close: wealth });

    let tierCeiling = START_STAKE * 2;
    while (wealth >= tierCeiling) tierCeiling *= 2;
    const bankIncrement = tierCeiling / 10;

    if (currentValue >= cycleStartValue + bankIncrement) {
      banked += bankIncrement;
      const reinvestValue = currentValue - bankIncrement;
      usable.forEach((s) => {
        shares[s] = reinvestValue / n / seriesBySymbol[s][i].close;
      });
      cycleStartValue = reinvestValue;
      events.push({ t, type: "bank", banked: bankIncrement, reinvested: reinvestValue, tierCeiling, totalBanked: banked });
    }
  }

  const finalPositionValue = usable.reduce(
    (sum, s) => sum + shares[s] * seriesBySymbol[s][maxLen - 1].close,
    0
  );

  return { wealthSeries, events, banked, finalPositionValue, usedSymbols: usable };}

export default function CombinedCycleStrategy({ range, basket, title = "Combined basket strategy (tiered)" }) {
  const [selected, setSelected] = useState(basket.map((a) => a.symbol));
  const [seriesBySymbol, setSeriesBySymbol] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEvents, setShowEvents] = useState(false);

  function toggle(symbol) {
    setSelected((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }

  async function run() {
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
      setError("Couldn't load historical data for one or more assets.");
    } finally {
      setLoading(false);
    }
  }

  const result = useMemo(
    () => runTieredBacktest(seriesBySymbol, selected),
    [seriesBySymbol, selected]
  );

  const totalWealth = result ? result.banked + result.finalPositionValue : null;
  const totalReturn = result ? ((totalWealth - START_STAKE) / START_STAKE) * 100 : null;

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>{title}</h3>
        <p>
          $250 split evenly across the basket. Bank a fixed amount every time the combined
          position climbs that same amount above its base — starting at $50 per $50. Each time
          total wealth crosses the current tier ($500, then $1,000, then $2,000...), both the
          ceiling and the bank amount double for the next tier.
        </p>
      </div>

      <div className="portfolio__picker">
        {basket.map((a) => (
          <button
            key={a.symbol}
            className={`chip ${selected.includes(a.symbol) ? "chip--on" : ""}`}
            onClick={() => toggle(a.symbol)}
          >{a.symbol}
          </button>
        ))}
      </div>

      <button className="btn" onClick={run} disabled={loading || selected.length === 0}>
        {loading ? "Running…" : "Run backtest"}
      </button>

      {error && <p className="portfolio__error">{error}</p>}

      {result && (
        <>
          <div style={{ marginTop: 16 }}>
            <PriceChart series={result.wealthSeries} label="Total wealth (banked + invested)" />
          </div>

          <div className="portfolio__result">
            <div>
              <div className="portfolio__stat-label">Banked</div>
              <div className="portfolio__stat-value">${result.banked.toFixed(2)}</div>
            </div>
            <div>
              <div className="portfolio__stat-label">Still invested</div>
              <div className="portfolio__stat-value">${result.finalPositionValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="portfolio__stat-label">Total return</div>
              <div className={`portfolio__stat-value ${totalReturn >= 0 ? "up" : "down"}`}>
                {totalReturn >= 0 ? "+" : ""}
                {totalReturn.toFixed(2)}%
              </div>
            </div>
          </div>

          <button className="btn" style={{ marginTop: 16 }} onClick={() => setShowEvents((s) => !s)}>
            {showEvents ? "Hide" : "Show"} events ({result.events.length})
          </button>

          {showEvents && (
            <ul className="cycle-events">
              {result.events.length === 0 && (
                <li className="cycle-events__empty">No bank event happened in this range yet.</li>
              )}
              {result.events.map((e, i) => (
                <li key={i}>
                  <span className="cycle-events__date">{new Date(e.t).toLocaleDateString()}</span>{" "}
                  banked ${e.banked.toFixed(2)} (tier ceiling ${e.tierCeiling}), reinvested $
                  {e.reinvested.toFixed(2)} (total banked ${e.totalBanked.toFixed(2)})
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
