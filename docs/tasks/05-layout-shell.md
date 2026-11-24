# Phase 05 — Layout shell

**Goal:** the persistent chrome. A shrinking sticky header, an accessible mobile menu, a sticky mobile action bar (Call / Directions / Book), an announcement banner and a footer with NAP and hours, all mobile-first and token-driven.
**Read first:** `docs/DESIGN-SYSTEM.md` §8, §10, §11, `docs/PRD.md` (F-features for header, action bar, banner, footer), `.cursor/rules/components-a11y.mdc`. Use the **frontend-design** skill.
**Data:** `getSiteSettings`, `getNavigation`, `getAnnouncement` in the `[locale]` layout. Pass plain domain props to components.

---

### T05.1 — SiteHeader with shrink-on-scroll
**Steps:** Server `SiteHeader` (wordmark, primary nav from `navigation`, phone CTA on desktop, LanguageSwitcher, menu button on mobile) + a tiny client `HeaderScrollState` that observes a 1px sentinel placed 48px below the top with `IntersectionObserver` and toggles `data-compact` on `<header>`. No scroll listeners. CSS handles the transition (`height`, wordmark scale via `transform`, shadow) using `--header-h` / `--header-h-compact`. A spacer prevents layout shift, and `scroll-padding-top` uses the current height. Current page link uses `aria-current="page"`. Reduced motion: switch states without transition.
**AC:** No CLS from the header (Lighthouse CLS < 0.05 on the home page); compact state on scroll; keyboard order: skip link → logo → nav → language → CTA; 60 fps scroll (no JS per scroll frame).
**Done check:** Vitest render test for `HeaderScrollState` toggling `data-compact` (mocked `IntersectionObserver`); manual review of the top and scrolled states at 360/768/1280.

### T05.2 — Mobile navigation
**Steps:** `MobileNav` using the shadcn `Sheet` (Base UI dialog): full-height panel, large tap targets (≥ 48px rows), nav links, phone, language switcher, booking CTA. It closes on route change and Escape, traps focus and returns focus to the trigger. The trigger has `aria-expanded` and `aria-controls`, and its label is localized ("Меню"/"Menu"). Body scroll lock comes from the dialog.
**AC:** No issues in a manual accessibility check in open state; works with VoiceOver/TalkBack basics (labelled dialog); no layout jump when opening.
**Done check:** Vitest render test for the trigger (`aria-expanded`, `aria-controls`, localized label, closes on Escape); manual keyboard pass (open, tab through, Escape, focus returns).

### T05.3 — MobileActionBar (sticky bottom)
**Steps:** Visible < `md` only: 2–3 actions from settings (`Call` → `tel:`, `Directions` → maps URL, `Book` → BookingCTA target). Uses `env(safe-area-inset-bottom)`, adds bottom padding to `<body>` equal to its height so it doesn't cover content or the footer, and hides while the mobile menu is open. Analytics events `call_click`, `directions_click`, `booking_click` via `track()` (no-op until Phase 09).
**AC:** Never covers focused elements (WCAG 2.4.11 Focus Not Obscured): test by tabbing to the last footer link at 360px. Labels have icon + visible text.
**Done check:** manual check at 360px (tab to the last footer link); screenshot.

### T05.4 — AnnouncementBanner
**Steps:** Rendered above the header when `getAnnouncement` returns one (holiday hours, closures). The page is static (ADR-012), so a small client check hides the banner once `endsAt` has passed and keeps a not-yet-started one hidden until `startsAt`; the daily scheduled deploy then renders the right one server-side. Tone variants (info/warning). It is dismissible, with the dismissal stored in `sessionStorage` keyed by announcement ID + `_updatedAt` (functional storage, listed in the cookie registry as strictly necessary). It's a server-rendered shell with a client dismiss button, and doesn't cause CLS. If dismissed state would cause a shift, render it collapsed by default via a small inline script, or accept and document that it shows again per session.
**AC:** An expired announcement is not shown (client-side check) without a publish or deploy; one that starts later appears by its start time at the latest after the next daily deploy; banner text is a `region` with a label. Unit-test the date logic.
**Done check:** seed an active + an expired announcement; verify.

### T05.5 — SiteFooter
**Steps:** NAP (name, address as `<address>`, phone, email), opening hours (from `openingHoursSpec`, formatted with T02.4, today highlighted client-side or not at all to keep it static, so prefer **not**), social links, secondary nav, legal links (privacy, cookies, terms, "Cookie settings" button that opens the preferences dialog in Phase 09; stub now), legal entity line (company name, EIK/ЕИК, registered address: E-Commerce Act provider info, see LEGAL-GDPR), © year (build time is fine).
**AC:** All data comes from settings; nothing is hardcoded; footer landmarks are correct (`contentinfo`).
**Done check:** screenshots + manual accessibility check (Lighthouse accessibility audit).

### T05.6 — Skip link, landmarks, error states
**Steps:** Skip link to `#main` (first focusable, visible on focus), single `<main id="main" tabIndex={-1}>`, `error.tsx` (client, localized via messages, retry button), `not-found.tsx` styled, `loading.tsx` is **not** added (static site). Document the landmark map in DESIGN-SYSTEM §11 if it changed.
**AC:** Manual accessibility check (Lighthouse accessibility audit + keyboard) passes for home, 404, error (trigger with a test route in dev only).
**Done check:** Vitest render tests for the skip link target and the single `main` landmark; manual pass noted in PROGRESS.

**Phase gate:** Silvena reviews header/menu/action bar on a real phone (preview URL).
