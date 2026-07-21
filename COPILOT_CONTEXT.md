# Project context (for GitHub Copilot / any AI assistant picking this up)

## What this app is
"Builder" is a markets research dashboard: gold, oil, natural gas, and a
handful of stocks, with real historical price charts and two rule-based
backtests. It is a **research/education tool**, not a live trading system.
There is intentionally no broker connection and no invented win-rate or
"probability of profit" anywhere in the code — every number shown comes
from replaying a deterministic rule against real historical price data
fetched from Yahoo Finance.

## Stack
- Create React App (react-scripts 5.0.1), plain JS, no extra UI/chart
  libraries — charts are hand-rolled SVG in `src/components/PriceChart.js`
- One Vercel serverless function, `api/quote.js`, proxies Yahoo Finance's
  public chart endpoint server-side. This exists specifically to avoid
  CORS errors and to avoid needing an API key. Do not remove or bypass it
  by calling Yahoo Finance directly from the frontend.
- No environment variables / secrets are used anywhere yet.

## File map
- `src/assets.js` — list of tracked symbols (`ASSETS`) and the `fetchQuote`
  helper the whole app uses to hit `/api/quote`. Add new symbols here to
  extend coverage (e.g. toward more of the S&P 500).
- `src/App.js` — top-level layout: ticker tape, asset tabs, range picker,
  chart, the two backtests. Polls `/api/quote` every 60s for live prices
  only (`REFRESH_MS`) — historical backtests are NOT re-run on that
  interval, only current price display is.
- `src/components/TickerTape.js` — scrolling current-price strip.
- `src/components/PriceChart.js` — dependency-free SVG line chart, reused
  for both raw price history and backtest "wealth over time" series.
- `src/components/Portfolio.js` — lets the user pick multiple assets,
  splits $250 evenly, backtests using real historical closes.
- `src/components/CycleStrategy.js` — implements a specific take-profit
  rule: start with $250, when position value doubles reinvest and keep
  doubling, once value crosses $1,000 bank 50% and reinvest 50%, repeat.
  This is deterministic — it replays real closes, no randomness, no
  assumed odds. See `runCycleStrategy()` for the exact logic.

## Guardrails to keep if extending this
- Don't add a "live trading" / real broker execution path without: (a) a
  proper backend to hold credentials (never in frontend code), (b) a
  paper-trading/sandbox environment first, (c) real risk controls
  (stop-loss, position sizing) rather than assumed win rates.
- Don't fabricate a win rate, "chance of profit," or similar probability
  claim anywhere in copy or code — only show numbers derived from actually
  replaying rules against historical data.
- Keep the "not financial advice" footer disclaimer intact if you touch
  `App.js`.

## Known gaps / good next steps
- Only 3 commodities + 4 stocks tracked (`ASSETS` in `assets.js`) — the
  long-term goal is broader coverage toward the top 500 stocks.
- No news/event correlation yet — that's a separate, larger feature.
- No automated tests yet.
