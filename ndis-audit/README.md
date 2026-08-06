# NDIS Sole Trader Audit Pack

A self-contained web app holding everything needed to prepare for an NDIS
**Verification** audit as a sole trader: policies & procedures, the forms/
registers used to implement them, a one-page audit synopsis per policy, and
a client onboarding section. Plain HTML/CSS/JS — no build step, no
dependencies.

## Run it

Open `ndis-audit/index.html` directly in a browser, or serve it locally:

```
npx serve ndis-audit
```

## How it's organised

- **Overview** — an audit-readiness dashboard with adoption status counts.
- **Policies & Procedures** — 19 policies grouped under Governance &
  Operations, Rights & Safeguarding, and Provision of Supports. Each combines
  the policy statement with the day-to-day procedure, and links to the forms
  that implement it.
- **Forms, Registers & Templates** — the actual documents you fill in day to
  day (incident report form, complaints register, service agreement, etc.).
- **Policy Audit Synopsis** — a compact, one-glance summary per policy
  (purpose, key controls, evidence, review cycle) — handy to give an auditor.
- **Client Onboarding** — the referral-to-first-visit document set, plus a
  step-by-step onboarding checklist cross-referenced to the relevant policy.
- **Provider Details** — enter your business name, ABN and contact details
  once; they're saved in the browser (local storage only, nothing leaves
  your device) and auto-filled into every document via `{{TOKENS}}`.

Each document has a status control (Not started / Drafted / Reviewed /
Adopted), saved per-browser, and a Print / Save as PDF button.

## Important

This pack is built around the NDIS **Verification** pathway (Core Practice
Standards, document-based review) for a sole trader providing personal care
and community/household-task supports. The documents are templates to adapt,
not legal advice — confirm current requirements against the NDIS Practice
Standards and with your approved quality auditor before relying on them for
your actual audit. If you later add supports that require **Certification**
(e.g. specialist behaviour support, high-intensity daily personal
activities), you'll need additional Supplementary Module policies not
included here.
