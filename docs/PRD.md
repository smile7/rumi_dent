# PRD — Client Site Starter Template

## 1. Purpose
A production-grade, reusable starter for bilingual marketing websites of **local service businesses**. It is built once and then used for every client. Each new client should take **days, not weeks**: change the theme tokens and config, then enter the content.

First client: **Rumi Dent** (Руми Дент), a dental practice in Ruse, Bulgaria. Two dentists: a woman specialised in **children** (she is the client and has priority) and a man treating **adults**. The audience is mainly **parents of young children**. The template must make that kind of site excellent: warm, trustworthy and calm, never childish.

## 2. Goals and success metrics
| Goal | Metric (per client site) |
| --- | --- |
| Visitors trust the business before calling | Clear NAP, team, real photos and FAQ on the home page; ≤ 2 taps to call on mobile |
| Fast everywhere | Lighthouse mobile ≥ 95 in Performance, Accessibility, Best Practices and SEO; LCP ≤ 2.0 s, CLS ≤ 0.05, INP ≤ 200 ms (lab + field p75) |
| Found locally | Valid LocalBusiness/Dentist JSON-LD, sitemap with hreflang, indexed in both languages within 4 weeks of launch |
| Client edits everything without the developer | Every visible text (except UI microcopy), image, list and section order is editable in the Studio. A new blog post goes from draft to live in < 10 min without help |
| Reusable | A new client site reaches "content-ready" in ≤ 2 developer days |
| Low running cost | $0/month on free tiers. No payment card on Cloudflare, ever (ADR-012) |

## 3. Users
1. **Developer (Silvena):** sets up new clients, themes, extends. Needs clear structure, typed APIs, docs and repeatable setup.
2. **Client-editor (e.g. the dentist or her assistant):** not technical, mostly on a laptop, sometimes on a phone. Edits texts, hours, team, FAQ, gallery and blog in BG, and reviews the EN version. Needs: simple forms, previews, no way to break the layout, clear errors in Bulgarian-friendly wording (Studio UI is English; field titles and descriptions are written in plain language, with BG hints where helpful).
3. **Site visitor:** for Rumi Dent, a parent on a phone, often anxious or in a hurry (toothache, trauma). Needs to call or find the place instantly, see who will treat the child, understand the first visit, and see prices and hours. Secondary: adult patients and English-speaking residents/expats.

## 4. Scope
### In scope (v1 template)
- Bilingual (BG default, EN), extensible to more locales via config.
- Pages: Home, Services (+ optional service detail), About/Team, Gallery, Blog (index, pagination, article), Contact, Legal (privacy, cookies, GDPR rights, terms), generic CMS pages, 404, Styleguide (internal).
- Page builder with 12 section types. Global announcement banner. Shrinking sticky header. Mobile sticky action bar. Language switcher.
- Contact form → email (Turnstile, Resend, GDPR consent). Click-to-load Google Map + directions link.
- Cookie consent, only shown when a non-essential category is enabled. Cookieless analytics by default; GA4 Consent Mode v2 optional.
- Full SEO/AEO kit: metadata, hreflang, sitemap, robots, OG, JSON-LD, llms.txt.
- Embedded Sanity Studio at `/admin` with Presentation (visual editing) and draft mode.
- Cloudflare Workers Free hosting, static only (every page prerendered; publish triggers a rebuild, ADR-012), CI/CD. Content export is manual (no backup workflow).
- Quality gates: lint, types, unit (incl. token contrast), build in CI; manual Lighthouse, a11y and visual review (no e2e: ADR-011; no Lighthouse CI: ADR-012).

