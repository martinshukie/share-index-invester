// Executes the doubling-tier take-profit rule against a real Alpaca PAPER
// trading account, for ONE of two fully independent baskets selected via
// ?basket=main or ?basket=ai.
//
// Rule (mirrors src/components/CombinedCycleStrategy.js):
//  - no positions yet in this basket -> open $250 split evenly across it
//  - otherwise: bank a fixed amount every time the basket's combined value
//    climbs that same amount above its current base - starting at $50 per
//    $50. Each time total wealth (banked + invested) crosses the current
//    tier ceiling ($500, then $1,000, then $2,000...), both the ceiling
//    and the bank amount double for the next tier. No external database
//    is used - the tier is recalculated fresh each run from the current
//    banked total and position value, so it's always correct without
//    needing to persist state between runs.
//
// "Total banked" is reconstructed by reading order history for orders
// tagged with a bank-<amount>-<symbol>-<timestamp> client_order_id,
// filtered to this basket's own symbols.
//
// Requires a ?secret= query param matching TRADE_CRON_SECRET.

const BASKETS = {
  main: ["GLD", "USO", "AAPL", "MSFT", "NVDA", "XOM"],
  ai: ["NBIS", "CRWV", "AVGO"],
};

const START_STAKE = 250;

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

async function getTotalBanked(base, basketSymbols) {
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
      const symbol = parts[2];
      if (!isNaN(amt) && basketSymbols.includes(symbol)) total += amt;
    }
  }
  return total;
}

async function closeAndReopenEvenly(base, basketSymbols, heldSymbols, reinvestValue, bankAmount) {
  await Promise.all(heldSymbols.map((s) => closePosition(base, s)));
  const perAsset = reinvestValue / basketSymbols.length;
  const perAssetBank = bankAmount ? bankAmount / basketSymbols.length : 0;
  const ts = Date.now();
  const orders = [];
  for (const symbol of basketSymbols) {
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

  const basketName = req.query.basket === "ai" ? "ai" : "main";
  const basketSymbols = BASKETS[basketName];
  const base = process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets";

  try {
    const positions = await Promise.all(basketSymbols.map((s) => getPosition(base, s)));
    const held = basketSymbols.filter((_, i) => positions[i] !== null);

    if (held.length === 0) {
      const perAsset = START_STAKE / basketSymbols.length;
      const orders = [];
      for (const symbol of basketSymbols) {
        orders.push(await buyNotional(base, symbol, perAsset));
      }
      res.status(200).json({ basket: basketName, action: "opened_initial_basket", notional: START_STAKE, orders });
      return;
    }

    const currentValue = positions.reduce((sum, p) => (p ? sum + parseFloat(p.market_value) : sum), 0);
    const cycleStartValue = positions.reduce((sum, p) => (p ? sum + parseFloat(p.cost_basis) : sum), 0);
    const totalBanked = await getTotalBanked(base, basketSymbols);
    const wealth = totalBanked + currentValue;

    let tierCeiling = START_STAKE * 2;
    while (wealth >= tierCeiling) tierCeiling *= 2;
    const bankIncrement = tierCeiling / 10;

    if (currentValue >= cycleStartValue + bankIncrement) {
      const reinvestValue = currentValue - bankIncrement;
      const orders = await closeAndReopenEvenly(base, basketSymbols, held, reinvestValue, bankIncrement);
      res.status(200).json({
        basket: basketName,
        action: "bank",
        banked: bankIncrement,
        reinvested: reinvestValue,
        totalBanked: totalBanked + bankIncrement,
        tierCeiling,
        orders,
      });
      return;
    }

    res.status(200).json({
      basket: basketName,
      action: "hold",
      currentValue,
      cycleStartValue,
      needed: cycleStartValue + bankIncrement,
      tierCeiling,
      bankIncrement,
      wealth,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
