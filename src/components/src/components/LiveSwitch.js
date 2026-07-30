import React, { useEffect, useState } from "react";
import { useTradeSecret } from "../useTradeSecret";

const CONFIRM_PHRASE = "I_UNDERSTAND_THIS_IS_REAL_MONEY";

// Global paper/live switch - affects BOTH baskets at once, since they
// share one underlying Alpaca account. Going live requires the trade
// secret AND typing the exact confirmation phrase; going back to paper
// only needs the secret, since retreating to safety should stay easy.
export default function LiveSwitch() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [typedSecret, setTypedSecret] = useState("");
  const ts = useTradeSecret();

  function load() {
    fetch("/api/trading-mode")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : (setStatus(d), setError(null))))
      .catch(() => setError("Couldn't check trading mode."));
  }

  useEffect(() => {
    load();
  }, []);

  async function goLive() {
    const secret = ts.secret;
    if (!secret || confirmText !== CONFIRM_PHRASE) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trading-mode?action=go-live&confirm=${encodeURIComponent(confirmText)}&secret=${encodeURIComponent(secret)}`
      );
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setStatus(data);
        setConfirmText("");
      }
    } catch (e) {
      setError("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function goPaper() {
    const secret = ts.secret;
    if (!secret) return;
    if (!window.confirm("Switch back to paper (simulated) trading?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trading-mode?action=go-paper&secret=${encodeURIComponent(secret)}`
      );
      const data = await res.json();
      if (data.error) setError(data.error);
      else setStatus(data);
    } catch (e) {
      setError("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>Live trading control</h3>
        <p>
          This switch affects BOTH baskets at once - they share one Alpaca account. Going live
          requires your live Alpaca API keys to already be set up in Vercel, and typing the exact
          confirmation phrase below.
        </p>
      </div>

      {status && (
        <p className={`mode-badge ${status.isLive ? "mode-badge--live" : "mode-badge--paper"}`}>
          {status.isLive ? "🔴 Currently LIVE — real money" : "🟢 Currently paper — simulated money"}
        </p>
      )}

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

      {ts.hasSaved && ts.secret && status && !status.isLive && (
        <div>
          <p className="add-funds__note">
            Type exactly <strong>{CONFIRM_PHRASE}</strong> to enable the Go Live button.
          </p>
          <input
            type="text"
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="add-funds__input"
          />
          <button
            className="btn"
            style={{ background: "var(--down)" }}
            onClick={goLive}
            disabled={busy || confirmText !== CONFIRM_PHRASE}
          >
            {busy ? "Switching…" : "Go Live — Trade Real Money"}
          </button>
        </div>
      )}

      {ts.hasSaved && ts.secret && status && status.isLive && (
        <button className="btn" onClick={goPaper} disabled={busy}>
          {busy ? "Switching…" : "Return to paper trading"}
        </button>
      )}
    </div>
  );
}
