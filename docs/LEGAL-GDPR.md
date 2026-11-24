# Legal and GDPR

> **Not legal advice.** This doc gives the technical defaults and document templates the template ships with. Each client's lawyer or DPO must review the final texts. Items marked **(verify)** are points to confirm for the client's jurisdiction. The defaults are written for EU/Bulgaria.

## 1. Privacy-by-default technical choices (built into the template)
| Area | Default | Why |
| --- | --- | --- |
| Analytics | Cookieless (Cloudflare Web Analytics or Umami). No personal data, no cross-site tracking. | No consent banner needed under ePrivacy for cookieless, non-identifying measurement. Disclose it in the privacy policy anyway. |
| Maps | Click-to-load Google Maps. Nothing is sent to Google before the click. | Embeds set cookies and transfer IPs to Google. |
| Fonts | Self-hosted via `next/font`. | No Google Fonts IP transfer (cf. the 2022 German LG München ruling). |
| Forms | Email only (Resend). **No storage** of submissions in the CMS/DB. Honeypot + Turnstile. | Data minimisation. Sanity datasets are public on Free, so never store submissions there. |
| Turnstile | Loaded only on pages with the form, when the form is near the viewport. | Turnstile is strictly necessary for security (legitimate interest). Disclose it in the policy. Checked 2026-11-22 against Cloudflare's [Turnstile Privacy Addendum](https://www.cloudflare.com/turnstile-privacy-policy/) (last updated 18 June 2025): it processes "Signals" (IP address, TLS fingerprint, User-Agent, site key and origin) only to tell humans from bots, and calls them strictly necessary (its cookie section says no more than that). Cloudflare is the clinic's **processor** for bot protection, and a **controller** (legitimate interest) when it reuses the Signals to improve Turnstile. Name both roles in the privacy policy. |
| Video embeds (if any) | `youtube-nocookie.com` + click-to-load. | |
| Logs | Cloudflare request logs (IP, UA) under the platform's standard retention. Our code logs no PII. | |
| Consent banner | Shown **only** when a non-essential category is enabled (GA4, marketing pixels, external media auto-load). | Avoids needless banners. Stays compliant when trackers are added. |

## 2. Data inventory (fill per client; include it in the privacy policy)
| Processing | Data | Purpose | Lawful basis | Processor / recipient | Retention |
| --- | --- | --- | --- | --- | --- |
| Contact form | name, phone/email, message (may incidentally contain health info) | answer the inquiry, schedule an appointment | Art. 6(1)(b) pre-contractual steps / (f) legitimate interest. **Ask users not to send medical details.** If they do anyway, Art. 9(2)(a) explicit consent via the checkbox wording (verify). | Resend (email delivery), clinic mailbox provider | Delete within [[12]] months if no patient relationship arises (clinic procedure) |
| Website security | IP, Turnstile signals | bot protection | 6(1)(f) | Cloudflare | per Cloudflare |
| Hosting/CDN logs | IP, UA, URL, time | operation, security | 6(1)(f) | Cloudflare | per Cloudflare |
| Analytics (cookieless) | aggregated page views, referrer, device class | improve the site | 6(1)(f) | Cloudflare / Umami | per provider ([[6 months]] Umami Hobby) |
| Map (after click) | IP, cookies set by Google | show location | consent (6(1)(a)) | Google | per Google |
| GA4 (optional) | pseudonymous identifiers, events | measurement | consent (6(1)(a)) | Google | [[2/14]] months setting |
| CMS editors | editor name/email | content management | 6(1)(b)/(f) | Sanity | account lifetime |

