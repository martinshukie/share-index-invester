import React, { useEffect, useState } from "react";
import { useTradeSecret } from "../useTradeSecret";
import { useUsdToAud, formatAud } from "../useUsdToAud";

export default function PaperTrading({ basket = "main", title = "Paper trading account (live, simulated money)" }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("250");
  const [addFundsResult, setAddFundsResult] = useState(null);
  const [addingFunds, setAddingFunds] = useState(false);
  const [typedSecret, setTypedSecret] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const ts = useTradeSecret();
  const { rate: usdToAud, error: fxError } = useUsdToAud();
  const aud = (usd) => formatAud(usdToAud, usd);

  const load = React.useCallback(() => {
    fetch(`/api/trade-status?basket=${basket}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setStatus(d);
          setError(null);
        }
      })
      .catch(() => setError("Couldn't reach the trading account."));
  }, [basket]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  async function addFunds() {
    const secret = ts.secret;
    if (!secret || !amount) return;
    setAddingFunds(true);
    setAddFundsResult(null);
    try {
      const res = await fetch(
        `/api/add-funds?secret=${encodeURIComponent(secret)}&amount=${encodeURIComponent(amount)}&basket=${basket}`
      );
      const data = await res.json();
      if (data.error) setAddFundsResult({ ok: false, message: data.error });
      else
        setAddFundsResult({
          ok: true,
          message: `Added $${data.amount} — split $${data.perAsset.toFixed(2)} across ${
            data.orders.length
          } assets.`,
        });
    } catch (e) {
      setAddFundsResult({ ok: false, message: "Request failed." });
    } finally {
      setAddingFunds(false);
    }
  }

  async function resetBasket() {
    const secret = ts.secret;
    if (!secret) return;
    const warning =
      "This will sell all paper positions in this basket back to cash and zero its banked total (simulated money only). This cannot be undone. Continue?";
    if (!window.confirm(warning)) return;
    setResetting(true);
    setResetResult(null);
    try {
      const res = await fetch(
        `/api/reset-basket?secret=${encodeURIComponent(secret)}&basket=${basket}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.error) setResetResult({ ok: false, message: data.error });
      else {
        setResetResult({ ok: true, message: "Basket reset — positions closed and banked total zeroed." });
        load();
      }
    } catch (e) {
      setResetResult({ ok: false, message: "Request failed." });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>{title}</h3>
        {status && (
          <p className={`mode-badge ${status.isLive ? "mode-badge--live" : "mode-badge--paper"}`}>
            {status.isLive ? "🔴 LIVE — REAL MONEY" : "🟢 Paper trading — simulated money"}
          </p>
        )}
        <p>
          {status?.isLive
            ? "This account is trading with real money. All the same logic applies, but gains and losses here are real."
            : "Connected to a real Alpaca paper-trading account. No real money is involved anywhere here — trades execute against real market prices with simulated funds."}
        </p>
      </div>

      {error && <p className="portfolio__error">{error}</p>}
      {!status && !error && <p className="portfolio__error">Loading account…</p>}

      {status && (
        <>
          <div className="portfolio__result">
            <div>
              <div className="portfolio__stat-label">Cash used</div>
              <div className="portfolio__stat-value">
                {status.totalHoldingsValue != null ? `$${status.totalHoldingsValue.toFixed(2)}` : "—"}
              </div>
              {aud(status.totalHoldingsValue) && (
                <div className="portfolio__stat-aud">{aud(status.totalHoldingsValue)}</div>
              )}
            </div>
            <div>
              <div className="portfolio__stat-label">Strategy banked</div>
              <div className="portfolio__stat-value up">
                {status.strategyBanked != null ? `$${status.strategyBanked.toFixed(2)}` : "—"}
              </div>
              {aud(status.strategyBanked) && <div className="portfolio__stat-aud">{aud(status.strategyBanked)}</div>}
            </div>
            <div>
              <div className="portfolio__stat-label">Total wealth</div>
              <div className="portfolio__stat-value up">
                {status.strategyWealth != null ? `$${status.strategyWealth.toFixed(2)}` : "—"}
              </div>
              {aud(status.strategyWealth) && <div className="portfolio__stat-aud">{aud(status.strategyWealth)}</div>}
            </div>
          </div>
          {usdToAud != null && (
            <p className="add-funds__note" style={{ marginTop: 10 }}>
              All trading is in USD (Alpaca is a US brokerage) — AUD figures are a live reference
              conversion only (1 USD ≈ {usdToAud.toFixed(4)} AUD), not a separate balance.
            </p>
          )}
          {fxError && (
            <p className="add-funds__note" style={{ marginTop: 10 }}>
              AUD conversion unavailable right now ({fxError}) — figures above are USD only.
            </p>
          )}

          {status.recentOrders?.length > 0 && (
            <ul className="cycle-events" style={{ marginTop: 20 }}>
              {status.recentOrders.map((o) => (
                <li key={o.id}>
                  <span className="cycle-events__date">
                    {new Date(o.submittedAt).toLocaleString()}
                  </span>{" "}
                  {o.side} {o.symbol} — {o.status}
                  {o.filledAvgPrice ? ` @ $${parseFloat(o.filledAvgPrice).toFixed(2)}` : ""}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="add-funds">
        <h4>{status?.isLive ? "Add funds" : "Add funds (simulated)"}</h4>

        {status?.isLive ? (
          <>
            <p className="add-funds__note">
              This app never moves real money in or out of your account — deposits and
              withdrawals on a live account have to go through Alpaca directly, where your
              identity and bank link are already verified. Open your Alpaca dashboard, add
              funds there, then come back — the strategy uses whatever cash is available.
            </p>
            <a
              className="btn"
              href="https://app.alpaca.markets/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Alpaca dashboard ↗
            </a>
          </>
        ) : (
          <p className="add-funds__note">
            This is not a real bank connection — it adds simulated money to this basket only,
            split evenly across it.
          </p>
        )}

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

        {!status?.isLive && ts.hasSaved && ts.secret && (
          <>
            <input
              type="number"
              placeholder="Amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="add-funds__input"
            />
            {aud(parseFloat(amount)) && (
              <p className="add-funds__note" style={{ marginTop: -6 }}>
                ${amount} USD ≈ {aud(parseFloat(amount))}
              </p>
            )}
            <button className="btn" onClick={addFunds} disabled={addingFunds || !amount}>
              {addingFunds ? "Adding…" : "Add funds"}
            </button>{" "}
            {addFundsResult && (
              <p className={addFundsResult.ok ? "portfolio__stat-value up" : "portfolio__error"}>
                {addFundsResult.message}
              </p>
            )}
          </>
        )}

        {ts.hasSaved && ts.secret && (
          <button className="btn btn--small" onClick={ts.lock}>
            Lock
          </button>
        )}

        {ts.hasSaved && (
          <p style={{ marginTop: 10 }}>
            <button
              className="btn btn--small"
              onClick={() => {
                if (window.confirm("Forget the saved secret on this device?")) ts.forget();
              }}
            >
              Forget saved secret
            </button>
          </p>
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--hairline)" }}>
          <h4>Reset basket</h4>
          {status?.isLive ? (
            <>
              <p className="add-funds__note">
                This app won't sell real positions automatically. To reset this basket, sell it
                yourself in the Alpaca dashboard — the strategy reopens from scratch on its next
                run once it sees no held positions.
              </p>
              <a
                className="btn btn--small"
                href="https://app.alpaca.markets/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Alpaca dashboard ↗
              </a>
            </>
          ) : (
            <>
              <p className="add-funds__note">
                Sells all current positions in this basket back to cash and zeroes its banked
                total. The strategy starts this basket over from scratch on its next run.
              </p>
              {ts.secret ? (
                <button
                  className="btn btn--small"
                  style={{ background: "var(--down)" }}
                  onClick={resetBasket}
                  disabled={resetting}
                >
                  {resetting ? "Resetting…" : "Reset basket"}
                </button>
              ) : (
                <p className="add-funds__note">
                  {ts.hasSaved ? "Unlock above to use this." : "Save the trade secret above to use this."}
                </p>
              )}
            </>
          )}
          {resetResult && (
            <p className={resetResult.ok ? "portfolio__stat-value up" : "portfolio__error"}>
              {resetResult.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
