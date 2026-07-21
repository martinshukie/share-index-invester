import React from "react";

const W = 640;
const H = 240;
const PAD = 24;

export default function PriceChart({ series, label, unit }) {
  if (!series || series.length < 2) {
    return <div className="chart-empty">No data yet</div>;
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

  const first = closes[0];
  const last = closes[closes.length - 1];
  const up = last >= first;
  const pctChange = ((last - first) / first) * 100;

  const areaPath =
    path +
    ` L${points[points.length - 1][0].toFixed(1)},${H - PAD} L${points[0][0].toFixed(1)},${H - PAD} Z`;

  const startDate = new Date(series[0].t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(series[series.length - 1].t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="price-chart">
      <div className="price-chart__head">
        <div>
          <div className="price-chart__label">{label}</div>
          <div className="price-chart__price">
            {last.toFixed(2)}
            {unit ? <span className="price-chart__unit"> / {unit}</span> : null}
          </div>
        </div>
        <div className={`price-chart__change ${up ? "up" : "down"}`}>
          {up ? "▲" : "▼"} {Math.abs(pctChange).toFixed(2)}%
          <div className="price-chart__range">
            {startDate} – {endDate}
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="price-chart__svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill-${up ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? "#3fb68b" : "#e0575b"} stopOpacity="0.35" />
            <stop offset="100%" stopColor={up ? "#3fb68b" : "#e0575b"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#fill-${up ? "up" : "down"})`} stroke="none" />
        <path d={path} fill="none" stroke={up ? "#3fb68b" : "#e0575b"} strokeWidth="2" />
      </svg>
    </div>
  );
}
