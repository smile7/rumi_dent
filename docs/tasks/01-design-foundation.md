# Phase 01 — Design tokens, primitives, styleguide

**Goal:** a token-driven design system that a new client re-themes by editing **one file** (`src/styles/tokens.css`) + `src/config/fonts.ts`. Rumi Dent is the first preset, used to stress-test the design.
**Read first:** `docs/DESIGN-SYSTEM.md` (all), `.cursor/rules/styling-tokens.mdc`, `.cursor/rules/components-a11y.mdc`. Use the **frontend-design** skill for visual decisions and **web-design-guidelines** for review.
**Note:** The `/styleguide` route lives under `[locale]` (Phase 02). In this phase, build it at `src/app/styleguide/page.tsx` temporarily and move it in T02.2.

---

### T01.1 — Tokens and Tailwind v4 theme
**Steps**
1. `src/styles/tokens.css` following DESIGN-SYSTEM §2 exactly: Layer 1 primitives (OKLCH palette: brand, accent, neutral, plus status colors), Layer 2 semantic tokens (`--color-bg`, `--color-surface`, `--color-fg`, `--color-muted-fg`, `--color-primary`/`-fg`, `--color-accent`/`-fg`, `--color-border`, `--color-ring`, `--color-success/warning/danger`), Layer 3 component tokens (header heights, tile radius, button radius). Fluid type scale (`--text-step--1 … --text-step-6` with `clamp()`), spacing, radius, shadows, motion durations/easings.
2. `src/styles/globals.css`: `@import "tailwindcss";`, `@import "./tokens.css";`, `@theme inline` mapping semantic tokens to Tailwind utilities (`bg-surface`, `text-fg`, `text-step-2`…), `@custom-variant dark` (prepared, off by default), base layer (`scroll-padding-top: var(--header-h)`, `text-wrap: pretty` on paragraphs, `balance` on headings, focus-visible ring, `prefers-reduced-motion` reset, `::selection`).
3. shadcn init: `pnpm dlx shadcn@latest init` → choose **Base UI** and CSS variables. Map shadcn's variable names (`--background`, `--primary`…) to **our** semantic tokens in `globals.css` so shadcn components inherit the theme. Don't keep a second palette.
4. Rumi Dent preset values (DESIGN-SYSTEM §13), checked for contrast: every fg/bg pair used ≥ 4.5:1 (text) or 3:1 (large text/UI). Add `scripts/check-contrast.ts` that parses the tokens and asserts the defined pairs (run in `pnpm check`).
**Files:** `src/styles/tokens.css`, `src/styles/globals.css`, `components.json`, `src/lib/utils.ts`, `scripts/check-contrast.ts`.
**AC:** No hex/rgb literal outside `tokens.css`; changing `--brand-*` re-themes everything; contrast script passes.
**Done check:** `pnpm check`; `rg -n "#[0-9a-fA-F]{3,8}\b|rgb\(" src --glob '!src/styles/tokens.css'` returns nothing relevant.

### T01.2 — Fonts
**Steps**
1. `src/config/fonts.ts`: `next/font/google` for display + body, **subsets `['latin', 'cyrillic']`** (BG requires Cyrillic), `display: 'swap'`, CSS variables `--font-display`, `--font-body`, `adjustFontFallback`. Rumi Dent: a rounded, friendly display font + a neutral body font from the verified Cyrillic list in DESIGN-SYSTEM §3 (e.g. display "Nunito" or "M PLUS Rounded 1c", body "Onest" or "Manrope"). Propose 2–3 pairings in `/styleguide` and let Silvena choose.
2. Wire the variables in `@theme` (`--font-display`, `--font-sans`).
3. `Wordmark` component: the logo is the brand name set in the display font (SVG fallback in `public/brand/` is generated later). Accept `variant: full | compact` for the shrinking header.
**Files:** `src/config/fonts.ts`, `src/styles/globals.css`, `src/components/site/Wordmark.tsx`.
**AC:** Bulgarian text renders in the chosen fonts with no fallback glyphs (check "Щъркел, юначе, ѝ"). There is no layout shift on font swap (CLS < 0.01 in Lighthouse).
**Done check:** screenshot of the type specimen in BG and EN.

