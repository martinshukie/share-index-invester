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
  const [busy, setBusy] =
