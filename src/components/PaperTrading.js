import React, { useEffect, useState } from "react";

export default function PaperTrading() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [secret, setSecret] = useState("");
  const [amount, setAmount] = useState("250");
  const [addFundsResult, setAddFundsResult] = useState(null);
  const [addingFunds, setAddingFunds] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch("/api/trade-status")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) {
            if (d.error) setError(d.error);
            else {
              setStatus(d);
              setError(null);
            }
          }
        })
        .catch(() => !cancelled && setError("Couldn't reach the trading account."));
    }
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function addFunds() {
    if (!secret || !amount) return;
    setAddingFunds(true);
    setAddFundsResult(null);
    try {
      const res = await fetch(
        `/api/add-funds?secret=${encodeURIComponent(secret)}&amount=${encodeURIComponent(amount)}`
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

  return (
    <div className="portfolio">
      <div className="portfolio__intro">
        <h3>Paper trading account (live, simulated money)</h3>
        <p>
          Connected to a real Alpaca paper-trading account. No real money is involved anywhere
          here — trades execute against real market prices with simulated funds.
        </p>
      </div>

      {error && <p className="portfolio__error">{error}</p>}
      {!status && !error && <p className="portfolio__error">Loading account…</p>}

      {status && (
        <>
          <div className="portfolio__result">
            <div>
              <div className="portfolio__stat-label">Cash</div>
              <div className="portfolio__stat-value">
                {status.cash != null ? `$${status.cash.toFixed(2)}` : "—"}
              </div>
            </div>
            <div>
              <div className="portfolio__stat-label">Holdings value</div>
              <div className="portfolio__stat-value">
                {status.totalHoldingsValue != null ? `$${status.totalHoldingsValue.toFixed(2)}` : "—"}
              </div>
            </div>
          </div>

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
        <h4>Add funds (simulated)</h4>
        <p className="add-funds__note">
          This is not a real bank connection — it adds simulated money to your Alpaca paper
          account only, split evenly across the basket. Your trade secret is only kept in this
          page's memory, never saved or committed anywhere.
        </p>
        <input
          type="password"
          placeholder="Trade secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="add-funds__input"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="add-funds__input"
        />
        <button className="btn" onClick={addFunds} disabled={addingFunds || !secret || !amount}>
          {addingFunds ? "Adding…" : "Add funds"}
        </button>
        {addFundsResult && (
          <p className={addFundsResult.ok ? "portfolio__stat-value up" : "portfolio__error"}>
            {addFundsResult.message}
          </p>
        )}
      </div>
    </div>
  );
}