// Thin wrapper around the browser's WebAuthn API, used here purely as a
// local biometric gate (Face ID / Windows Hello / fingerprint) - there's no
// backend verifying these assertions server-side, so this proves "someone
// unlocked this device," not a cryptographic identity check. That's a
// reasonable trade-off for a personal tool, not a bank-grade guarantee.

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToBuf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export function isWebAuthnSupported() {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export async function registerBiometric() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Builder", id: window.location.hostname },
      user: { id: userId, name: "builder-user", displayName: "Builder" },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none",
    },
  });
  return bufToBase64(cred.rawId);
}

export async function verifyBiometric(credentialIdB64) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: base64ToBuf(credentialIdB64), type: "public-key" }],
      userVerification: "required",
      timeout: 60000,
    },
  });
  return !!assertion;
}