International transfers: Cloudflare, Resend, Sanity and Google are US-based or have US sub-processors. Rely on the EU–US Data Privacy Framework and/or SCCs. Sign/accept each provider's DPA in the **client's** account. Prefer EU regions where offered (check Resend's sending-region options when adding the domain; the static site stores no data on Cloudflare) **(verify)**.

## 3. Cookie and storage registry (`src/config/cookies.ts`)
Single source for the consent banner, the preferences dialog and the cookie policy table. Each entry has `id` (purpose and duration are messages under `Cookies.items.<id>`, BG + EN), `name`, `provider`, `category`, `storage` (`cookie | localStorage | sessionStorage | none`) and optionally `enabledWhen(context)`, `askedAtEmbed`, `deletePrefixes`. Bump `cookieRegistryVersion` when an entry that needs consent is added or changes purpose: every visitor is asked again.

| Entry | Category | Storage | Enabled |
| --- | --- | --- | --- |
| `NEXT_LOCALE` | necessary | cookie (session) | always |
| `consent` | necessary | cookie (6 months) | always |
| `announcement-dismissed:*` | necessary | sessionStorage | always |
| `__prerender_bypass`, `__next_preview_data` | necessary | cookie (editors only) | always |
| Cloudflare Turnstile | necessary | none | always (contact form, §1) |
| Cloudflare Web Analytics / Umami | analytics | none (cookieless) | `NEXT_PUBLIC_ANALYTICS` |
| `_ga`, `_ga_*` | analytics | cookie (up to 2 years) | `NEXT_PUBLIC_ANALYTICS=ga4` |
| Google Maps (`NID`, …) | embeds | cookie, asked at the embed | always (click-to-load) |

Categories: `necessary` (always on, not toggleable), `preferences`, `analytics`, `marketing`, `embeds`. `requiresConsent()` is true only when an enabled entry is non-necessary, stores something on the device and isn't asked at the embed, so cookieless analytics and the click-to-load map never show the banner. The dialog offers a switch for each category that has such an entry (the map's `embeds` always; `analytics` with GA4).

## 4. Consent UX rules (when the banner is active)
- First layer: a short text + **Accept all**, **Reject all**, **Settings**, with equal visual weight (same button style and size). No pre-ticked boxes. No cookie wall. The site stays usable.
- The banner doesn't block the main content on mobile (bottom sheet ≤ 40 % of the viewport height), is keyboard-accessible, and is announced as a non-modal `region` with a heading.
- Settings dialog: a toggle per category with a description, and a link to the cookie policy.
- The choice is stored with a timestamp and registry version for 6 months (cookie `consent`), then the banner asks again.
- A **"Cookie settings"** link in the footer reopens the dialog. Withdrawing consent is as easy as giving it.
- GA4 Consent Mode v2: `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 })` before any tag. Load `gtag.js` only after analytics consent (basic mode, the conservative default). Then `gtag('consent', 'update', { analytics_storage: 'granted' })`.
- External media: a per-embed "Load map" button + an "Always allow Google Maps" checkbox that grants the `embeds` category.

## 5. Contact form compliance
- Under the submit button: «Изпращайки формата, вие се съгласявате личните ви данни да бъдат обработени, за да отговорим на запитването ви. Моля, не изпращайте медицинска информация. [Политика за поверителност]» / "By sending this form you agree that we process your data to answer your inquiry. Please don't include medical details. [Privacy policy]".
- A required consent checkbox (not pre-ticked) linking to the privacy policy. The label wording is configurable per client.
- Age: in Bulgaria the age of digital consent is **14** (verify). The form is addressed to parents/guardians. The privacy policy states that children under 14 shouldn't submit the form themselves.
- Email to the clinic includes the consent text version and a timestamp (for accountability), not the IP.

## 6. Photos of patients (children)
- Gallery items flagged `showsPatient` require `consentOnFile = true` and a `consentReference` (custom validation blocks publishing otherwise).
- The clinic keeps signed written consent from the parent(s)/guardian(s), covering website + social use, and offers withdrawal. On withdrawal, delete the image and its CDN asset (Sanity asset delete) within [[7]] days.
- Avoid faces of children unless consent explicitly covers it. Prefer hands, smiles, backs or blurred faces.

## 7. Health-sector and professional rules (verify)
- Advertising by dental practices in Bulgaria is subject to professional ethics rules (Bulgarian Dental Association, БЗС) and health legislation. **Verify before publishing** testimonials, before/after images, "best/leading" claims and price promotions.
- Content about treatments is informational, with a disclaimer on articles: «Информацията е с образователна цел и не замества прегледа при лекар по дентална медицина.»
- Show the practice's legal and registration information (see §8).

