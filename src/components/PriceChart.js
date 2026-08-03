import React from "react";

const W = 640;
const H = 240;
const PAD = 24;

export default function PriceChart({ series, label, unit, buyPrice, buyTime }) {
  if (!series || series.length < 2) {
    return <div className="chart-empty">No data yet</div>;
  }

  const closes = series.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const hasBuyMarker = buyPrice != null && Number.isFinite(buyPrice) && buyPrice > 0;
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

  let buyPoint = null;
  if (hasBuyMarker && buyTime != null && Number.isFinite(buyTime)) {
    let nearestIdx = 0;
    let nearestDiff = Infinity;
    series.forEach((p, i) => {
      const diff = Math.abs(p.t - buyTime);
      if (diff < nearestDiff) {
        nearestDiff = diff;
        nearestIdx = i;
      }
    });
    buyPoint = { x: points[nearestIdx][0], y: points[nearestIdx][1] };
  }

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
        {buyPoint && (
          <>
            <circle cx={buyPoint.x} cy={buyPoint.y} r="5" fill="#c9a227" stroke="#1a1a1a" strokeWidth="1.5" />
            <text
              x={Math.min(Math.max(buyPoint.x, PAD + 30), W - PAD - 30)}
              y={buyPoint.y > H / 2 ? buyPoint.y - 10 : buyPoint.y + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#c9a227"
            >
              Bought {buyPrice.toFixed(2)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
