import React, { useEffect, useState } from "react";
import { useTradeSecret } from "../useTradeSecret";
import { useUsdToAud, formatAud } from "../useUsdToAud";

export default function AssetTable({ basket = "main", symbols = [] }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [busySymbol, setBusySymbol] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [message, setMessage] = useState(null);
  const [typedSecret, setTypedSecret] = useState("");

  const ts = useTradeSecret();
  const { rate: usdToAud } = useUsdToAud();
  const aud = (usd) => formatAud(usdToAud, usd);

  function load() {
    fetch(`/api/trade-status?basket=${basket}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : (setStatus(d), setError(null))))
      .catch(() => setError("Couldn't reach the trading account."));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [basket]);

  async function act(action, symbol) {
    const secret = ts.secret;
    const amount = parseFloat(amounts[symbol]);
    if (!secret || !amount || amount <= 0) return;
    const verb = action === "asset-fund" ? "add" : "bank (sell)";
    const confirmMsg = status?.isLive
      ? `You are about to ${verb} $${amount} on ${symbol} with LIVE trading (REAL MONEY). Confirm?`
      : `${verb === "add" ? "Add" : "Bank"} $${amount} on ${symbol} (simulated paper money)?`;
    if (!window.confirm(confirmMsg)) return;
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

  const rows = status?.allHoldings || symbols.map((s) => ({ symbol: s, marketValue: 0, banked: 0, avgEntryPrice: 0 }));

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
          <span>Purchased At</span>
          <span>Banked</span>
          <span>Amount</span>
          <span></span>
        </div>
        {rows.map((h) => {
          const pct = h.costBasis > 0 ? (h.unrealizedPl / h.costBasis) * 100 : 0;
          const up = pct >= 0;
          return (
          <div className="asset-table__row" key={h.symbol}>
            <span className="asset-table__symbol">{h.symbol}</span>
            <span>
              ${h.marketValue.toFixed(2)}
              {h.costBasis > 0 && (
                <span className={`asset-table__pct ${up ? "up" : "down"}`}>
                  {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                </span>
              )}
              {aud(h.marketValue) && <span className="asset-table__aud">{aud(h.marketValue)}</span>}
            </span>
            <span>{h.avgEntryPrice ? `$${h.avgEntryPrice.toFixed(2)}` : "—"}</span>
            <span className="up">
              ${h.banked.toFixed(2)}
              {aud(h.banked) && <span className="asset-table__aud">{aud(h.banked)}</span>}
            </span>
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
          );
        })}
      </div>
    </div>
  );
}
