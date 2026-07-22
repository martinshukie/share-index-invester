// Executes the take-profit / reinvestment cycle against a real Alpaca
// PAPER trading account (simulated money, real market behavior).
//
// Rule (mirrors src/components/CycleStrategy.js):
//  - no position yet -> open one with $250
//  - position value >= 2x its cost basis (doubled) -> close it, realizing
//    the value as cash
//      - if that value is under $1,000 -> reinvest all of it, keep doubling
//      - if it's $1,000 or more -> bank 50% as cash, reinvest the other 50%
//  - otherwise -> hold, do nothing
//
// This endpoint must be called by something on a schedule (see
// PAPER_TRADING_SETUP.md) - it does not run on its own. It requires a
// ?secret= query param matching TRADE_CRON_SECRET so random visitors can't
// trigger trades on your account.

const TRADE_SYMBOL = "GLD"; // Gold ETF - Alpaca can't trade futures (GC=F) directly
const START_NOTIONAL = 250;
const BANK_THRESHOLD = 1000;

function alpacaHeaders() {
  return {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
    "Content-Type": "application/json",
  };
}

async function getPosition(base, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, { headers: alpacaHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`position fetch failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function closePosition(base, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, {
    method: "DELETE",
    headers: alpacaHeaders(),
  });
  if (!r.ok) throw new Error(`close position failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function buyNotional(base, symbol, notional) {
  const r = await fetch(`${base}/v2/orders`, {
    method: "POST",
    headers: alpacaHeaders(),
    body: JSON.stringify({
      symbol,
      notional: notional.toFixed(2),
      side: "buy",
      type: "market",
      time_in_force: "day",
    }),
  });
  if (!r.ok) throw new Error(`buy order failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (!process.env.TRADE_CRON_SECRET || secret !== process.env.TRADE_CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
    res.status(500).json({ error: "Alpaca API keys not configured" });
    return;
  }

  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";

  try {
    const position = await getPosition(base, TRADE_SYMBOL);

    if (!position) {
      const order = await buyNotional(base, TRADE_SYMBOL, START_NOTIONAL);
      res.status(200).json({ action: "opened_initial_position", notional: START_NOTIONAL, order });
      return;
    }

    const marketValue = parseFloat(position.market_value);
    const cycleStartValue = parseFloat(position.cost_basis);

    if (marketValue < cycleStartValue * 2) {
      res.status(200).json({
        action: "hold",
        marketValue,
        cycleStartValue,
        neededToDouble: cycleStartValue * 2,
      });
      return;
    }

    await closePosition(base, TRADE_SYMBOL);
    const currentValue = marketValue;

    if (currentValue < BANK_THRESHOLD) {
      const order = await buyNotional(base, TRADE_SYMBOL, currentValue);
      res.status(200).json({ action: "reinvested_full", value: currentValue, order });
    } else {
      const bankAmt = currentValue * 0.5;
      const reinvestAmt = currentValue - bankAmt;
      const order = await buyNotional(base, TRADE_SYMBOL, reinvestAmt);
      res.status(200).json({
        action: "banked_and_reinvested",
        banked: bankAmt,
        reinvested: reinvestAmt,
        order,
      });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}