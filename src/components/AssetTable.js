import React, { useEffect, useState } from "react";
import { TRADE_BASKET } from "../assets";
import { useTradeSecret } from "../useTradeSecret";

export default function AssetTable() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [busySymbol, setBusySymbol] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [message, setMessage] = useState(null);
  const [typedSecret, setTypedSecret] = useState("");

  const ts = useTradeSecret();

  function load() {
    fetch("/api/trade-status")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : (setStatus(d), setError(null))))
      .catch(() => setError("Couldn't reach the trading account."));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  async function act(action, symbol) {
    const secret = ts.secret;
    const amount = parseFloat(amounts[symbol]);
    if (!secret || !amount || amount <= 0) return;
    setBusySymbol(symbol);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/${action}?secret=${encodeURIComponent(secret)}&symbol=${symbol}&amount=${amount}`
      );
      const data = await res.json();
      if (data.error) setMessage({ ok: false, text: data.error });
      else {
        setMessage({
          ok: true,
          text:
            action === "asset-fund"
              ? `Added $${amount} to ${symbol}.`
              : `Banked $${amount} from ${symbol}.`,
        });
        load();
      }
    } catch (e) {
      setMessage({ ok: false, text: "Request failed." });
    } finally {
      setBusySymbol(null);
    }
  }

  const rows = status?.allHoldings || TRADE_BASKET.map((a) => ({ symbol: a.symbol, marketValue: 0, banked: 0 }));

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>Assets</h3>
        <p>Per-asset breakdown, with manual add-funds and bank-profit controls for each.</p>
      </div>

      {error && <p className="portfolio__error">{error}</p>}
      {ts.error && <p className="portfolio__error">{ts.error}</p>}

      {!ts.hasSaved && (
        <>
          <input
            type="password"
            placeholder="Trade secret (saved once on this device)"
            value={typedSecret}
            onChange={(e) => setTypedSecret(e.target.value)}
            className="add-funds__input"
          />
          <button
            className="btn"
            disabled={ts.busy || !typedSecret}
            onClick={() => ts.saveWithBiometric(typedSecret)}
          >
            {ts.busy ? "Setting up…" : "Save & enable biometric unlock"}
          </button>
        </>
      )}

      {ts.hasSaved && !ts.secret && (
        <button className="btn" disabled={ts.busy} onClick={() => ts.unlock()}>
          {ts.busy ? "Checking…" : "🔓 Unlock with biometric"}
        </button>
      )}

      {ts.hasSaved && ts.secret && (
        <button className="btn btn--small" onClick={ts.lock} style={{ marginBottom: 10 }}>
          Lock
        </button>
      )}

      {message && (
        <p className={message.ok ? "portfolio__stat-value up" : "portfolio__error"}>{message.text}</p>
      )}

      <div className="asset-table">
        <div className="asset-table__head">
          <span>Asset</span>
          <span>Current Value</span>
          <span>Banked</span>
          <span>Amount</span>
          <span></span>
        </div>
        {rows.map((h) => (
          <div className="asset-table__row" key={h.symbol}>
            <span className="asset-table__symbol">{h.symbol}</span>
            <span>${h.marketValue.toFixed(2)}</span>
            <span className="up">${h.banked.toFixed(2)}</span>
            <input
              type="number"
              placeholder="$"
              className="asset-table__amount"
              value={amounts[h.symbol] || ""}
              onChange={(e) => setAmounts({ ...amounts, [h.symbol]: e.target.value })}
            />
            <span className="asset-table__actions">
              <button
                className="btn btn--small"
                disabled={busySymbol === h.symbol || !ts.secret}
                onClick={() => act("asset-fund", h.symbol)}
              >
                Add to fund
              </button>
              <button
                className="btn btn--small"
                disabled={busySymbol === h.symbol || !ts.secret}
                onClick={() => act("asset-bank", h.symbol)}
              >
                Add to bank
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
