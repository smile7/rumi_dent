# Phase 09 — Consent, analytics, legal

**Goal:** privacy by default. Cookieless analytics needs no banner. A consent banner appears **only** when a non-essential cookie/tracker is configured (e.g. GA4). Legal pages are generated from templates plus the cookie registry.
**Read first:** `docs/LEGAL-GDPR.md` (all; note the "verify" items), `docs/PRD.md` (consent feature), `docs/SEO.md` §8 (web vitals tracking).
**Disclaimer:** templates are not legal advice. The client (or their lawyer) approves the final texts.

---

### T09.1 — Cookie registry, ConsentProvider, banner, preferences
**Steps**
1. `src/config/cookies.ts` per LEGAL-GDPR §3: every cookie/storage item/third party with `name`, `provider`, `purpose` (BG/EN message keys), `category` (`necessary | preferences | analytics | marketing | embeds`), `duration`, `enabledWhen(features/env)`. Derived helper `requiresConsent()` (true if any enabled item is non-necessary).
2. `ConsentProvider` (client): state in a first-party cookie `consent` (JSON: version, categories, timestamp; 6 months; `SameSite=Lax; Secure`), `version` bump re-asks. Exposes `useConsent()`, `openPreferences()`.
3. `CookieBanner`: only if `requiresConsent()` and no stored choice. Equal-prominence "Accept all" / "Reject all" / "Settings" buttons (no dark patterns, no pre-ticked boxes), not a modal wall (doesn't block reading), `role="region"` with label, appears after main content in DOM but visually bottom. `PreferencesDialog`: per-category switches (necessary locked on) with descriptions from the registry. Footer "Cookie settings" opens it (wire the T05.5 stub).
4. Withdrawal: as easy as giving consent (same dialog), and withdrawal deletes the category's cookies where possible (GA `_ga*`).
**AC:** With `NEXT_PUBLIC_ANALYTICS=cloudflare|umami|none` there is no banner and no non-essential cookie; with `ga4` the banner shows and nothing loads before consent; manual accessibility + keyboard check passes for banner and dialog.
**Done check:** unit tests for `requiresConsent()` per env config; Vitest render tests for the banner and dialog (shown only when consent is required, equal buttons, choice stored); manual check of `document.cookie` and the Network panel with both env configs.

### T09.2 — Analytics adapters and `track()`
**Steps:** `src/lib/analytics/` with `track(event, props?)` and adapters: `none`, `cloudflare` (Web Analytics beacon script, cookieless, no custom events, so `track` is a no-op), `umami` (script with `data-website-id`, `data-do-not-track="true"`; custom events via `umami.track`), `ga4` (Consent Mode v2 defaults per LEGAL-GDPR, load `gtag.js` only after analytics consent, IP anonymization is default in GA4, `send_page_view` via router events). An `<Analytics />` component in the layout picks the adapter by env. Event names: `call_click`, `directions_click`, `booking_click`, `contact_submit`, `viber_click`, `whatsapp_click`, `web_vital`. `useReportWebVitals` → `track('web_vital')` for Umami/GA4.
**AC:** Adapter switching is env-only; scripts load with `strategy="afterInteractive"` or lazier; no analytics in draft mode or on `/admin`.
**Done check:** unit tests for the adapter selection; manual Network panel check per provider.

### T09.3 — Legal templates and cookie table
**Steps:** Seed `legalPage` docs (privacy, cookies, terms; BG native + EN) from the LEGAL-GDPR §9 outline (and §8 provider information), with `[[placeholders]]` for client data (controller, EIK, DPO if any, retention, processors list: Cloudflare, Sanity, Resend, analytics provider). A Portable Text custom block `cookieTable` renders the table from `src/config/cookies.ts` (so the policy always matches reality). A `processorsList` block from a config (`src/config/processors.ts`) does the same for processors. The privacy policy includes the contact-form data flow (sent by email, not stored on the site; email retention is the clinic's responsibility, with a recommended period), the КЗЛД complaint right, and the children's data note.
**AC:** Changing the analytics provider changes the cookie table automatically; placeholders are listed by the T07.5 check.
**Done check:** render the cookies page in both configs; screenshot.

### T09.4 — Data subject requests and retention notes
**Steps:** Document (add `docs/LEGAL-GDPR.md` §11 "Data subject requests" and a section in the client handover doc) how a DSR is handled when nothing is stored on the site: emails in the clinic inbox, Sanity content (testimonials/gallery with names), analytics (cookieless: none; GA4: user deletion via GA admin). Add a `mailto:` "privacy contact" in settings and the footer. Add a Studio document action or a checklist note for "remove a person" (testimonial/gallery cleanup).
**AC:** The handover doc includes a one-page DSR procedure in BG.
**Done check:** doc review.
