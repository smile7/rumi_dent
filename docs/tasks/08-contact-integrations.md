# Phase 08 — Contact form and integrations

**Goal:** a spam-resistant, accessible contact form that sends email via Resend from a Server Action (nothing stored), a privacy-friendly map, and booking/messaging CTAs prepared for future online booking.
**Read first:** `docs/PRD.md` (contact form, map, booking features), `docs/LEGAL-GDPR.md` (form notice, data inventory, retention), `docs/ARCHITECTURE.md` §6.6 (CPU) and §10 (security).

---

### T08.1 — Schema and form UI
**Steps:** `src/lib/forms/contact-schema.ts` (Zod 4): `name` (2–80), `phone` (BG formats, normalized to E.164) or `email` (at least one required), `message` (10–2000), `topic` (enum: general, child appointment, adult appointment, other), `childAge` (optional, shown for the child topic, number 0–17; no other child data), `consent` (must be true, links to the privacy notice), honeypot `website` (must be empty), `startedAt` (timestamp, reject < 3 s). Localized error messages via a Zod error map from `messages`. `ContactForm` (client): React Hook Form + `@hookform/resolvers/zod`, `useActionState` for the server result, native validation off, errors linked via `aria-describedby`, `aria-invalid`, summary on submit failure focusing the first invalid field, success state that moves focus to the message, `autocomplete` attributes (`name`, `tel`, `email`), `inputmode="tel"`.
**AC:** WCAG 3.3.1/3.3.3 behaviors; works at 360px; the form only asks for what's needed (data minimization).
**Done check:** unit tests for the schema (BG phone formats: `0888 123 456`, `+359888123456`, `00359…`); Vitest render test for client validation (`aria-invalid`, `aria-describedby`, focus moves to the first invalid field).

### T08.2 — Server Action: Turnstile → validate → Resend
**Steps:** `src/actions/contact.ts` (`'use server'`): parse `FormData` with the same schema; verify Turnstile token server-side (`https://challenges.cloudflare.com/turnstile/v0/siteverify`, secret from env, check `success` and `hostname`); honeypot/timing checks (silent success for bots); send with Resend (`from` = `CONTACT_FROM_EMAIL`, `to` = `CONTACT_TO_EMAIL` or the settings recipient, `replyTo` = submitter email if given, subject localized, `idempotencyKey`). Email body = React Email template `src/emails/ContactNotification.tsx` (import from `react-email`, inline styles, **no** `<Tailwind>`), plus a text version. Return a typed result `{ ok: true } | { ok: false, fieldErrors?, formError }`. No logging of PII (log only outcome + error codes).
**AC:** CPU per submission < 10 ms on Workers (measure via observability; note result); a failed Resend call shows a friendly error with the phone number as fallback.
**Done check:** unit tests with mocked fetch/Resend; a real email delivered from the preview worker to a test inbox (Resend test domain or verified sandbox domain).

### T08.3 — Turnstile widget
**Steps:** `@marsidev/react-turnstile` with `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `appearance: 'interaction-only'` (invisible for most users), language set to the locale, `size: 'flexible'`, refresh on expiry/error, the token written into a hidden input. Test keys in dev/CI. Turnstile is strictly necessary for security of the form (document in the cookie registry; Cloudflare states it doesn't use cookies for tracking, so verify the current Turnstile privacy statement and note it in LEGAL-GDPR).
**AC:** A submit with the test keys succeeds; the widget loads only on pages with the form (lazy).
**Done check:** manual submit happy path locally with the test keys and `CONTACT_DRY_RUN=true` (Resend not called).

### T08.4 — MapEmbed (click-to-load) and DirectionsLink
**Steps:** `MapEmbed`: a static placeholder (a pre-rendered map image stored in `public/brand/map.webp` or a styled illustration, address text, "Show map" button). Click loads the Google Maps embed iframe (`loading="lazy"`, `title`, `referrerpolicy="no-referrer-when-downgrade"`). If analytics/marketing consent includes "third-party embeds", load directly. Otherwise click is consent for this embed (button text says so: "Зареди картата (Google)"). `DirectionsLink`: `https://www.google.com/maps/dir/?api=1&destination=<lat,lng>` (+ Apple Maps on iOS optional). Coordinates from settings.
**AC:** No request to Google before the click; map is keyboard-accessible; the iframe has a title.
**Done check:** Vitest render test (no iframe before the click, iframe with `title` after); manual check in the browser Network panel.

### T08.5 — BookingCTA, Viber/WhatsApp
**Steps:** `BookingCTA` reads `bookingConfig` (mode: `phone` | `externalUrl`, as in CONTENT-MODEL) and renders the right action everywhere (header, action bar, CTA bands). Messaging: Viber (`viber://chat?number=%2B359…`; works on mobile with Viber installed, so show only on mobile and keep the phone fallback) and WhatsApp (`https://wa.me/359…`). Track `booking_click` with mode.
**AC:** Switching `bookingConfig.mode` in Studio changes CTAs site-wide after publish; no dead links on desktop for Viber.
**Done check:** unit tests for href builders; Studio toggle test.
