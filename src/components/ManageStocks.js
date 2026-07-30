import React, { useEffect, useState } from "react";
import { useTradeSecret } from "../useTradeSecret";

export default function ManageStocks({ basket, title = "Manage stocks" }) {
  const [symbols, setSymbols] = useState([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [typedSecret, setTypedSecret] = useState("");
  const ts = useTradeSecret();

  function load() {
    fetch(`/api/baskets?basket=${basket}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : (setSymbols(d.symbols), setError(null))))
      .catch(() => setError("Couldn't load basket."));
  }

  useEffect(() => {
    load();
  }, [basket]);

  async function addSymbol() {
    const secret = ts.secret;
    const symbol = newSymbol.trim().toUpperCase();
    if (!secret || !symbol) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/baskets?basket=${basket}&action=add&symbol=${symbol}&secret=${encodeURIComponent(secret)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setSymbols(data.symbols);
        setNewSymbol("");
      }
    } catch (e) {
      setError("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function removeSymbol(symbol) {
    const secret = ts.secret;
    if (!secret) return;
    if (
      !window.confirm(
        `Remove ${symbol} from this basket? Any existing position stays as-is until the strategy next rebalances.`
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/baskets?basket=${basket}&action=remove&symbol=${symbol}&secret=${encodeURIComponent(secret)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSymbols(data.symbols);
    } catch (e) {
      setError("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>{title}</h3>
        <p>
          Add or remove stocks in this basket. Changes take effect the next time the strategy
          runs (every 15 minutes) - existing positions in a removed stock aren't automatically
          sold.
        </p>
      </div>

      {error && <p className="portfolio__error">{error}</p>}
      {ts.error && <p className="portfolio__error">{ts.error}</p>}

      <div className="portfolio__picker">
        {symbols.map((s) => (
          <span key={s} className="chip chip--on manage-stocks__chip">
            {s}
            {ts.secret && (
              <button
                onClick={() => removeSymbol(s)}
                disabled={busy}
                className="manage-stocks__remove"
                aria-label={`Remove ${s}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

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
        <div className="manage-stocks__add-row">
          <input
            type="text"
            placeholder="Symbol (e.g. TSLA)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            className="add-funds__input manage-stocks__input"
          />
          <button className="btn" onClick={addSymbol} disabled={busy || !newSymbol.trim()}>
            Add
          </button>
        </div>
      )}
    </div>
  );
}
