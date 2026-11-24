# Design System

The template ships a **neutral, well-crafted default theme**. Each client gets its own visual identity by editing `src/styles/tokens.css` and `src/config/fonts.ts`. Components never change per client. This doc defines the token structure, the rules components follow, and the design bar we hold ourselves to.

Install and use the `frontend-design` skill for every visual task (see README). It pushes for distinctive, intentional choices. This doc constrains it to our system.

---

## 1. Design principles
1. **Trust before charm.** For service businesses (especially health), clarity, real people and real places beat decoration. Charm is the accent, not the base.
2. **Mobile-first, thumb-first.** Design at 360 px first. Primary actions sit within thumb reach (sticky action bar), with targets ≥ 44 px.
3. **One idea per section.** Each section answers one visitor question (Who? What? How much? Where? When? How do I start?).
4. **Real content shapes the layout.** Design with the real photos and real text lengths (BG words are long: «Детска дентална медицина»). Never design with lorem ipsum.
5. **Calm motion.** Motion explains state changes (open/close, compact header). It never decorates for its own sake. Everything works with reduced motion.
6. **Consistency through tokens.** If a value isn't a token, it doesn't exist.

---

## 2. Token architecture (Tailwind v4, CSS-first)

Three layers. Components use **semantic** tokens only.

1. **Primitives:** raw palette and scales (`--color-brand-50…950`, `--color-accent-*`, `--color-neutral-*`). Use OKLCH.
2. **Semantic:** role-based, and what components use: `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-primary`, `--color-primary-fg`, `--color-accent`, `--color-accent-fg`, `--color-success|warning|danger(-fg)`, `--color-focus`, plus **section tones** `--color-tone-{base,soft,brand,accent,inverse}-{bg,fg}`.
3. **Component aliases (shadcn bridge):** shadcn expects `--background`, `--foreground`, `--primary`, `--radius`, etc. We map them to semantic tokens in `@theme inline` so shadcn components follow the theme automatically.