## 8. Provider information (footer and the "Terms" page)
Bulgarian E-Commerce Act (ЗЕТ, art. 4) requires information-society service providers to show their identity details (verify applicability to a clinic brochure site; it's harmless to include): legal name, ЕИК/UIC, registered address, contact details (email, phone), VAT number if registered, the supervisory authority and professional body for regulated professions (dentists: Bulgarian Dental Association; the registration of the medical establishment at the Regional Health Inspectorate, РЗИ). Source: `siteSettings.legal` (legalEntity).

## 9. Legal page templates (seeded as `legalPage`, BG + EN, `[[placeholders]]` block publishing)

### 9.1 Privacy policy (`kind: privacy`): sections
1. Who we are (controller): `[[legalName]]`, ЕИК `[[uic]]`, address, email, phone. DPO: `[[none / name and contact]]` (a small practice usually doesn't need a DPO unless processing health data on a large scale, so verify).
2. What data we process and why: the table from §2, filtered to the active features.
3. Legal bases.
4. Recipients and processors: Cloudflare (hosting, security, analytics), Resend (email), Sanity (website content; no visitor data), Google (maps after consent; GA4 if enabled), the email provider of the clinic. Rendered by the `processorsList` block from `src/config/processors.ts`, so it follows the analytics setting.
5. International transfers and safeguards.
6. Retention periods.
7. Your rights: access, rectification, erasure, restriction, portability, objection, withdrawal of consent, complaint to the **Commission for Personal Data Protection (КЗЛД)**, www.cpdp.bg, 2 Prof. Tsvetan Lazarov Blvd., Sofia 1592 (verify the current address).
8. Children.
9. Security measures (TLS, access control, minimisation).
10. Cookies: link to the cookie policy.
11. Changes and the "last updated" date.

### 9.2 Cookie policy (`kind: cookies`)
What cookies/local storage are, the categories, **the auto-generated table** (the `cookieTable` Portable Text block, rendered from §3: name, provider, purpose, duration, category), how to change consent (footer link), and browser controls.

### 9.3 GDPR rights / data requests (`kind: gdpr`)
How to exercise rights (email/post/in person), identity verification, a response within 1 month (extendable by 2), free of charge in principle, plus a template request text. Note: patient medical records are governed by health legislation and kept per the law's retention periods, **not** by website processes.

### 9.4 Terms of use (`kind: terms`)
Provider information (§8), purpose of the site (information, not medical advice), IP of content and photos, links to third-party sites, liability limits, applicable law (Bulgaria) and courts, changes.

## 10. Launch compliance checklist (also in NEW-CLIENT.md)
- [ ] All `[[placeholders]]` replaced, and the lawyer/DPO has reviewed the texts in both languages.
- [ ] Data inventory matches the enabled features (`src/config/features.ts`).
- [ ] DPAs accepted in client accounts (Cloudflare, Resend, Sanity, Google if used).
- [ ] Cookie table auto-generated, and the banner appears only if needed (test with GA4 on/off).
- [ ] No request to Google/third parties before consent (DevTools network check on a fresh profile).
- [ ] Contact form notice + checkbox present. Test email received with the consent version.
- [ ] Patient photos: consent references recorded for every `showsPatient` item.
- [ ] Footer shows the legal entity info + links to all legal pages in both locales.

## 11. Data subject requests
The site stores no visitor data of its own (§1), so a request (access, erasure, rectification, objection; §9.3) is answered from these places. The clinic is the controller and answers within 1 month (+2 for complex requests, telling the person within the first month). The one-page BG procedure for the clinic is in NEW-CLIENT §10 ("Handover sheet: искания по GDPR").

| Where | What can be there | How to handle it |
| --- | --- | --- |
| Clinic mailbox | Contact form enquiries (name, phone/email, message) | Search by name/email/phone; send a copy or delete. Retention per the privacy policy (`[[retention]]`, 12 months recommended). |
| Resend | Delivery logs of the notification emails | Resend dashboard → Emails; the plan's log retention applies **(verify)**. |
| Sanity | Content naming a person: testimonials, gallery photos, team members, article authors/reviewers | "Remove a person" checklist (NEW-CLIENT §10). Deleting a document does not delete its image file: delete the asset too, or the CDN URL keeps working (within [[7]] days, §6). |
| Analytics | Cookieless (Cloudflare/Umami): no personal data, nothing to do. GA4: pseudonymous IDs | GA4 Admin → Data deletion requests, or User explorer → delete user when the person can give their client ID. |
| Cloudflare logs | IP, UA (platform retention) | Not linked to a person by the site; no action. |
| Medical records | Outside the website | Health legislation applies (§9.3), not this procedure. |

The footer shows a `mailto:` privacy contact (`siteSettings.legal.privacyEmail`, falling back to the main email).
