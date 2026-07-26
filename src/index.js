// force redeploy
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// No service worker / offline caching - it caused stale-build errors after
// every deploy. This actively removes any previously-installed one so
// devices that already have it installed get cleaned up automatically.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}
if (window.caches) {
  caches.keys().then((names) => {
    names.forEach((name) => caches.delete(name));
  });
}