File layout:
```css
/* src/styles/tokens.css: the ONLY file a new client edits for theme */
@theme {
  /* ---------- Primitives ---------- */
  --color-brand-50: oklch(0.97 0.02 200);
  /* … 100–950 … */
  --color-accent-500: oklch(0.80 0.14 75);
  --color-neutral-0: oklch(1 0 0);
  /* … */

  /* ---------- Semantic ---------- */
  --color-bg: var(--color-neutral-0);
  --color-fg: oklch(0.25 0.02 250);
  --color-primary: var(--color-brand-700);
  --color-primary-fg: var(--color-neutral-0);
  /* tones for section backgrounds */
  --color-tone-soft-bg: var(--color-brand-50);
  --color-tone-soft-fg: var(--color-fg);

  /* ---------- Typography ---------- */
  --font-display: var(--font-display-family), ui-sans-serif, system-ui, sans-serif; /* set by next/font variable */
  --font-body: var(--font-body-family), ui-sans-serif, system-ui, sans-serif;
  --text-step--1: clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem);
  --text-step-0:  clamp(1rem, 0.97rem + 0.15vw, 1.0625rem);
  --text-step-1:  clamp(1.2rem, 1.13rem + 0.35vw, 1.42rem);
  --text-step-2:  clamp(1.44rem, 1.3rem + 0.7vw, 1.89rem);
  --text-step-3:  clamp(1.73rem, 1.5rem + 1.15vw, 2.52rem);
  --text-step-4:  clamp(2.07rem, 1.7rem + 1.85vw, 3.36rem);
  --text-step-5:  clamp(2.49rem, 1.9rem + 2.9vw, 4.48rem);

  /* ---------- Space / size ---------- */
  --spacing: 0.25rem;                 /* Tailwind v4 base unit: p-4 = 1rem */
  --space-section: clamp(4rem, 3rem + 5vw, 8rem);
  --container-max: 76rem;
  --container-prose: 42rem;

  /* ---------- Radius / elevation ---------- */
  --radius-sm: 0.5rem; --radius-md: 0.875rem; --radius-lg: 1.25rem; --radius-xl: 2rem; --radius-pill: 999px;
  --shadow-sm: 0 1px 2px oklch(0.2 0.02 250 / 0.06), 0 1px 1px oklch(0.2 0.02 250 / 0.04);
  --shadow-md: 0 8px 24px -8px oklch(0.2 0.02 250 / 0.14);
  --shadow-lg: 0 24px 48px -16px oklch(0.2 0.02 250 / 0.18);

  /* ---------- Motion ---------- */
  --duration-instant: 100ms; --duration-fast: 160ms; --duration-base: 240ms; --duration-slow: 400ms; --duration-slower: 600ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.3, 0, 0, 1.2);  /* use sparingly: playful overshoot */
  --ease-exit: cubic-bezier(0.3, 0, 1, 1);

  /* ---------- Layout ---------- */
  --header-h-expanded: 6rem;   /* 96px */
  --header-h-compact: 4rem;    /* 64px */
  --header-h-mobile: 4rem;
  --action-bar-h: 4.5rem;      /* mobile sticky bar incl. padding */
}
```
`src/styles/globals.css` imports Tailwind, `tw-animate-css` and `tokens.css`, adds `@theme inline { --color-background: var(--color-bg); … --radius: var(--radius-md); }` for shadcn, and a small `@layer base` (font smoothing, `scroll-padding-top`, focus ring, `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs).

**Rules**
- Text/background pairs must meet WCAG AA: 4.5:1 for body, 3:1 for ≥ 24 px or bold ≥ 18.66 px, 3:1 for UI component boundaries and focus indicators. The styleguide computes and displays the ratios; a failing pair is a blocker.
- Never use opacity to create text colors (contrast becomes unpredictable over images). Use `--color-fg-muted`.
- Light theme only in v1. Token naming already allows a `[data-theme="dark"]` override later.

---

## 3. Typography
- **Max two families:** `display` (headings, wordmark) and `body`. One family is fine if it has a wide weight range.
- **Cyrillic is mandatory.** Every font must include the `cyrillic` subset. Check the glyph quality in BG text in the styleguide (Bulgarian has localized forms; with `<html lang="bg">` fonts that ship a `locl` feature for Bulgarian render it automatically, so check д, л, ж, ю in the specimen).
- Fonts verified to have Cyrillic on Google Fonts (2026-11): *Sans:* Manrope, Onest, Golos Text, Geologica, Commissioner, Nunito, Nunito Sans, Rubik, Mulish, Montserrat, Raleway, Jost, Wix Madefor Display/Text, Inter, Inter Tight, Unbounded (display), Comfortaa (display), M PLUS Rounded 1c, Ysabeau / Ysabeau Infant. *Serif:* Literata, Lora, Source Serif 4, Piazzolla, Alegreya, Cormorant, Playfair Display, Noto Serif, Spectral, Prata. **No Cyrillic:** Fraunces, DM Sans, Figtree, Plus Jakarta Sans, Outfit, Sora, Lexend, Bricolage Grotesque, Quicksand, Fredoka, Instrument Serif. Don't use these.
- `src/config/fonts.ts` defines `display` and `body` with `next/font/google`: `subsets: ['latin', 'cyrillic']`, `display: 'swap'`, variable fonts (`weight` omitted when variable), `variable: '--font-display-family'`, `adjustFontFallback: true` (default). Preload only the body font.
- Scale: 7 fluid steps (`--text-step--1 … 5`), ratio ≈ 1.2 (mobile) → 1.333 (desktop). Map them to utilities: `text-step-0` etc.
- Line height: body 1.6 (serif 1.65), headings 1.1–1.25. Measure: ≤ 70ch for body (`max-w-prose` = `--container-prose`).
- The heading level (h1–h6) is semantic and **decoupled from the visual size**: `<Heading as="h2" size="step-3">`. Each page has exactly one h1.
- Numbers: `font-variant-numeric: tabular-nums` for hours and prices.
- Bulgarian typography: use „…" quotes in BG content and “…” in EN. Avoid widows in headings (`text-wrap: balance`).

---

## 4. Spacing, layout, grid
- Base unit 4 px (`--spacing: 0.25rem`). Use the Tailwind scale only (`gap-4`, `py-6`…). Section vertical rhythm comes from the `--space-section` token through the `<Section>` primitive.
- Container: `px-5` (mobile) → `px-8` (md) → max `--container-max`, centered.
- Grid: 4 columns (mobile) / 8 (md) / 12 (lg). Most sections use simple compositions (1→2→3 columns). Asymmetric splits (5/7) are encouraged for text+image to avoid template symmetry.
- Breakpoints: Tailwind defaults (`sm 40rem`, `md 48rem`, `lg 64rem`, `xl 80rem`). Design and QA at **360, 390, 768, 1024, 1280, 1440**.

---

## 5. Radius, elevation, borders
- Radius tokens: `sm` (inputs, chips), `md` (buttons, cards), `lg` (tiles, media), `xl` (hero media, feature blocks), `pill` (badges, segmented controls). One radius family per client. A family-friendly client leans larger (`lg`/`xl`), a corporate one smaller.
- Elevation: prefer **tone changes and borders** over shadows. Use at most 3 shadow levels. Shadows only on things that float (header when compact, popovers, open tile, lightbox).
- Borders: 1 px `--color-border`. Focus ring: 2 px `--color-focus` with a 2 px offset, always visible on `:focus-visible`.

---

## 6. Color and imagery
- Palette: 1 brand hue (primary actions, links), 1 accent hue (highlights, small shapes, tile icons), and neutrals with a slight brand tint. Section tones alternate base/soft to create rhythm without hard lines.
- Photography: **real team and real rooms first**, stock only for generic moods. Always warm, natural light, real smiles. Never staged "doctor with crossed arms" stock.
- Image treatments (choose 1–2 per client and stay consistent): soft-radius rectangles; organic **blob masks** (SVG `clipPath`) for cutout portraits; subtle grain. No heavy filters.
- Decorative shapes (blobs, dots, wavy lines) are SVG, `aria-hidden`, token-colored, and at most 2 per viewport.
- Icons: lucide, 1.5 px stroke, sized with tokens (`size-5`/`size-6`), always paired with text or an accessible label.

---

## 7. Motion principles (Motion for React)
- Library: `motion` (`motion/react`). Wrap the app in `<MotionProvider>` = `<LazyMotion features={domAnimation} strict><MotionConfig reducedMotion="user">`. Use `m.div` (`motion/react-m`), not `motion.div`, to keep the bundle small.
- What moves: state changes (expand/collapse, menu open, header compacting, lightbox), entrance reveals on scroll (subtle: 8–16 px translate + opacity, `--duration-slow`, once).
- What never moves: the LCP element on load, body text while reading, anything on a loop (except a deliberate, ≤ 1 small looping illustration that pauses offscreen and under reduced motion).
- Use only transform and opacity (compositor-friendly). No animating `height` with CSS on large content. For expand/collapse use Motion's `height: 'auto'` with `AnimatePresence`, or `layout` animations on small elements.
- Durations: micro 100–160 ms, standard 240 ms, large surfaces 400 ms. Exits are ~20 % faster than entrances.
- Under reduced motion: no translate/scale, opacity fades ≤ 120 ms or instant, no parallax, no smooth scrolling (`scroll-behavior: auto`).

---

## 8. Header behavior (shrinking sticky header)
Desktop/tablet (≥ md):
- **State A (top of page):** height `--header-h-expanded` (96 px), large logo/wordmark (≈ 1.4× its compact size), transparent or `--color-bg`, no shadow, nav + primary CTA (phone or BookingCTA).
- **State B (scrolled > 48 px):** height `--header-h-compact` (64 px), logo scaled to 1×, solid `--color-bg` at 92–95 % with `backdrop-filter: blur(12px)` (fallback: solid), `--shadow-sm`, CTA stays.
- Implementation:
  - The header is `position: fixed; inset-inline: 0; top: 0`. A static **spacer** of `--header-h-expanded` sits at the top of `<main>` so content never shifts (CLS = 0).
  - The state toggles with an `IntersectionObserver` on a 1 px sentinel placed 48 px from the top. It sets `data-compact` on the header. No scroll listeners, no per-frame JS.
  - The visual change uses CSS transitions on `transform` (logo `scale`, inner bar `translateY`) and `background-color`/`box-shadow`. Height is visually simulated by translating the inner content and clipping. It doesn't re-layout the page.
  - `html { scroll-padding-top: calc(var(--header-h-compact) + 1rem) }` so anchors and focused elements are never hidden (WCAG 2.4.11).
  - Reduced motion: state change without transition.
- Mobile (< md): constant `--header-h-mobile` (64 px). The logo is smaller at the top and shrinks slightly (≤ 0.9×) on scroll. Menu button (≥ 44 px) on the right. The phone CTA lives in the bottom action bar instead.
- Announcement banner sits **above** the header in normal flow at the very top and scrolls away. The header becomes fixed once the banner is out of view (sentinel after the banner).

## 9. Tiles that expand in place (signature interaction)
Purpose: big, friendly service tiles (inspired by orthosmile4kids.bg) that reveal details **without leaving the page**.

Layout
- Grid: 1 column at 320–479 px, 2 columns from 480 px, 3 columns from `lg` (4 when `density="compact"`). `grid-auto-flow: dense`.
- Each tile: large target (min-height 7.5rem mobile / 10rem desktop), icon or image, title (step-1), 1-line teaser, chevron/plus icon that rotates when open. Tone color per tile (from the accent palette) is optional.
- DOM order: `[tile 1][panel 1][tile 2][panel 2]…`. Panels have `grid-column: 1 / -1`. With `dense` packing, the tiles of the same row stay together visually and the open panel appears **directly below the row** of its tile. Reading and focus order stay logical: trigger → its panel → next tile.

Behavior and accessibility (Disclosure pattern, not a modal)
- The tile is a `<button aria-expanded aria-controls="panel-id">` wrapping the title (the heading level comes from the section: `<h3>` containing the button).
- The panel is a `<div role="region" aria-labelledby="tile-id" id="panel-id">`. It contains rich text, an optional CTA (call/booking) and an optional "Read more" link to the service page.
- One open at a time by default (`allowMultiple` prop). Opening another closes the previous one.
- Keyboard: Enter/Space toggles. Esc inside a panel closes it and returns focus to its tile. Tab order is natural.
- Deep link: opening sets `#<slug>` via `history.replaceState`. On load, a matching hash opens that tile and scrolls it into view (respecting `scroll-padding`).
- Motion: the panel animates `height: auto` + opacity (`--duration-base`, `--ease-standard`). The open tile lifts (`--shadow-md`, scale 1.01). Reduced motion: instant.
- On open, scroll so the panel's top is visible if it is below the fold (`scrollIntoView({ block: 'nearest' })`; smooth only without reduced motion).
- SEO: panel content is rendered in the HTML (hidden with `hidden="until-found"` where the browser supports it, falling back to `hidden`; verify React 19.3 renders the string value, otherwise set the attribute via a ref), so it is indexable and browser find-in-page can open it (`beforematch` event).
- No JS fallback: the content is server-rendered. Without JS, tiles render as open sections (progressive enhancement via a `data-js` class).

## 10. Mobile-first rules
- Base styles target 360 px. Add complexity upward (`md:` / `lg:`), never "fix down".
- The sticky action bar (Call · Directions · Book) is visible below `md`. `<body>` gets `padding-bottom: calc(var(--action-bar-h) + env(safe-area-inset-bottom))`.
- Tap targets ≥ 44 × 44 px for primary actions and ≥ 24 × 24 px minimum anywhere (WCAG 2.5.8). Keep ≥ 8 px between adjacent targets.
- Phone numbers are always `tel:` links in E.164 (`tel:+35982841190`) with the human format as text (`082 841 190`).
- No hover-only affordances. Everything hover reveals must also be reachable by tap and focus.
- Forms: one column, labels above fields, `inputmode`/`autocomplete` set (`tel`, `email`, `name`), 16 px minimum input font (prevents iOS zoom), sticky submit not needed.
- Avoid horizontal scrolling except intentional scroll-snap lists, which show a partial next card and have visible prev/next buttons on desktop.
- Performance on mid-range Android: no heavy blur stacks, ≤ 2 large images above the fold, `sizes` attribute on every image.

---

## 11. Component inventory
`ui/` = shadcn (Base UI) primitives restyled to tokens. `primitives/` = our layout/typography building blocks. `site/` and `sections/` = composed.

| Layer | Component | Notes |
| --- | --- | --- |
| ui | Button | Variants: `primary`, `secondary`, `outline`, `ghost`, `link`, `call` (phone icon + number). Sizes `sm/md/lg`. Supports `render` for links. |
| ui | Accordion | FAQ, mobile footer groups. |
| ui | Dialog, Drawer | Lightbox (Dialog), mobile menu (Drawer, swipe direction right/down), cookie preferences (Dialog). |
| ui | Input, Textarea, Checkbox, RadioGroup, Label, Field (description + error) | Contact form. |
| ui | Badge, Separator, Skeleton, Tooltip (desktop only, never essential), Sonner toast (optional) | |
| primitives | Container, Section (`tone`, `spacing`, `anchorId`), Stack, Grid | |
| primitives | Heading (`as`, `size`), Text (`size`, `tone`), Eyebrow (use rarely), Prose (rich text styles) | |
| primitives | ContentImage (Sanity loader, `sizes` required, `priority`), Icon, VisuallyHidden, SkipLink | |
| primitives | RichText (Portable Text renderer: headings, lists, links → internal/external/tel/email, callout, image) | |
| site | SiteHeader, Wordmark (text logo from the brand name in the display font when no logo SVG exists), MainNav, MobileNav, LanguageSwitcher, BookingCTA, MobileActionBar, AnnouncementBanner, SiteFooter, OpeningHours (today/open-now), ContactBlock | |
| sections | Hero, TextImage, Tiles, Faq, CtaBand, Team (+TeamCard), Gallery (+Lightbox), BlogTeaser (+ArticleCard), ContactHours, ProcessSteps, Testimonials, RichTextBlock | |
| forms | ContactForm, ConsentCheckbox, Turnstile | |
| map | MapEmbed (click-to-load), DirectionsLink | |
| consent | ConsentProvider, CookieBanner, CookiePreferences | |
| motion | MotionProvider, Reveal, motion presets | |

**Landmarks (every page, from `PageShell`):** skip link "to main content" (first focusable) → announcement `region` → `banner` (header with the primary `navigation` and the language `navigation`) → the single `main#main` (`tabIndex={-1}`; pages, `not-found` and `error` render inside it and never add their own `<main>`) → `contentinfo` (footer navigation and legal navigation) → the mobile quick-actions `navigation` (fixed, below `md`).

States every interactive component must show in the styleguide: default, hover, focus-visible, active, disabled, loading (where relevant), error (form), open/closed (disclosure).

---

## 12. Anti-patterns: what makes a site look AI-generated (reject these)
Typography and copy
- One word highlighted in a headline with a different color/italic/gradient ("We care about your **smile**").
- ALL-CAPS eyebrow labels above every section. Section labels nobody needs ("OUR SERVICES" above "Our services").
- Numbered markers (01 / 02 / 03) on content that isn't a sequence (only Process Steps may be numbered).
- Generic claims with no proof ("Best dental care", "World-class team"). Replace them with specifics (years, ages treated, real names, real photos).
- Emoji as icons. Exclamation marks in UI copy.

Layout
- Everything centered. Endless stacks of "heading + 3 equal cards with icons".
- Identical section rhythm down the page (same padding, same layout, same tone).
- "Big number + small label" stat rows as filler.
- Fake logos bar ("As seen on"), fake star ratings, fake testimonials.

Visual
- Purple-to-blue gradients, glowing blobs, glassmorphism on everything, neon shadows.
- Default shadcn look left unstyled (gray-on-white, default radius, default focus).
- Inter/system font with no typographic intent. Inconsistent radii and shadow on every card.
- Random 3D illustrations or AI-generated people. Cartoon tooth mascots on every section.
- Dark mode by default for a health/family business.

Interaction
- Auto-rotating carousels. Scroll-jacking, parallax everywhere, elements flying in from the sides.
- Modals for content that could expand in place. Hover-only menus.
- Click targets smaller than 44 px on mobile. Pop-ups on page load.

---

## 13. Client preset example: Rumi Dent (direction only, to be finalized with real photos)
Reference analysis (from the brief): drcvety.com (emotional close-up photos, confident type, tidy playful decoration), happykids-dental.com (warm hero with cut-out kids on soft shapes; quick info cards for hours/location/booking; "kids love us, parents trust us"), orthosmile4kids.bg (shrinking header, big tiles, but tiles must expand in place, not navigate), vedaclinic.bg (calm premium feel, numbered first-visit process, rich FAQ), shababdent.com (real clinic photos, price list, cross-link to adult services; avoid its dated, static look).

- Mood: *calm, warm, sunny, clean*. A playful accent on a grown-up base. Parents are the decision makers, so the site must feel safe and professional first.
- Palette direction: fresh mint/teal or soft sky blue as the brand hue (hygiene, calm), a warm sunny accent (apricot/yellow) for tiles and small shapes, warm off-white backgrounds. An adult-services sub-tone is slightly cooler and more neutral, so the adult dentist's section feels distinct but on-brand.
- Type direction: a friendly rounded or humanist display face with Cyrillic (e.g. Nunito / M PLUS Rounded 1c / Comfortaa for display, Onest / Manrope / Golos Text for body). Choose 1–2 and test in BG.
- Logo: the client wants only a good-looking wordmark ("Руми Дент"). Use the `Wordmark` component (display font, tuned letter-spacing, an optional small accent glyph). Export SVG/PNG variants at the end (deliverable from the offer).
- Signature elements: blob-masked portraits of the two dentists (the children's dentist featured first and larger), service tiles in accent tones (kids' services first, an "For adults" group after), a "First visit in 4 steps" process, an FAQ for anxious parents, a hours/contacts block with "Open now".
- Avoid: cartoon overload, primary-color rainbow palettes, Comic-style fonts.
