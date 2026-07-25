import { useState, useEffect, useCallback } from "react";
import { isWebAuthnSupported, registerBiometric, verifyBiometric } from "./webauthn";

const SECRET_KEY = "builder_trade_secret";
const CRED_KEY = "builder_trade_cred_id";

// Manages the trade secret used to authorize live trading actions.
// First use: type the secret once, it's saved on this device and (if the
// device supports it) a biometric credential is registered.
// After that: tap "Unlock" and use Face ID / fingerprint / Windows Hello
// instead of retyping the secret.
export function useTradeSecret() {
  const [secret, setSecretState] = useState(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setHasSaved(!!localStorage.getItem(SECRET_KEY));
  }, []);

  const saveWithBiometric = useCallback(async (typedSecret) => {
    setError(null);
    setBusy(true);
    try {
      if (isWebAuthnSupported()) {
        try {
          const credId = await registerBiometric();
          localStorage.setItem(CRED_KEY, credId);
        } catch (e) {
          // Biometric setup declined or unavailable - still allow saving
          // the secret, just without the biometric gate.
        }
      }
      localStorage.setItem(SECRET_KEY, typedSecret);
      setSecretState(typedSecret);
      setHasSaved(true);
    } catch (e) {
      setError("Couldn't save on this device.");
    } finally {
      setBusy(false);
    }
  }, []);

  const unlock = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const credId = localStorage.getItem(CRED_KEY);
      if (credId && isWebAuthnSupported()) {
        await verifyBiometric(credId);
      }
      const stored = localStorage.getItem(SECRET_KEY);
      setSecretState(stored);
      return stored;
    } catch (e) {
      setError("Biometric check failed or was cancelled.");
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const lock = useCallback(() => setSecretState(null), []);

  const forget = useCallback(() => {
    localStorage.removeItem(SECRET_KEY);
    localStorage.removeItem(CRED_KEY);
    setSecretState(null);
    setHasSaved(false);
  }, []);

  return { secret, hasSaved, error, busy, saveWithBiometric, unlock, lock, forget };
}
