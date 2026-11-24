# Phase 07 — Routes and pages

**Goal:** all v1 routes in both locales, fully content-driven, statically generated, with basic metadata (full SEO in Phase 10).
**Read first:** `docs/ARCHITECTURE.md` §4–5, §7 (pathnames), `docs/PRD.md` (pages), `docs/SEO.md` (buildMetadata rules), `.cursor/rules/i18n.mdc`.
**Every route:** `await params`; validate the locale (no `setRequestLocale`, see ARCHITECTURE §7.2); fetch via `@/lib/content`; `notFound()` on null; `generateStaticParams`; `generateMetadata` via `buildMetadata` (stega off); alternates from translations; JSON-LD slot.

---

### T07.1 — Home and generic CMS pages
**Steps:** `[locale]/page.tsx` → `getPageByKey('home')` → SectionRenderer. `[locale]/[slug]/page.tsx` → `getPageBySlug` (excluding system pageKeys and reserved slugs). Both prerendered. The 404 for unknown slugs is the localized not-found.
**AC:** Home renders the seed fully in both locales; a new page published in Studio appears at its URL after the publish-triggered deploy (ADR-012); an unknown slug is a 404 (`dynamicParams = false`).
**Done check:** `pnpm build` lists the prerendered routes; `curl -I` gives 200 for `/bg`, `/en` and one generic page per locale.

### T07.2 — Services index and service detail
**Steps:** Index (`/bg/uslugi`, `/en/services`) = system page `services` sections (typically a Tiles section with `source: services`) + optional category grouping. Detail (`/uslugi/[slug]`): hero-lite (title, audience badge "За деца"/"За възрастни", image), body rich text, FAQ (related), related services, CTA band (booking/call), breadcrumbs (visual + JSON-LD later). Audience filter chips on the index (all / children / adults) as links with query or as client filter (pick static-friendly: client filter over prerendered data).
**AC:** Each service URL is localized and prerendered; the language switcher maps BG↔EN slugs; a service missing its EN translation shows no EN alternate and the switcher falls back to `/en/services`.
**Done check:** unit tests for the switcher mapping and the missing-translation fallback (seed one BG-only service); manual check in the browser.

### T07.3 — About and Gallery
**Steps:** `about` system page (team section, story, values, clinic photos). `gallery` system page with the full gallery section (albums: clinic, team, kids' corner, etc.). Gallery respects `showsPatient`/consent (already validated in Studio; the query also filters `consentOnFile == true` when `showsPatient`).
**AC:** Images lazy-load below the fold; no patient image without consent reaches the page (query-level guarantee + unit test on the query string/params).
**Done check:** screenshots + Lighthouse on gallery (CLS < 0.05).

### T07.4 — Blog index, pagination, article
**Steps:** `/blog` (page 1), `/blog/page/[n]` (`/blog/stranica/[n]` in BG) with `rel` prev/next links and canonical to itself, page 1 at `/blog` only (`/blog/page/1` → redirect). Article: title, date, updated date, author (teamMember ref → author card, important for health E-E-A-T), cover image, rich text, table of contents for h2s (optional), related articles, CTA. Reading time computed in the mapper.
**AC:** Out-of-range page → 404; article BG/EN mapping via translations; `<time>` elements correct.
**Done check:** unit tests for pagination (page range, out-of-range → `notFound()`) and reading time; `curl -I` shows `/blog/page/1` redirects to `/blog`.

### T07.5 — Contact and legal pages
**Steps:** `contact` system page: ContactHours section with map + form (form arrives in Phase 08; leave a slot), prominent phone and Viber/WhatsApp. Legal: `/pravna-informaciya/[slug]` (`/legal/[slug]`): `legalPage` docs (privacy, cookies, terms), with "last updated" date, a print-friendly style and an anchor TOC. Legal pages with unresolved `[[placeholders]]` render a visible warning banner on non-production environments, and the build fails in production if any remain (check in `getLegalPage` + a CI script).
**AC:** Contact page usable at 360px with one thumb (phone CTA above the fold); placeholder guard works.
**Done check:** manual check at 360px + run the placeholder check against seed data (should fail in prod mode).

### T07.6 — `buildMetadata` (basic)
**Steps:** `src/lib/seo/buildMetadata.ts`: title template (`%s | Brand`), description fallback chain (seo.description → excerpt → settings description), canonical + alternates, `robots` noindex on non-production `NEXT_PUBLIC_ENV` and for `seo.noIndex`, OG basics (title, description, image from Sanity CDN 1200×630 crop, locale + alternateLocale). Use it on every route.
**AC:** Unit tests for fallbacks and noindex logic; every route has a unique title and description in both locales (checked by fetching the sitemap URLs over plain HTTP; T11.6 automates this later).
**Done check:** `pnpm test src/lib/seo` + the duplicate check over the sitemap URLs.
