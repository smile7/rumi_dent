# Phase 04 — Content layer, caching, preview

**Goal:** a thin, typed, CMS-agnostic content API (`@/lib/content`) read at build time, a publish → rebuild loop, draft mode and Presentation. Components never see Sanity shapes.
**Read first:** `docs/ARCHITECTURE.md` §5–6, `docs/DECISIONS.md` ADR-002/005/012, `.cursor/rules/content-layer.mdc`.

---

### T04.1 — Client and `sanityFetch`
**Steps:** `src/lib/content/sanity/client.ts` (`createClient` from `next-sanity`, `useCdn: true`, `perspective: 'published'`, `stega: { studioUrl }` disabled by default). `token.ts` (`server-only`, read token). `fetch.ts` implementing the contract in ARCHITECTURE §5.2 exactly (draft-mode switch, `stega` rules, no cache tags, ADR-012).
**AC:** Draft mode uses the token, otherwise no token is sent. Published fetches don't make a route dynamic (`next build` keeps the routes static).
**Done check:** unit tests with a mocked client (assert options per mode).

### T04.2 — Domain types, mappers, ContentImage, RichText
**Steps**
1. `src/lib/content/types.ts`: CMS-agnostic models (`SiteSettings`, `Navigation`, `Page`, `Service`, `Article`, `LegalPage`, `TeamMember`, `FaqItem`, `GalleryItem`, `Testimonial`, `Announcement`, `Section` union, `ImageAsset`, `RichTextValue` (opaque type alias), `LinkTarget` (`{ href, external, label }`), `Translations = Partial<Record<Locale, string>>` (href per locale)).
2. `queries/*.ts` with `defineQuery` (so typegen picks them up). Use shared projections in `fragments.ts` as **plain string constants interpolated** into `defineQuery`. Verify typegen handles them; if not, inline the fragments (note in PROGRESS).
3. Field-level i18n in GROQ: `coalesce(title[language == $locale][0].value, title[language == $fallback][0].value)`. Pass `$locale` and `$fallback = 'bg'`.
4. `mappers/*.ts`: typegen result → domain types; `stegaClean` enum-like values; resolve internal links to localized hrefs via `getPathname`; drop unknown sections with a dev warning.
5. `image-loader.ts` (ADR-005) and `ContentImage` (server component using `next/image` with the loader, `sizes` required prop, `lqip` placeholder, hotspot → `objectPosition`). `RichText` (`@portabletext/react` with our primitives; internal links via next-intl `Link`; images via ContentImage; headings shifted so the page owns h1).
**AC:** No `sanity.types` import outside `src/lib/content/sanity/**`. Mappers have unit tests with fixture data.
**Done check:** `pnpm test src/lib/content`.

### T04.3 — Public API (`get*`) and tests
**Steps:** `src/lib/content/index.ts` exports: `getSiteSettings(locale)`, `getNavigation(locale)`, `getAnnouncement(locale)` (the announcement that is active now or starts next and hasn't ended at build time; returns `startsAt`/`endsAt` so the banner can hide itself client-side, CONTENT-MODEL announcement), `getPageByKey(key, locale)`, `getPageBySlug(slug, locale)`, `getServices(locale, { category? })`, `getServiceBySlug`, `getArticles(locale, { page, pageSize })` (returns `{ items, total, pages }`), `getArticleBySlug`, `getLegalPage`, `getTeam`, `getFaq({ category? })`, `getGallery({ album?, limit? })`, `getTestimonials({ featured? })`, `getTranslations(docId)` (for the switcher and hreflang), `getStaticSlugs(type)` (for `generateStaticParams`, `stega: false`). Each is wrapped in React `cache()`.
**AC:** Every function returns domain types or `null`; never throws on missing content (logs and returns null; route decides `notFound()`).
**Done check:** unit tests for the param/null behavior; a local script `pnpm tsx scripts/smoke-content.ts` prints a summary from the development dataset.

### T04.4 — Publish → rebuild webhook
**Context:** ADR-012, ARCHITECTURE §6.2. No route handler, no tags, no secret in the Worker.
**Steps:** Configure the Sanity GROQ webhook on the sandbox project (dataset `production`, drafts off) → GitHub `repository_dispatch` (`event_type: sanity-publish`) with a fine-grained PAT. Confirm `deploy.yml` runs on the dispatch and on the daily schedule, and that a burst of 3 quick publishes produces at most 2 builds (concurrency group). Write the exact webhook settings into NEW-CLIENT §3 if anything differs from the doc.
**AC:** Publishing a text change in the Studio starts a deploy and the change is live on workers.dev in ≤ 10 min. Saving a draft starts nothing.
**Done check:** notes in PROGRESS with the measured publish → live time and a link to the Actions run.

### T04.5 — Draft mode, PreviewTools, Presentation
**Steps:** `/api/draft-mode/enable` (`defineEnableDraftMode`), `/api/draft-mode/disable` (redirect back, safe-redirect same-origin only). `src/lib/content/preview.tsx` (`PreviewTools`: `<VisualEditing />` + "Exit preview" button hidden in Presentation). Render it in the `[locale]` layout only when draft mode is on. `src/sanity/presentation/resolve.ts`: `locations` for page/service/article/legalPage using the **same** pathnames (import from `src/i18n/pathnames.ts`, no duplication), `mainDocuments` for each route pattern. Add `presentationTool` to the Studio.
**AC:** In Presentation, clicking any visible text focuses the field; drafts show without publishing; metadata and JSON-LD never contain stega characters (test: `stegaClean(x) === x` on rendered `<head>`).
**Static-only notes (ADR-012):** draft requests bypass the static copy and render on the Worker; record their CPU time. Check whether a never-published draft (slug not prerendered, `dynamicParams = false`) renders in Presentation; if it 404s, document the workaround (ARCHITECTURE §6.3).
**Done check:** manual Presentation test on preview; unit test that the metadata and JSON-LD builders return stega-clean values for stega-encoded input; manual check of the page source in draft mode for zero-width characters in `<head>`.

### T04.6 — Boundary enforcement
**Steps:** ESLint `no-restricted-imports`: `@/lib/content/sanity/*`, `next-sanity`, `@sanity/*` and `sanity.types` are forbidden outside `src/lib/content/**`, `src/sanity/**`, `src/app/admin/**`, `src/app/api/**`, `scripts/**`, `sanity.*.ts`. `scripts/check-boundaries.ts` double-checks via the import graph (simple regex scan is enough) and runs in `pnpm check`.
**AC:** An intentional violation in a component fails `pnpm check` with a message pointing to `.cursor/rules/content-layer.mdc`.
**Done check:** add a violating import → fails; remove → passes.

### T04.7 — Static params and sitemap data
**Steps:** `getSitemapEntries()` in the content layer: all published routable docs with `_updatedAt`, language and translation map (for alternates). Static params helpers per route (`locale × slug`). `dynamicParams = false` on CMS routes (ADR-012: unknown slugs 404; new content arrives with the next deploy).
**AC:** Returns correct localized URLs for both languages, including system pages via pathnames.
**Done check:** unit test with fixtures; `pnpm build` output lists the prerendered routes.
