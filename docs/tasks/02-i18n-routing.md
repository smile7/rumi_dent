# Phase 02 — i18n and routing

**Goal:** BG (default) + EN with localized pathnames, correct `<html lang>`, hreflang alternates and a language switcher that keeps the visitor on the equivalent page. Adding a third language should be a config change plus messages and content.
**Read first:** `docs/ARCHITECTURE.md` §7, `.cursor/rules/i18n.mdc`, next-intl docs (App Router, `proxy.ts`, root params). Use the next-intl version pinned in ARCHITECTURE §1.

---

### T02.1 — Routing config, proxy, navigation, request config
**Steps**
1. `src/config/i18n.ts`: `locales = ['bg','en'] as const`, `defaultLocale = 'bg'`, `localeMeta` exactly as in ARCHITECTURE §7.1 (`label`, `short`, `hreflang` `bg`/`en`, `ogLocale` `bg_BG`/`en_GB`, `intl` `bg-BG`/`en-GB`). Add `dir` only when an RTL language is ever needed.
2. `src/i18n/pathnames.ts`: the pathname table from ARCHITECTURE §7 (`/services` → `/uslugi`, `/about` → `/za-nas`, `/gallery` → `/galeriya`, `/contact` → `/kontakti`, `/legal/[slug]` → `/pravna-informaciya/[slug]`, `/blog/page/[n]` → `/blog/stranica/[n]`, …). Use the slugs exactly as in the table (Latin transliteration; the client may adjust them before launch, since changing them later needs redirects).
3. `src/i18n/routing.ts` (`defineRouting` with `localePrefix: 'always'`, `localeDetection: true` with cookie), `navigation.ts` (`createNavigation`), `request.ts` (`getRequestConfig` using `next/root-params` `locale` per next-intl ≥ 4.x guidance, falling back to `requestLocale`; load `messages/<locale>.json`).
4. `src/proxy.ts`: next-intl middleware. `matcher` excludes `api`, `admin`, `_next`, `_vercel`, files with extensions, `llms.txt`, `sitemap.xml`, `robots.txt`.
5. `next.config.ts`: `createNextIntlPlugin('./src/i18n/request.ts')`.
6. `global.d.ts`: next-intl `AppConfig` augmentation (`Locale`, `Messages` from `messages/bg.json`) for typed keys. `messages/en.json` must have the same keys (a test asserts key parity).
**Files:** `src/config/i18n.ts`, `src/i18n/*`, `src/proxy.ts`, `messages/{bg,en}.json`, `global.d.ts`, `next.config.ts`, `src/i18n/messages.test.ts`.
**AC:** `/` → 307 to `/bg` (or `/en` per Accept-Language/cookie); unknown locale → 404; typed `t('…')` keys error on typos.
**Done check:** `pnpm test`, `curl -I localhost:3000/`.

### T02.2 — Locale root layout, not-found, catch-all
**Steps**
1. Remove `src/app/layout.tsx` and `src/app/page.tsx`. `src/app/[locale]/layout.tsx` is the root layout: validates the locale (`hasLocale` → `notFound()`), `<html lang={locale}>` (no `setRequestLocale`: `request.ts` reads `next/root-params`, ARCHITECTURE §7.2) (`bg`/`en`), font variables on `<html>`, `NextIntlClientProvider` (pass only the namespaces client components need), `MotionProvider`, `generateStaticParams` for locales, base `generateMetadata` (`metadataBase`).
2. `src/app/[locale]/not-found.tsx` (localized, with links home/contact), `src/app/[locale]/[...rest]/page.tsx` → `notFound()`. A root-level 404 for paths outside locales: rely on the proxy redirect. Optionally use the experimental `global-not-found.js` only if needed and note it.
3. `src/app/admin/layout.tsx`: its own root layout (`<html lang="en">`), no site providers.
4. Move `/styleguide` under `[locale]`.
**AC:** View source shows `<html lang="bg">` on `/bg` and `lang="en"` on `/en`; `/bg/nonexistent` shows the BG 404 with status 404.
**Done check:** against `pnpm dev`: `curl -I localhost:3000/bg/nonexistent` gives 404; `curl -s localhost:3000/bg | rg '<html lang="bg"'` and the same for `/en`.

### T02.3 — Alternates helper and LanguageSwitcher
**Steps**
1. `src/lib/seo/alternates.ts`: `buildAlternates({ pathname, params, translations? })` → `{ canonical, languages: { bg: …, en: …, 'x-default': … } }` (keys = `localeMeta[l].hreflang`). For static routes, use `getPathname` from navigation. For CMS docs, use the translation map from the content layer (Phase 04 supplies it; stub the type now).
2. `LanguageSwitcher` (client): a list of links (not a select), current locale marked `aria-current="true"`, `hreflang` + `lang` on each link, labels in native language ("Български", "English"). For CMS pages, use the translated slug map passed from the server. If a translation is missing, link to that locale's equivalent parent (e.g. the services index) and mark it as such. Persist the choice through next-intl's cookie (default behavior).
**Files:** `src/lib/seo/alternates.ts` (+ test), `src/components/site/LanguageSwitcher.tsx`.
**AC:** Switching on `/bg/uslugi` goes to `/en/services`; the alternates test covers static, dynamic and missing-translation cases.
**Done check:** `pnpm test src/lib/seo/alternates.test.ts`.

### T02.4 — Formatting helpers
**Steps:** `src/lib/i18n/format.ts`: `formatDate` (bg: "19 ноември 2026 г."), `formatTimeRange` (24h, "09:00–18:00" with en dash), `formatWeekdayRange`, `formatPhone` (display `+359 88 123 4567`, href `tel:+359881234567`), `formatPrice` (EUR via `Intl.NumberFormat`, BG "25,00 €"). Use `next-intl` `useFormatter`/`getFormatter` where possible. Centralize the formats in `src/i18n/formats.ts`.
**AC:** Unit tests for both locales, including edge cases (closed days, midnight).
**Done check:** `pnpm test src/lib/i18n`.

### T02.5 — Switcher checks and "add a language" doc check
**Steps:** Vitest render test for `LanguageSwitcher` (one link per locale, `aria-current`, `hreflang` + `lang`, fallback link for a missing translation). Manual check that the next-intl cookie remembers the choice and that the alternates appear in `<head>` (`curl -s localhost:3000/bg | rg hreflang`). Then temporarily add `de` to `locales` in a branch, verify the type errors guide you to everything needed (messages, pathnames, Sanity language list), and document the exact steps in `docs/ARCHITECTURE.md` §7 "Adding a language". Revert.
**AC:** The checklist "Adding a language" is accurate and ≤ 6 steps.
**Done check:** `pnpm test`; manual cookie check noted in PROGRESS; doc updated.
