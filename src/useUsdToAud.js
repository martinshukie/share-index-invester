import { useEffect, useState } from "react";

// Alpaca is a US brokerage - every dollar figure in this app has always
// been USD, with no way to make the account itself operate in AUD. This
// is a live reference conversion for display only (via frankfurter.app,
// no API key needed), not a second balance - the strategy's actual
// numbers stay in USD.
export function useUsdToAud() {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    fetch("https://api.frankfurter.app/latest?from=USD&to=AUD")
      .then((r) => r.json())
      .then((d) => {
        if (d?.rates?.AUD) setRate(d.rates.AUD);
      })
      .catch(() => {});
  }, []);

  return rate;
}

export function formatAud(usdToAud, usdAmount) {
  if (usdToAud == null || usdAmount == null || Number.isNaN(usdAmount)) return null;
  return `A$${(usdAmount * usdToAud).toFixed(2)}`;
}
