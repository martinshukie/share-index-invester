import { useEffect, useState } from "react";

// Alpaca is a US brokerage - every dollar figure in this app has always
// been USD, with no way to make the account itself operate in AUD. This
// is a live reference conversion for display only (via api/fx-rate.js,
// which fetches frankfurter.app server-side - a browser fetch() to it
// directly can be blocked by CORS, unlike a direct URL navigation which
// isn't subject to it), not a second balance - the strategy's actual
// numbers stay in USD.
export function useUsdToAud() {
  const [rate, setRate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/fx-rate")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else if (d.usdToAud) setRate(d.usdToAud);
      })
      .catch(() => setError("Couldn't reach the FX rate service."));
  }, []);

  return { rate, error };
}

export function formatAud(usdToAud, usdAmount) {
  if (usdToAud == null || usdAmount == null || Number.isNaN(usdAmount)) return null;
  return `A$${(usdAmount * usdToAud).toFixed(2)}`;
}