### T01.3 — Layout and type primitives
**Steps:** Build `Container` (widths: prose/content/wide), `Section` (vertical rhythm, `tone: default|muted|brand`, `aria-labelledby` support), `Stack`/`Cluster` (or utility recipes), `Heading` (`level` decoupled from `size`), `Text`, `Prose` (styles Portable Text output), `Icon` (lucide-react, `aria-hidden` by default, labelled when standalone), `VisuallyHidden`. All are server components and use tokens only.
**Files:** `src/components/primitives/*.tsx` + tests for Heading level/size mapping.
**AC:** Each primitive is typed with narrow props (no `className` soup, though `className` stays allowed for composition). No hardcoded strings.
**Done check:** `pnpm check`.

### T01.4 — shadcn components, restyled
**Steps**
1. Add: `button`, `input`, `textarea`, `label`, `checkbox`, `select` (only if needed), `dialog`, `sheet` (mobile nav), `drawer`, `accordion`, `tabs`, `tooltip` (avoid relying on it for essential info), `separator`, `badge`, `card`, `sonner` (toasts). Use the MCP (`shadcn` server) to look up the current API. The Base UI variant uses the `render` prop, not `asChild`.
2. Restyle via tokens: sizes ≥ 44×44 px touch targets (WCAG 2.5.8 minimum is 24, our target is 44), visible focus ring (`--color-ring`, 2px + offset), `Button` variants `primary | secondary | ghost | link | call` (call = phone CTA style), and `asChild`-equivalent for links via `render`.
3. Keep the component files editable (it's shadcn), but don't add business logic there.
**Files:** `src/components/ui/*`.
**AC:** All components keyboard-operable; dialogs/sheets trap focus and restore it; no issues in a manual accessibility check of the styleguide (Lighthouse accessibility audit + keyboard).
**Done check:** Vitest render tests for the keyboard behavior jsdom can cover (dialog/sheet open and close on Escape, accordion toggles); manual keyboard pass on `/styleguide` (focus trap and focus return), noted in PROGRESS.

### T01.5 — Motion foundation
**Steps:** `MotionProvider` (client): `LazyMotion features={domAnimation} strict` + `MotionConfig reducedMotion="user"`. `Reveal` (fade/translate on enter, `once`, uses `m.div` from `motion/react-m`, durations from tokens; renders children statically when reduced motion is on). `motion` tokens mirrored in `src/components/motion/tokens.ts` (read from the same values as the CSS). Prefer CSS transitions for simple hover/press. Motion is for enter and layout transitions only.
**Files:** `src/components/motion/{MotionProvider,Reveal,tokens}.tsx`.
**AC:** With `prefers-reduced-motion: reduce` there is no transform animation; motion JS < 20 kB gz added to the first load (check the bundle analyzer / `next-bundle-optimizer` skill).
**Done check:** Vitest render test for `Reveal` with `matchMedia` mocked to reduced motion (renders static children); bundle note in PROGRESS.

### T01.6 — /styleguide page
**Steps:** One page showing: palette swatches with token names and contrast ratios, type scale (BG + EN sample text), spacing/radius/shadow scales, buttons (all variants/states incl. disabled/loading), form controls with error states, cards, accordion, dialog/sheet triggers, the header in both states, motion samples, and (from Phase 06) every section with seed-like data. Gate it with `NEXT_PUBLIC_ENABLE_STYLEGUIDE` and set `robots: noindex`.
**Files:** `src/app/styleguide/page.tsx` (moved later), `src/components/styleguide/*`.
**AC:** Renders at 360/768/1280 without horizontal scroll; noindex meta present; 404 when disabled.
**Done check:** Vitest test for the 404-when-disabled and noindex behavior; manual review at 360/768/1280 in the browser.

### T01.7 — Screenshot script — SKIPPED (ADR-011)
Dropped with Playwright. No replacement; visual review is manual.

**Phase gate:** Silvena reviews the styleguide (font pairing, palette, button style, radius) before Phase 05.
