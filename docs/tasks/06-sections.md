# Phase 06 — Sections

**Goal:** every section type from CONTENT-MODEL §5 as a polished, responsive, accessible server component (client islands only where interactive), rendered through a registry. Each section also appears in `/styleguide` with fixture data.
**Read first:** `docs/CONTENT-MODEL.md` §5, `docs/DESIGN-SYSTEM.md` §5–§11, `.cursor/rules/components-a11y.mdc`, `.cursor/rules/styling-tokens.mdc`. Use **frontend-design** for composition and **web-design-guidelines** to review.
**Rules for every section:** domain props only (`Section` union member); `Section` primitive wrapper with `aria-labelledby` to its heading; heading level comes from position (the page's first section owns h1 if the page has no hero, or the hero does); images via `ContentImage` with correct `sizes`; strings from props or `messages`; fixtures in `src/components/sections/__fixtures__/` (BG + EN); one Vitest render test + styleguide entry each.

---

### T06.1 — SectionRenderer, registry, reserved stubs
**Steps:** `registry.ts` maps `type` → component (lazy where client-heavy). `SectionRenderer` iterates, passes `index` (for heading level and `priority` image on the first section), wraps each in an error boundary that renders nothing in production and an outline + message in dev. Reserved types (`priceList`, `beforeAfter`, `googleReviews`) are registered as `null` components behind `features.*` flags.
**AC:** Unknown or reserved types never crash a page; the union is exhaustive (TS `never` check).
**Done check:** unit test with a mixed fixture list.

### T06.2 — Hero
**Steps:** Variants `split` (text + image), `cutout` (image with organic mask shape, nice for the pediatric preset), `fullBleed` (image with overlay; text contrast guaranteed by a scrim token). Up to 2 CTAs (primary + secondary/call), trust items row (icon + short text). The image is `priority` with `fetchPriority="high"` and explicit `sizes`. The heading uses `text-step-5/6` with `balance`.
**AC:** LCP element is the hero image or heading; LCP < 2.0 s on preview (mobile, Lighthouse); no text over busy image without scrim.
**Done check:** screenshots of all 3 variants at 3 widths.

### T06.3 — TextImage, ProcessSteps, RichTextBlock
**Steps:** `TextImage` (image left/right, stacked on mobile with image first or second per design rule; optional CTA). `ProcessSteps` (ordered list `<ol>` semantics, numbered visual, 3–6 steps, horizontal on desktop/vertical timeline on mobile). `RichTextBlock` (`Prose` width prose/wide).
**AC:** Semantics correct (ol for steps); readable measure (≤ 70ch) for prose.
**Done check:** screenshots + render tests.

### T06.4 — Tiles (expand-in-place, no navigation)
**Context:** Silvena dislikes tiles that navigate away. Tiles expand a detail panel in place (DESIGN-SYSTEM §9).
**Steps:** Grid with `grid-auto-flow: dense`. Each tile is a `<button aria-expanded aria-controls>` inside a heading (disclosure pattern). The panel renders right after its tile in DOM order and spans the full row (`grid-column: 1 / -1`), so it opens under the clicked tile's row on any column count. `allowMultiple` false → opening one closes the others. Deep link: `#<slug>` opens and scrolls to the tile on load, and opening updates the hash with `history.replaceState` (no scroll jump). Panels use `hidden="until-found"` so browser find-in-page reveals them (verify React 19.3 passes the attribute value through; otherwise set it in an effect and listen for `beforematch`). Motion: height animation with Motion `layout` or CSS `interpolate-size` where supported, disabled with reduced motion. Source `services`: tiles from `getServices` grouped by category, panel shows the teaser + "Read more" link to the service page (a link inside the panel is fine; the tile itself doesn't navigate).
**AC:** Keyboard: Enter/Space toggles, focus stays on the button, the panel content is reachable next in tab order; screen reader announces expanded state; works without JS (progressive enhancement: panels are server-rendered visible; a tiny inline script in `<head>` adds `html.js`, and CSS `.js [data-tile-panel]:not([data-open]) { display: none }` hides them before first paint; after hydration the component takes over with `hidden="until-found"`); no CLS outside the opened area.
**Done check:** Vitest render tests (Enter/Space toggles, `aria-expanded`, single/multi mode, hash deep-link opens the tile) + manual keyboard and accessibility check + screenshots open/closed at 360/768/1280.

### T06.5 — FAQ and CtaBand
**Steps:** `Faq` with the shadcn Accordion (Base UI), questions as buttons inside headings, `emitSchema` → returns `FAQPage` JSON-LD data to the page (the page assembles the `@graph`; the section doesn't render the script itself). `CtaBand` with brand tone, 1–2 CTAs, call CTA formatted with `formatPhone`.
**AC:** Accordion keyboard per APG; FAQ JSON-LD only once per page.
**Done check:** render tests + manual accessibility check.

### T06.6 — Team and Testimonials
**Steps:** `Team`: `featuredFirst` layout gives the featured member (the pediatric dentist for Rumi Dent) a large card with photo, name, role, short bio and audience tag ("Детски дентален лекар"); others in a grid. The card can expand a bio in place (same disclosure pattern) or link to `/about#slug`. `Testimonials`: cards or a scroll-snap row (no autoplay carousel), optional rating stars with accessible text ("5 от 5"), source label. Rating JSON-LD only if real and compliant (see SEO.md: no self-serving review markup for LocalBusiness; so **no** `aggregateRating` from own testimonials).
**AC:** No autoplay; scroll-snap row has visible prev/next buttons and is keyboard scrollable; images have alt text from CMS.
**Done check:** screenshots + Vitest render test for the prev/next buttons + manual keyboard check on the testimonials row.

### T06.7 — Gallery + lightbox, BlogTeaser, ContactHours
**Steps:** `Gallery`: responsive grid (masonry-like via CSS columns or aspect-ratio grid), album filter chips (buttons with `aria-pressed`), lightbox using the shadcn Dialog (arrow keys, swipe via pointer events, Escape, focus return, counter "3 / 12", caption, preloads next image). `BlogTeaser`: latest or selected articles, cards with date (`<time dateTime>`), reading time. `ContactHours`: address, phones, email, hours table (`<table>` with `<th scope="row">` days), special hours, optional map (Phase 08 component; placeholder now), optional form slot.
**AC:** Lightbox passes a manual accessibility check and is fully keyboard operable; hours table correct for closed days and special hours.
**Done check:** Vitest render test for the lightbox (arrow keys, Escape, counter) and the hours table; screenshots.

**Phase gate:** all sections in `/styleguide` and on the seeded home page; Silvena reviews screenshots. Replace Studio insert-menu thumbnails (`public/studio/sections/*.png`) with real screenshots of each section (taken manually).