### Non-goals (v1), but design for them
| Future feature | How v1 prepares |
| --- | --- |
| Online booking (e.g. Superdoc or another provider) | `bookingConfig` in settings (`mode: phone \| externalUrl \| embed`) and one `BookingCTA` component used everywhere. Switching providers = a settings change. |
| Google reviews feed | `testimonial` has `source: manual \| google`, and the section `googleReviews` name is reserved. The `Testimonial` domain type already includes `rating`, `authorName`, `date` and `sourceUrl`. |
| Price list | Reserved section `priceList` + planned `priceItem` type (see CONTENT-MODEL §6). Currency EUR (Bulgaria uses the euro since 2026-01-01). `features.priceList = false`. |
| Before/after gallery | Reserved section `beforeAfter`. `galleryItem` already has a consent flag and an optional `pairWith` reference. |
| Doctor profile pages | `teamMember.slug` exists. A route is added later. |
| Blog categories/tags, search | `article.categories` reserved (hidden field). |
| Newsletter, multi-location, e-commerce, user accounts | Out of scope. |

## 5. Features and acceptance criteria
Format: **F-ID — Feature**, then acceptance criteria (AC). "Both locales" means verified in BG and EN.

### F-01 Theming per client
- AC1: All colors, fonts, radii, shadows, spacing scale and motion durations come from `src/styles/tokens.css` + `src/config/fonts.ts`.
- AC2: Changing 1 primary color token and 1 font changes the whole site (incl. shadcn components) with no component edits.
- AC3: No hex/rgb literals outside `tokens.css` (lint rule / grep check in CI).
- AC4: Fonts load via `next/font` with `latin` + `cyrillic` subsets, `display: swap` and fallback metric adjustment (no visible CLS).

### F-02 Styleguide route
- AC1: `/[locale]/styleguide` shows color tokens (with WCAG contrast ratios for text/background pairs), the type scale, spacing, radius, shadows, motion samples, and every component in all its states (default/hover/focus/disabled/error, mobile + desktop).
- AC2: `noindex, nofollow`, excluded from the sitemap, disallowed in robots, and available only when `NEXT_PUBLIC_ENABLE_STYLEGUIDE=true`.
- AC3: Reviewed manually at 360/768/1280 for sign-off (no screenshot script: ADR-011).

### F-03 Internationalization
- AC1: `/` redirects to `/bg`. Every page exists under `/bg/...` and `/en/...` with localized static pathnames (e.g. `/bg/uslugi` ↔ `/en/services`).
- AC2: The language switcher keeps the user on the equivalent page, including CMS slugs. If no translation exists, it links to the target locale's home and states that in its accessible name.
- AC3: `<html lang>` is correct. Each page outputs hreflang alternates for existing translations + `x-default` (default locale).
- AC4: No user-facing string is hard-coded in components (enforced by review rule + a lint check for JSX text literals in `src/components/**`).
- AC5: Adding a locale to `src/config/i18n.ts` makes TypeScript report every missing message file/pathname. A documented test addition of `de` passes the build after the stubs are filled.

### F-04 Sanity Studio (editor experience)
- AC1: Studio at `/admin` (embedded) and deployable to `<project>.sanity.studio` from the same config.
- AC2: The sidebar is grouped: Settings (singletons), Pages, Services, Team, FAQ, Gallery, Blog, Testimonials, Announcements, Legal. Routable types are listed per language.
- AC3: Singletons can't be duplicated or deleted. Required fields have human-readable validation messages.
- AC4: Every image requires alt text per locale unless marked decorative. Hotspot is enabled.
- AC5: Ordering (team, services, FAQ, gallery) by drag and drop.
- AC6: The Presentation tool opens each page in preview with click-to-edit overlays. Draft changes are visible in preview, never on the public site.
- AC7: "Translate to EN" creates a linked EN document. A "Missing translations" list view exists.

### F-05 Content layer
- AC1: Only `src/lib/content/**`, `src/sanity/**`, `src/app/admin/**` and the draft-mode routes import Sanity packages (lint check).
- AC2: All page data are typed domain models (`src/lib/content/types.ts`), and mappers have unit tests with fixtures.
- AC3: Field-level i18n falls back to the default locale per field. Document-level content without a translation is not listed in that locale.

