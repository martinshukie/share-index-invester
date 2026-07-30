// Central switch between PAPER and LIVE Alpaca trading. Deliberately
// requires TWO separate environment variables to both be set correctly
// before live (real money) mode activates - a single accidental change
// to one variable can't switch real trading on by itself.
//
// To go live, set BOTH of these in Vercel:
//   TRADING_MODE = live
//   LIVE_CONFIRM = I_UNDERSTAND_THIS_IS_REAL_MONEY   (exact text)
// Also required: APCA_LIVE_API_KEY_ID, APCA_LIVE_API_SECRET_KEY,
// APCA_LIVE_API_BASE_URL (should be https://api.alpaca.markets)
//
// Leaving TRADING_MODE unset, or set to anything other than "live", or
// leaving LIVE_CONFIRM unset/wrong, keeps everything on paper trading -
// this is the safe default and requires no action.

export function getAlpacaConfig() {
  const isLive =
    process.env.TRADING_MODE === "live" &&
    process.env.LIVE_CONFIRM === "I_UNDERSTAND_THIS_IS_REAL_MONEY";

  if (isLive) {
    return {
      isLive: true,
      base: process.env.APCA_LIVE_API_BASE_URL || "https://api.alpaca.markets",
      headers: {
        "APCA-API-KEY-ID": process.env.APCA_LIVE_API_KEY_ID,
        "APCA-API-SECRET-KEY": process.env.APCA_LIVE_API_SECRET_KEY,
        "Content-Type": "application/json",
      },
      keysConfigured: !!(process.env.APCA_LIVE_API_KEY_ID && process.env.APCA_LIVE_API_SECRET_KEY),
    };
  }

  return {
    isLive: false,
    base: process.env.APCA_API_BASE_URL || "https://paper-api.alpaca.markets",
    headers: {
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
      "Content-Type": "application/json",
    },
    keysConfigured: !!(process.env.APCA_API_KEY_ID && process.env.APCA_API_SECRET_KEY),
  };
}
