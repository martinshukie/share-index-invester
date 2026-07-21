import React from "react";

export default function TickerTape({ quotes }) {
  const items = Object.entries(quotes);
  if (items.length === 0) return null;

  // Duplicate the list so the CSS marquee loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="ticker-tape">
      <div className="ticker-tape__track">
        {loop.map(([symbol, q], i) => {
          const change =
            q.price != null && q.previousClose
              ? ((q.price - q.previousClose) / q.previousClose) * 100
              : null;
          const up = change != null && change >= 0;
          return (
            <span className="ticker-tape__item" key={symbol + i}>
              <span className="ticker-tape__sym">{symbol}</span>
              <span className="ticker-tape__price">
                {q.price != null ? q.price.toFixed(2) : "—"}
              </span>
              {change != null && (
                <span className={`ticker-tape__chg ${up ? "up" : "down"}`}>
                  {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
