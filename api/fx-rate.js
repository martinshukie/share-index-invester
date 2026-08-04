// Serves the live USD->AUD rate server-side, since a browser fetch()
// straight to frankfurter.app from this app's own origin can be blocked
// by CORS (unlike a direct URL navigation, which isn't subject to it -
// that's why the API "worked" when tested directly but nothing showed
// up in the app). Every other external API call in this app already
// goes through a server-side function for the same reason.

export default async function handler(req, res) {
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD");
    if (!r.ok) throw new Error(`frankfurter.app request failed: ${r.status}`);
    const data = await r.json();
    const rate = data?.rates?.AUD;
    if (!rate) throw new Error("No AUD rate in response");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ usdToAud: rate });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
