// Executes the tiered take-profit / reinvestment cycle against a real
// Alpaca PAPER trading account (simulated money, real market behavior),
// across the whole basket at once (combined total, not per-asset).
//
// Rule (mirrors src/components/CombinedCycleStrategy.js):
//  - no positions yet -> open $250 split evenly across the basket
//  - combined wealth (banked + current basket value) under $500:
//      when the basket's current value hits $300, bank $50, reinvest the
//      rest evenly across the basket
//  - combined wealth $500 or more:
//      when the basket's current value doubles from its last reset,
//      reinvest fully and keep doubling; once value crosses $1,000, bank
//      50%, reinvest the other 50%, repeat
//  - otherwise -> hold, do nothing
//
// No external database is used. "Cycle start value" comes from Alpaca's
// own cost-basis on the held positions (accurate because every reset here
// fully closes and reopens the basket). "Total banked" is reconstructed by
// reading order history for orders tagged with a bank-<amount>-<timestamp>
// client_order_id, rather than trusting the account's raw cash balance
// (which starts with a large simulated cushion unrelated to this
// strategy).
//
// This endpoint must be called by something on a schedule (see
// PAPER_TRADING_SETUP.md) - it does not run on its own. It requires a
// ?secret= query param matching TRADE_CRON_SECRET so random visitors can't
// trigger trades on your account.

const TRADE_BASKET = ["GLD", "USO", "UNG", "AAPL", "MSFT", "NVDA", "XOM"];
const START_STAKE = 250;
const TIER1_TARGET = 300;
const TIER1_BANK = 50;
const TIER1_CEILING = 500;
const TIER2_BANK_THRESHOLD = 1000;

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
  if (!r.ok) throw new Error(`position fetch failed for ${symbol}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function closePosition(base, symbol) {
  const r = await fetch(`${base}/v2/positions/${symbol}`, {
    method: "DELETE",
    headers: alpacaHeaders(),
  });
  if (!r.ok) throw new Error(`close position failed for ${symbol}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function buyNotional(base, symbol, notional, clientOrderId) {
  const body = {
    symbol,
    notional: notional.toFixed(2),
    side: "buy",
    type: "market",
    time_in_force: "day",
  };
  if (clientOrderId) body.client_order_id = clientOrderId;
  const r = await fetch(`${base}/v2/orders`, {
    method: "POST",
    headers: alpacaHeaders(),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`buy order failed for ${symbol}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function getTotalBanked(base) {
  const r = await fetch(`${base}/v2/orders?status=all&limit=500&direction=desc`, {
    headers: alpacaHeaders(),
  });
  if (!r.ok) return 0;
  const orders = await r.json();
  let total = 0;
  for (const o of orders) {
    const id = o.client_order_id || "";
    if (id.startsWith("bank-")) {
      const parts = id.split("-");
      const amt = parseFloat(parts[1]);
      if (!isNaN(amt)) total += amt;
    }
  }
  return total;
}

async function closeAndReopenEvenly(base, heldSymbols, reinvestValue, bankAmount) {
  await Promise.all(heldSymbols.map((s) => closePosition(base, s)));
  const perAsset = reinvestValue / TRADE_BASKET.length;
  const perAssetBank = bankAmount ? bankAmount / TRADE_BASKET.length : 0;
  const ts = Date.now();
  const orders = [];
  for (const symbol of TRADE_BASKET) {
    const id = bankAmount ? `bank-${perAssetBank.toFixed(4)}-${symbol}-${ts}` : undefined;
    orders.push(await buyNotional(base, symbol, perAsset, id));
  }
  return orders;
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
    const positions = await Promise.all(TRADE_BASKET.map((s) => getPosition(base, s)));
    const held = TRADE_BASKET.filter((_, i) => positions[i] !== null);

    if (held.length === 0) {
      const perAsset = START_STAKE / TRADE_BASKET.length;
      const orders = [];
      for (const symbol of TRADE_BASKET) {
        orders.push(await buyNotional(base, symbol, perAsset));
      }
      res.status(200).json({ action: "opened_initial_basket", notional: START_STAKE, orders });
      return;
    }

    const currentValue = positions.reduce((sum, p) => (p ? sum + parseFloat(p.market_value) : sum), 0);
    const cycleStartValue = positions.reduce((sum, p) => (p ? sum + parseFloat(p.cost_basis) : sum), 0);
    const totalBanked = await getTotalBanked(base);
    const wealth = totalBanked + currentValue;

    if (wealth < TIER1_CEILING) {
      if (currentValue >= TIER1_TARGET) {
        const reinvestValue = currentValue - TIER1_BANK;
        const orders = await closeAndReopenEvenly(base, held, reinvestValue, TIER1_BANK);
        res.status(200).json({
          action: "tier1_bank",
          banked: TIER1_BANK,
          reinvested: reinvestValue,
          totalBanked: totalBanked + TIER1_BANK,
          orders,
        });
        return;
      }
      res.status(200).json({ action: "hold", tier: 1, currentValue, target: TIER1_TARGET, wealth });
      return;
    }

    if (currentValue >= cycleStartValue * 2) {
      if (currentValue < TIER2_BANK_THRESHOLD) {
        const orders = await closeAndReopenEvenly(base, held, currentValue, null);
        res.status(200).json({ action: "tier2_reinvest", value: currentValue, orders });
        return;
      }
      const bankAmt = currentValue * 0.5;
      const reinvestValue = currentValue - bankAmt;
      const orders = await closeAndReopenEvenly(base, held, reinvestValue, bankAmt);
      res.status(200).json({
        action: "tier2_bank",
        banked: bankAmt,
        reinvested: reinvestValue,
        totalBanked: totalBanked + bankAmt,
        orders,
      });
      return;
    }

    res.status(200).json({
      action: "hold",
      tier: 2,
      currentValue,
      cycleStartValue,
      neededToDouble: cycleStartValue * 2,
      wealth,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