### F-06 Publishing (static only, ADR-012)
- AC1: Publishing in the Studio triggers a rebuild + deploy (Sanity webhook → GitHub `repository_dispatch`), and the change is live in ≤ 10 min. Saving a draft triggers nothing.
- AC2: Public pages are prerendered. `next build` output shows them as static/SSG, and content routes have `dynamicParams = false` (unknown slugs 404, nothing renders per request).
- AC3: Time-bound content (announcements) respects its end time without a publish (client-side check) and its start time within a day (scheduled daily deploy).
- AC4: No Cloudflare product that needs a payment card is used (no R2, D1, Durable Objects, Workers Paid).

### F-07 Page builder sections
Each section: editable in the Studio, renders responsively from 320 px, passes axe, has a styleguide entry, and accepts an optional `anchorId` and `tone` (background token).
- **Hero:** heading, subheading, 1–2 CTAs (incl. call/booking), image with variants (`split`, `cutout`, `fullBleed`), optional trust chips (e.g. "Children from age 2"). AC: the hero image is the LCP element and is preloaded (`priority`). No entry animation on the LCP element.
- **Text + Image:** rich text, image left/right/none, optional CTA.
- **Tiles (expand in place):** 2–8 tiles (icon/image, title, teaser) that open **in place** (no navigation) to reveal a rich-text panel + optional CTA + optional "Read more" link to a detail page. Source: manual items or services (by category). AC: see DESIGN-SYSTEM §9 (keyboard, ARIA disclosure, deep-link hash, reduced motion, one open at a time by default).
- **FAQ:** accordion from `faqItem` refs or by category. Emits FAQPage JSON-LD (one per page max).
- **CTA band:** heading, text, CTAs (call/booking/link).
- **Team:** members (featured member displayed first and larger), role, specialties, short bio, photo. Emits Person JSON-LD.
- **Gallery:** grid from gallery items/album with an accessible lightbox (keyboard, swipe, captions, focus return).
- **Blog teaser:** latest N articles (or selected).
- **Contact/Hours:** address, phones, email, hours with "open now / closes at" state computed client-side (time zone from settings), map (click-to-load), directions link.
- **Process steps:** 3–6 numbered steps (e.g. "First visit → Exam → Treatment plan → Follow-up").
- **Testimonials:** manual quotes (name/initials, optional rating, date). No auto-rotating carousel. Uses a scroll-snap list.
- **Rich text block:** long-form content on generic pages.

### F-08 Global layout
- **Header:** large logo/wordmark at the top of the page; on scroll past 48 px it transitions to compact (smaller logo, reduced height, solid background, subtle shadow). AC: no layout shift (CLS 0 from header), 60 fps (transform/opacity only), instant under reduced motion, nav keyboard-accessible, phone CTA always visible on desktop.
- **Mobile menu:** full-height sheet with large targets (≥ 48 px rows), contact block and language switcher. Focus is trapped while open and returns to the trigger when closed; Esc closes.
- **Mobile action bar:** fixed bottom bar (< `md`) with Call (tel:), Directions and an optional Book/Message button from settings. AC: respects safe-area insets, never hides focused content (page bottom padding), ≥ 44 px targets, and is hidden on `/admin` and when printing.
- **Announcement banner:** CMS-driven, date-bounded (start/end), tones (info/promo/warning), optional link, dismissible (remembered per announcement revision), at most 1 shown.
- **Footer:** NAP, hours (today highlighted), socials, legal links, legal-entity info (company name, ЕИК, registration/professional body), "Cookie settings" link (when consent is active), language switcher.
- **404:** localized, helpful (links to home, services, contact; call button).

### F-09 Contact form
- Fields: name*, phone or email (at least one required), message*, consent checkbox* (links to the privacy policy), hidden honeypot. Topic and child age are in v1 (T08.1). **Deferred:** preferred contact method and per-client field config (`src/config/forms.ts`).
- AC1: Client-side validation (RHF + Zod) with localized messages. The same Zod schema runs server-side in the Server Action.
- AC2: Turnstile is verified server-side (`siteverify`, with remote IP from `CF-Connecting-IP`). Failure gives a friendly message.
- AC3: Sends an email via Resend to `CONTACT_TO_EMAIL` or the settings recipient, with `replyTo` = the visitor's email when given. The clinic notification (subject + body) uses the default locale (`bg`); visitor-facing success/error messages stay in the submitter's locale. No submission is stored anywhere else.
- AC4: Success and error states are announced (`aria-live`), with focus moved to the result message. Double submits are prevented.
- AC5: Notice text says "don't include sensitive medical details". Retention is described in the privacy policy.
- AC6: Unit tests for the server action with Turnstile verification and Resend mocked (no e2e: ADR-011).

