import React, { useEffect, useState, useCallback } from "react";

const RANGES = ["1D", "1W", "1M", "6M", "1Y", "ALL"];

const W = 640;
const H = 220;
const PAD = 16;

function AreaChart({ series }) {
  if (!series || series.length < 2) {
    return <div className="chart-empty">No history yet — keep the strategy running a while</div>;
  }
  const closes = series.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const points = series.map((p, i) => {
    const x = PAD + (i / (series.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((p.close - min) / span) * (H - PAD * 2);
    return [x, y];
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath =
    path + ` L${points[points.length - 1][0].toFixed(1)},${H - PAD} L${points[0][0].toFixed(1)},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="holdings-chart__svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="holdings-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#holdings-fill)" stroke="none" />
      <path d={path} fill="none" stroke="#c9a227" strokeWidth="2" />
    </svg>
  );
}

export default function HoldingsScreen() {
  const [range, setRange] = useState("1M");
  const [history, setHistory] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    fetch(`/api/portfolio-history?range=${range}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setHistory(d.series)))
      .catch(() => setError("Couldn't load portfolio history"));

    fetch("/api/trade-status")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setStatus(d)))
      .catch(() => setError("Couldn't load holdings"));
  }, [range]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const totalValue = status ? status.cash + status.totalHoldingsValue : null;
  const firstValue = history && history.length > 0 ? history[0].close : null;
  const change = totalValue != null && firstValue ? totalValue - firstValue : null;
  const changePct = change != null && firstValue ? (change / firstValue) * 100 : null;

  return (
    <div className="holdings">
      <div className="holdings__header">
        <div className="holdings__label">Total portfolio value</div>
        {error && <div className="portfolio__error">{error}</div>}
        {totalValue != null ? (
          <div className="holdings__value">${totalValue.toFixed(2)}</div>
        ) : (
          <div className="holdings__value">—</div>
        )}
        {change != null && (
          <div className="holdings__badges">
            <span className={`holdings__badge ${change >= 0 ? "up" : "down"}`}>
              {change >= 0 ? "+" : ""}
              ${change.toFixed(2)}
            </span>
            <span className={`holdings__badge ${change >= 0 ? "up" : "down"}`}>
              {changePct >= 0 ? "+" : ""}
              {changePct.toFixed(2)}% ↗
            </span>
          </div>
        )}
      </div>

      <div className="holdings__ranges">
        {RANGES.map((r) => (
          <button
            key={r}
            className={`holdings__range-btn ${r === range ? "holdings__range-btn--on" : ""}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="holdings-chart">
        <AreaChart series={history} />
      </div>

      <div className="holdings-list">
        <div className="holdings-list__head">
          <span>Asset</span>
          <span>Portfolio %</span>
          <span>Holdings</span>
        </div>
        {status?.holdings?.length > 0 ? (
          status.holdings
            .slice()
            .sort((a, b) => b.marketValue - a.marketValue)
            .map((h) => {
              const pct = status.totalHoldingsValue ? (h.marketValue / status.totalHoldingsValue) * 100 : 0;
              return (
                <div className="holdings-list__row" key={h.symbol}>
                  <span className="holdings-list__symbol">{h.symbol}</span>
                  <span className="holdings-list__bar-wrap">
                    <span className="holdings-list__bar">
                      <span className="holdings-list__bar-fill" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="holdings-list__pct">{pct.toFixed(2)}%</span>
                  </span>
                  <span className="holdings-list__value">
                    {h.qty.toFixed(4)}
                    <br />
                    <span className="holdings-list__value-usd">${h.marketValue.toFixed(2)}</span>
                  </span>
                </div>
              );
            })
        ) : (
          <div className="holdings-list__empty">No holdings yet — waiting on the first trade.</div>
        )}
      </div>
    </div>
  );
}