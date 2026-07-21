import React, { useMemo, useState } from "react";
import PriceChart from "./PriceChart";

const START_STAKE = 250;
const BANK_THRESHOLD = 1000;

// Deterministic rule, run against real historical closes:
//  - hold a position
//  - when its value doubles from the start of the current cycle, reinvest
//    the full amount and keep doubling
//  - once the position's value crosses $1000, bank 50% and reinvest the
//    other 50%, then restart the doubling cycle
//  - repeat for the rest of the history
// This has no notion of "chance" - it just replays the rule against what
// prices actually did.
function runCycleStrategy(series) {
  if (!series || series.length < 2) return null;

  let shares = START_STAKE / series[0].close;
  let cycleStartValue = START_STAKE;
  const events = [];
  const wealthSeries = [];
  let banked = 0;

  for (const p of series) {
    const currentValue = shares * p.close;
    wealthSeries.push({ t: p.t, close: banked + currentValue });

    if (currentValue >= cycleStartValue * 2) {
      if (currentValue < BANK_THRESHOLD) {
        events.push({ t: p.t, type: "reinvest", value: currentValue });
        cycleStartValue = currentValue;
        // shares unchanged - full amount stays invested
      } else {
        const bankAmt = currentValue * 0.5;
        const reinvestAmt = currentValue - bankAmt;
        banked += bankAmt;
        shares = reinvestAmt / p.close;
        cycleStartValue = reinvestAmt;
        events.push({ t: p.t, type: "bank", banked: bankAmt, reinvested: reinvestAmt, totalBanked: banked });
      }
    }
  }

  const finalPositionValue = shares * series[series.length - 1].close;

  return { wealthSeries, events, banked, finalPositionValue };
}

export default function CycleStrategy({ series, label }) {
  const [showEvents, setShowEvents] = useState(false);
  const result = useMemo(() => runCycleStrategy(series), [series]);

  if (!result) return null;

  const totalWealth = result.banked + result.finalPositionValue;
  const totalReturn = ((totalWealth - START_STAKE) / START_STAKE) * 100;

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>Take-profit cycle backtest</h3>
        <p>
          $250 into {label}. Rule: when the position doubles, reinvest and keep doubling; once it
          crosses $1,000, bank 50% and restart. Replayed against real historical closes for this
          range — no assumed win rate, just what the rule would actually have done.
        </p>
      </div>

      <PriceChart series={result.wealthSeries} label="Total wealth (banked + invested)" />

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
        {showEvents ? "Hide" : "Show"} cycle events ({result.events.length})
      </button>

      {showEvents && (
        <ul className="cycle-events">
          {result.events.length === 0 && (
            <li className="cycle-events__empty">
              No doubling event happened in this range — the rule never triggered.
            </li>
          )}
          {result.events.map((e, i) => (
            <li key={i}>
              <span className="cycle-events__date">{new Date(e.t).toLocaleDateString()}</span>{" "}
              {e.type === "reinvest" ? (
                <>reinvested — value hit ${e.value.toFixed(2)}</>
              ) : (
                <>
                  banked ${e.banked.toFixed(2)}, reinvested ${e.reinvested.toFixed(2)} (total banked $
                  {e.totalBanked.toFixed(2)})
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