### F-10 Map and directions
- AC1: No request to Google before the user clicks "Show map" (verified manually in the network panel). The placeholder is a local image or a styled block with the address.
- AC2: After the click (or if "External media" consent was given earlier), the Google Maps embed iframe (URL from settings) loads with `title`, lazy loading and `referrerpolicy`.
- AC3: The "Directions" link opens `https://www.google.com/maps/dir/?api=1&destination=<lat,lng or address>` in a new tab with an accessible label.

### F-11 Consent and analytics
- AC1: With the default config (cookieless analytics, map click-to-load), **no cookie banner** is shown. The cookie policy still lists all storage used.
- AC2: When GA4 or other non-essential tech is enabled, a banner offers Accept all / Reject all / Settings with equal prominence. Nothing non-essential loads before consent. Consent Mode v2 defaults are all `denied`.
- AC3: The consent choice is stored with a version. Changing the cookie registry version re-prompts. A "Cookie settings" link reopens the preferences.
- AC4: The `track(event, props)` helper works with every provider and no-ops when the provider is off or consent is missing. Default events: `call_click`, `directions_click`, `booking_click`, `form_submit_success`.

### F-12 Legal pages
- AC1: `legalPage` documents for privacy, cookies, GDPR rights and terms exist in both locales from the seed templates (with placeholders clearly marked `[[…]]` that block publishing until replaced: custom validation).
- AC2: The cookie table on the cookie policy is generated from `src/config/cookies.ts`.
- AC3: Each legal page shows "Last updated". Footer links come from settings.

### F-13 SEO/AEO
See `docs/SEO.md`. AC: metadata on every route in both locales, canonical + hreflang, sitemap with alternates, robots env-aware (preview = disallow all), JSON-LD validated by unit tests and Rich Results Test at launch, `llms.txt` generated from content, OG image on every page (1200×630).

### F-14 Quality, accessibility, performance
- WCAG 2.2 AA: each UI task passes a manual Lighthouse accessibility audit + keyboard check; at launch, the keyboard-only walkthrough and screen-reader spot check in `NEW-CLIENT.md` §9 pass.
- Lighthouse budgets (mobile, manual run): Performance ≥ 95, A11y 100, Best Practices ≥ 95, SEO 100 on home, services, article and contact.
- JS budget: ≤ 110 KB gzip first-load JS on home (excluding the Studio route).
- Tests: Vitest (units, render tests). No Playwright/e2e (ADR-011); a11y and key interactions are checked manually.

### F-15 Operations
- CI on every PR. Preview deployments. Production deploy on main.
- No automated backups (ADR-012, brochure scope): manual `sanity dataset export` at handover and before risky bulk edits (`NEW-CLIENT.md` §10).
- Error visibility: Cloudflare Workers logs/observability enabled (`observability.enabled = true` in wrangler).

## 6. Constraints
- Budget: free tiers only. No payment card on the Cloudflare account (ADR-012). The only foreseeable paid upgrade is Sanity Growth, if a client needs roles or scheduled publishing.
- Hosting: Cloudflare Workers via OpenNext only (no Vercel-specific APIs).
- Sanity Free: 2 roles, public datasets, 2 webhooks, 10k docs.
- Legal: EU GDPR, Bulgarian ЗЗЛД, ePrivacy cookie rules (Bulgarian Electronic Communications Act). Health context, so stay conservative.

## 7. Release plan for the template
- v1.0.0: all phases 00–11 done, the demo seed content live on a demo worker, docs complete.
- Then: Rumi Dent = first client created via `NEW-CLIENT.md`. Improvements found there flow back into the template (see NEW-CLIENT §"Upstream changes").
