import React, { useEffect, useState } from "react";
import { useTradeSecret } from "../useTradeSecret";

const MIN = 0.25;
const MAX = 4;
const STEP = 0.25;

// Sensitivity dial on the doubling-tier take-profit rule: multiplies the
// bank increment computed by trade-run.js (live) and
// CombinedCycleStrategy.js (backtest), so both always agree. 1x is the
// standard $50/$50 schedule; below 1x banks smaller amounts more often,
// above 1x banks larger amounts less often.
export default function BankScaleControl({ basket, title = "Bank sensitivity" }) {
  const [scale, setScale] = useState(1);
  const [saved, setSaved] = useState(1);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [typedSecret, setTypedSecret] = useState("");
  const ts = useTradeSecret();

  useEffect(() => {
    fetch(`/api/bank-scale?basket=${basket}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setScale(d.scale);
          setSaved(d.scale);
        }
      })
      .catch(() => {});
  }, [basket]);

  async function save() {
    const secret = ts.secret;
    if (!secret) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/bank-scale?basket=${basket}&action=set&scale=${scale}&secret=${encodeURIComponent(secret)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSaved(data.scale);
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
          Multiplies the bank increment for this basket's strategy — 1x is the standard $50/$50
          doubling schedule. Applies to both live trading and the backtest above.
        </p>
      </div>

      {error && <p className="portfolio__error">{error}</p>}
      {ts.error && <p className="portfolio__error">{ts.error}</p>}

      <div className="bank-scale__row">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          disabled={!ts.secret}
          className="bank-scale__slider"
        />
        <span className="bank-scale__value">{scale.toFixed(2)}x</span>
      </div>

      {ts.secret && saved !== scale && (
        <p className="add-funds__note">Saved value is {saved.toFixed(2)}x — click save to apply.</p>
      )}

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
        <button className="btn" onClick={save} disabled={busy || saved === scale}>
          {busy ? "Saving…" : "Save sensitivity"}
        </button>
      )}
    </div>
  );
}
