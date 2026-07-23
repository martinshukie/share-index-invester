import React, { useMemo, useState } from "react";
import PriceChart from "./PriceChart";
import { TRADE_BASKET, fetchQuote } from "../assets";

const START_STAKE = 250;
const TIER1_TARGET = 300;
const TIER1_BANK = 50;
const TIER1_CEILING = 500;
const TIER2_BANK_THRESHOLD = 1000;

// Replays the tiered rule against real historical closes for every asset in
// the basket at once. Profit-taking is triggered off the COMBINED value
// across the whole basket, not each asset separately - so a winner can
// offset a loser instead of each being judged in isolation.
function runTieredBacktest(seriesBySymbol, symbols) {
  const usable = symbols.filter((s) => seriesBySymbol[s]?.length > 1);
  if (usable.length === 0) return null;

  const n = usable.length;
  const shares = {};
  usable.forEach((s) => {
    shares[s] = START_STAKE / n / seriesBySymbol[s][0].close;
  });

  let banked = 0;
  let tier2CycleStart = null;
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

    if (wealth < TIER1_CEILING) {
      if (currentValue >= TIER1_TARGET) {
        banked += TIER1_BANK;
        const reinvestValue = currentValue - TIER1_BANK;
        usable.forEach((s) => {
          shares[s] = reinvestValue / n / seriesBySymbol[s][i].close;
        });
        events.push({ t, type: "tier1-bank", banked: TIER1_BANK, reinvested: reinvestValue });
      }
    } else {
      if (tier2CycleStart === null) tier2CycleStart = currentValue;
      if (currentValue >= tier2CycleStart * 2) {
        if (currentValue < TIER2_BANK_THRESHOLD) {
          usable.forEach((s) => {
            shares[s] = currentValue / n / seriesBySymbol[s][i].close;
          });
          tier2CycleStart = currentValue;
          events.push({ t, type: "tier2-reinvest", value: currentValue });
        } else {
          const bankAmt = currentValue * 0.5;
          banked += bankAmt;
          const reinvestValue = currentValue - bankAmt;
          usable.forEach((s) => {
            shares[s] = reinvestValue / n / seriesBySymbol[s][i].close;
          });
          tier2CycleStart = reinvestValue;
          events.push({ t, type: "tier2-bank", banked: bankAmt, reinvested: reinvestValue, totalBanked: banked });
        }
      }
    }
  }

  const finalPositionValue = usable.reduce(
    (sum, s) => sum + shares[s] * seriesBySymbol[s][maxLen - 1].close,
    0
  );

  return { wealthSeries, events, banked, finalPositionValue, usedSymbols: usable };
}

export default function CombinedCycleStrategy({ range }) {
  const [selected, setSelected] = useState(TRADE_BASKET.map((a) => a.symbol));
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
        <h3>Combined basket strategy (tiered)</h3>
        <p>
          $250 split evenly across the basket. Below $500 total: bank $50 whenever the combined
          position hits $300, reinvest the rest evenly. From $500 up: double-then-bank-50%-at-
          $1,000, repeating. Profit-taking is based on the combined total, so gains in one asset
          can offset losses in another.
        </p>
      </div>

      <div className="portfolio__picker">
        {TRADE_BASKET.map((a) => (
          <button
            key={a.symbol}
            className={`chip ${selected.includes(a.symbol) ? "chip--on" : ""}`}
            onClick={() => toggle(a.symbol)}
          >
            {a.symbol}
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
                <li className="cycle-events__empty">No trigger happened in this range yet.</li>
              )}
              {result.events.map((e, i) => (
                <li key={i}>
                  <span className="cycle-events__date">{new Date(e.t).toLocaleDateString()}</span>{" "}
                  {e.type === "tier1-bank" && (
                    <>banked ${e.banked.toFixed(2)} (tier 1), reinvested ${e.reinvested.toFixed(2)}</>
                  )}
                  {e.type === "tier2-reinvest" && <>reinvested — value hit ${e.value.toFixed(2)}</>}
                  {e.type === "tier2-bank" && (
                    <>
                      banked ${e.banked.toFixed(2)} (tier 2), reinvested ${e.reinvested.toFixed(2)}{" "}
                      (total banked ${e.totalBanked.toFixed(2)})
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
