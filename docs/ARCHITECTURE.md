# Architecture

Status: v1 plan, verified against official docs and the npm registry on **2026-11-19**.
Scope: the reusable starter template. Client-specific values live in `src/config/*`, `src/styles/tokens.css`, `messages/*` and Sanity content.

---

## 1. Stack and pinned versions

Install with exact versions (`pnpm add -E`). Upgrade deliberately, one PR per major, and re-run the Phase 00 deploy spike after upgrading Next, OpenNext or Wrangler.

| Area | Package | Version | Notes |
| --- | --- | --- | --- |
| Runtime | Node.js | **24 LTS** (24.22.x) | `.nvmrc` = `24`. Node 26 is LTS too, but 24 has the widest ecosystem testing. Sanity, Wrangler and Vitest need ≥ 22.12. |
| Package manager | pnpm | 12.21.0 | Pin it with the `packageManager` field. |
| Framework | next | 16.4.6 | App Router, Turbopack (default). OpenNext requires `>=16.4.5`. |
| | react / react-dom | 19.3.1 | |
| Language | typescript | **6.0.3** | **Not 7.x.** `typescript-eslint` 8.73 supports `<6.1.0` only. |
| Styling | tailwindcss / @tailwindcss/postcss | 4.3.5 | CSS-first config with `@theme`. |
| | tw-animate-css | 1.4.0 | shadcn's animation utilities. |
| | @tailwindcss/typography | 0.5.20 | Only for `Prose` (blog / legal). |
| UI | shadcn (CLI) | 4.23.0 | Init with the **Base UI** base (current shadcn default; Drawer is Base UI now, not Vaul). |
| | @base-ui/react | 1.9.0 | Installed by shadcn. |
| | lucide-react | 1.76.0 | Icons. |
| | class-variance-authority / clsx / tailwind-merge | 0.7.1 / 2.1.1 / 3.7.0 | |
| Motion | motion | 14.14.0 | `motion/react`, `motion/react-m`, `LazyMotion`. |
| i18n | next-intl | 4.15.x | `defineRouting` + `pathnames`, `next/root-params` (Next ≥ 16.3). |
| CMS | sanity | 6.24.0 | Studio v6. |
| | next-sanity | 13.5.1 | Embedded Studio, `defineEnableDraftMode`, `VisualEditing`, `parseBody`. |
| | @sanity/vision | 6.24.0 | GROQ playground (dev only). |
| | @sanity/document-internationalization | 6.3.0 | Document-level i18n (needs internationalized-array ≥ 5.3.10 as a peer). |
| | sanity-plugin-internationalized-array | 5.3.10 | Field-level i18n. v5 stores the language in a `language` field, not in `_key`. |
| | @sanity/orderable-document-list | 2.0.29 | Drag-to-order for team, services, FAQ, gallery. |
| | @sanity/image-url | 2.2.0 | URL builder used by our image loader. |
| | @portabletext/react | 8.0.1 | Rich text rendering. |
| | styled-components | 6.6.0 | Peer dependency of the Studio. |
| Hosting | @opennextjs/cloudflare | 1.20.17 | Supports Next 16, static-assets incremental cache, image binding. `proxy.ts` (Node middleware) is **experimental** since 1.20.3. |
| | wrangler | 4.165.0 | OpenNext requires `^4.148.0`. |
| Forms | react-hook-form / @hookform/resolvers | 7.92.0 / 7.0.7 | |
| | zod | 4.6.7 | Shared client/server schemas. |
| | @marsidev/react-turnstile | 1.6.3 | Cloudflare Turnstile widget. |
| Email | resend | 6.39.0 | Transactional email API (fetch-based, works on Workers). |
| | react-email | 6.11.16 | **v6 merged all components here.** `@react-email/components` is deprecated. Import from `react-email`. |
| SEO | schema-dts | 2.1.0 | Typed JSON-LD. |
| Scripts | @clack/prompts | 1.9.0 | `pnpm new-client` prompts (dev only). |
| Tests | vitest | 5.1.1 | + @vitejs/plugin-react 6.3.0, jsdom 31.0.1, @testing-library/react 16.3.3 |
| Lint/format | eslint | **9.39.x** | **Not 10.** `eslint-plugin-jsx-a11y` 6.10.2 (bundled by `eslint-config-next`) peers on ESLint ≤ 9. |
| | eslint-config-next | 16.4.6 | Flat config; `next lint` was removed in Next 16, so run the ESLint CLI. |
| | eslint-config-prettier / prettier / prettier-plugin-tailwindcss | 10.1.8 / 3.10.1 / 0.8.1 | |

### Third-party services (one account per client, owned by the client)

| Service | Plan | Free-tier facts that matter (checked 2026-11-19) |
| --- | --- | --- |
| Cloudflare Workers | **Free only** (ADR-012: never a payment card) | 100k requests/day, **10 ms CPU per request**, 64 MiB worker size (uncompressed), 1 s startup. Prerendered pages are read from Static Assets (cache interception), so the Worker does no rendering for public pages. R2, D1, Durable Objects and Workers Paid are **not used**. |
| Cloudflare Images (binding) | Free | 5,000 unique transformations/month. After that, new transforms fail on Free (no charge). We route CMS images to the Sanity CDN instead, so this only serves a few local assets. |
| Cloudflare Turnstile | Free | |
| Cloudflare Web Analytics | Free | Cookieless. |
| Sanity | Free | 20 seats, **2 roles (Administrator, Viewer)**, 2 datasets (**public only**), 10k documents, 2k unique attributes per dataset, **2 GROQ webhooks**, 1M CDN / 250k API requests, 100 GB assets, 100 GB bandwidth per month. AI Assist, scheduled drafts and comments are paid-only. |
| Resend | Free | 3,000 emails/month, **100/day**, 3 domains. |
| Umami Cloud (optional) | Hobby (free) | 100k events/month, 1 website, cookieless. |
| GitHub Actions | Free | 2,000 minutes/month on private repos (unlimited on public). Each publish = one build + deploy (~3–5 min). |
| GitHub Actions | Free | 2,000 minutes/month on private repos (unlimited on public). Each publish = one build + deploy (~3–5 min). |

---

## 2. System overview

```
Visitor ──► Cloudflare edge ──► Worker (OpenNext, Next.js 16)
                                   │  ├─ prerendered HTML/RSC from Static Assets (built in CI)
                                   │  ├─ Server Actions (contact form) ──► Turnstile siteverify ──► Resend
                                   │  └─ draft mode (Presentation preview only) ──► Sanity API
                                   ▼
                         Sanity Content Lake (API CDN) ◄── Sanity Studio (/admin embedded, or <client>.sanity.studio)
Publish: Sanity GROQ webhook ──► GitHub repository_dispatch ──► deploy.yml (next build + opennextjs-cloudflare deploy)
Images: browser ──► cdn.sanity.io (resized/AVIF/WebP via our loader); no Worker CPU spent.
```

Principles:
1. **Static only (ADR-012).** Every public page is prerendered at build time (`generateStaticParams`, `dynamicParams = false`). Publishing rebuilds and redeploys the site. Public requests never execute React on the Worker. That keeps us under the Free plan's 10 ms CPU limit, needs no payment card and makes the site fast.
2. **The CMS is behind one door.** `src/lib/content` is the only runtime code that knows about Sanity.
3. **Config over code per client.** A new client changes `src/config/*`, `tokens.css`, `messages/*` and content, not components.
4. **Everything localized by construction.** Locales come from one config. Types make missing translations visible.

---

## 3. Key decisions (summary; full ADRs in `docs/DECISIONS.md`)

| # | Decision | Why |
| --- | --- | --- |
| ADR-001 | Hybrid i18n: **document-level** for routable types (`page`, `article`, `service`, `legalPage`); **field-level** (internationalized arrays) for shared, non-routable types | See §7. |
| ADR-002 | Manual `sanityFetch` (draft-aware). **Not** `defineLive` | No browser EventSource for every visitor, no Live Content API quota use, fully static pages. Visual Editing still works in Draft Mode. (Its tag/revalidate part is superseded by ADR-012.) |
| ADR-012 (supersedes 003) | **Static only**: read-only static-assets cache, every page prerendered, Sanity publish → GitHub `repository_dispatch` → rebuild + deploy. No ISR, R2, D1, DO or tag revalidation | No payment card ever, one infra variant, no Worker CPU for public pages. Publishes take minutes, not seconds. |
| ADR-004 | `src/proxy.ts` for next-intl, with a fallback to `src/middleware.ts` (edge) | `proxy.ts` is the Next 16 convention. OpenNext support is experimental, so the Phase 00 spike must confirm it. |
| ADR-005 | CMS images via the Sanity Image CDN with our own `next/image` loader | Free resizing and modern formats. No Cloudflare transformation quota. Hotspot/crop supported. |
| ADR-006 | No `cacheComponents` (Cache Components/PPR) in v1 | Classic fetch-tag caching is the best-trodden path on OpenNext. Revisit in v2 (ADR placeholder). |
| ADR-007 | `localePrefix: 'always'` (`/bg/…`, `/en/…`); `/` redirects to the default locale | Matches what the client was told. Simplest caching, unambiguous hreflang. `as-needed` is a config switch. |
| ADR-008 | Deploy via GitHub Actions with per-repo secrets (client-owned Cloudflare account) | Works across many client accounts. Preview versions on PRs. |
| ADR-009 | TypeScript 6.0.x and ESLint 9.39.x (not TS 7 / ESLint 10) | Peer-dependency compatibility, see §1. |

---

## 4. Folder structure

```
.
├── AGENTS.md  CLAUDE.md  README.md
├── .cursor/rules/*.mdc            # scoped agent rules
├── .cursor/mcp.json               # project MCP servers (see README)
├── .agents/skills/  .claude/skills/   # installed skills (npx skills)
├── .github/workflows/{ci.yml,deploy.yml}
├── docs/                          # this plan; keep it up to date
├── messages/{bg,en}.json          # UI strings only
├── public/
│   ├── _headers                   # static asset cache headers (Workers Static Assets)
│   ├── brand/                     # logo.svg, wordmark.svg, favicon set, og-fallback.jpg
│   └── fonts/                     # only TTFs needed for OG image generation (Cyrillic)
├── seed/                          # demo content + images for `pnpm seed`
├── scripts/                       # seed.ts, check-contrast.ts, check-boundaries.ts, new-client.ts
├── sanity.config.ts               # Studio config (shared by embedded /admin and `sanity deploy`)
├── sanity.cli.ts                  # projectId/dataset + typegen config
├── sanity.types.ts                # GENERATED (pnpm typegen), committed
├── schema.json                    # GENERATED (sanity schema extract), committed
├── next.config.ts  open-next.config.ts  wrangler.jsonc  cloudflare-env.d.ts
├── .env.example  .dev.vars.example
└── src/
    ├── proxy.ts                   # next-intl (fallback: middleware.ts)
    ├── env.ts                     # Zod-validated env (server/client split)
    ├── config/
    │   ├── i18n.ts                # locales, default, metadata (hreflang, labels, date locale)
    │   ├── site.ts                # static fallbacks: brand name, siteUrl, business type
    │   ├── features.ts            # feature flags (booking, priceList, reviews, ga4…)
    │   ├── cookies.ts             # registry of cookies/storage/3rd parties → banner + policy table
    │   └── fonts.ts               # next/font definitions
    ├── i18n/
    │   ├── routing.ts             # defineRouting({ locales, defaultLocale, pathnames, localePrefix })
    │   ├── pathnames.ts           # localized static pathnames
    │   ├── navigation.ts          # createNavigation(routing)
    │   └── request.ts             # getRequestConfig (root-params)
    ├── app/
    │   ├── [locale]/
    │   │   ├── layout.tsx         # ROOT layout for the site: <html lang>, fonts, providers, header/footer
    │   │   ├── page.tsx           # home (page doc with pageKey "home")
    │   │   ├── [slug]/page.tsx    # generic CMS pages
    │   │   ├── services/page.tsx  services/[slug]/page.tsx
    │   │   ├── about/page.tsx     gallery/page.tsx    contact/page.tsx
    │   │   ├── blog/page.tsx      blog/page/[n]/page.tsx   blog/[slug]/page.tsx
    │   │   ├── legal/[slug]/page.tsx
    │   │   ├── styleguide/page.tsx  # env-gated, noindex
    │   │   ├── not-found.tsx      [...rest]/page.tsx   # localized 404
    │   │   └── opengraph-image.tsx  # build-time fallback OG
    │   ├── admin/                 # Sanity Studio: own root layout, force-static
    │   │   ├── layout.tsx  [[...tool]]/page.tsx
    │   ├── api/
    │   │   └── draft-mode/{enable,disable}/route.ts
    │   ├── sitemap.ts  robots.ts
    │   └── llms.txt/route.ts
    ├── actions/contact.ts         # Server Action
    ├── components/
    │   ├── ui/                    # shadcn primitives (restyled to tokens)
    │   ├── primitives/            # Container, Section, Heading, Text, Prose, ContentImage, RichText, Icon
    │   ├── site/                  # SiteHeader, MobileNav, MobileActionBar, AnnouncementBanner, SiteFooter, LanguageSwitcher, BookingCTA, Wordmark
    │   ├── sections/              # one file per section type + SectionRenderer + registry
    │   ├── forms/                 # ContactForm, fields
    │   ├── consent/               # ConsentProvider, CookieBanner, PreferencesDialog
    │   ├── map/                   # MapEmbed (click-to-load), DirectionsLink
    │   ├── seo/                   # JsonLd
    │   └── motion/                # MotionProvider, Reveal, motion tokens
    ├── emails/ContactNotification.tsx  # React Email template
    ├── lib/
    │   ├── content/               # THE CMS BOUNDARY
    │   │   ├── index.ts           # public API (get* functions), re-exports domain types
    │   │   ├── types.ts           # domain models (CMS-agnostic)
    │   │   ├── image-loader.ts    # next/image loader → Sanity CDN
    │   │   ├── preview.tsx        # <PreviewTools/>: VisualEditing + DisableDraftMode (server component)
    │   │   └── sanity/            # client.ts, fetch.ts, queries/*.ts, fragments.ts, mappers/*.ts, token.ts
    │   ├── seo/                   # buildMetadata, jsonld/* builders, alternates
    │   ├── analytics/             # track(), adapters (none|cloudflare|umami|ga4)
    │   ├── i18n/                  # format helpers (dates, hours, phone)
    │   └── utils.ts               # cn() etc.
    ├── sanity/                    # STUDIO ONLY
    │   ├── schemaTypes/{documents,objects,sections,singletons}/*.ts  index.ts
    │   ├── structure.ts  presentation/resolve.ts  plugins.ts  env.ts
    │   └── components/            # custom Studio inputs/previews (minimal)
    └── styles/
        ├── globals.css            # @import tailwind, tokens, base layer
        └── tokens.css             # THE theme file per client (@theme)
```

Rules: `src/components/**` never imports from `src/lib/content/sanity/**`. Pages import from `@/lib/content` (index) only. An ESLint `no-restricted-imports` config plus `scripts/check-boundaries.ts` (run in CI) enforce this.

---

## 5. Rendering and data flow

### 5.1 Request flow (public page)
1. `proxy.ts` (next-intl) negotiates the locale, redirects `/` → `/bg`, and rewrites localized pathnames (`/bg/uslugi` → internal `/bg/services`). It excludes `/admin`, `/api`, `/_next`, `/_vercel` and files with dots.
2. The route (Server Component) awaits `params`, validates the locale (`hasLocale`) and calls `@/lib/content` functions such as `getPageByKey('services', locale)`.
3. The content API calls `sanityFetch({ query, params })`, maps the typegen result → domain model and returns it.
4. The page renders `<SectionRenderer sections={page.sections} />`, plus JSON-LD and `generateMetadata` via `@/lib/seo`.
5. All of the above happens **at build time in CI**. `generateStaticParams` enumerates all locales × slugs and every content route sets `dynamicParams = false`, so an unknown slug is a 404 and a page published after the build appears with the next (webhook-triggered) deploy. At request time the Worker only runs `proxy.ts` and serves the prerendered output.

### 5.2 `sanityFetch` contract (`src/lib/content/sanity/fetch.ts`)
```ts
import 'server-only'
type FetchOpts<Q extends string> = {
  query: Q; params?: QueryParams
  stega?: boolean                // default: draft mode on → true; ALWAYS false in metadata/JSON-LD/static params
  perspective?: 'published' | 'drafts'
}
```
Behaviour:
- Draft mode off: `perspective: 'published'`, `useCdn: true`, no token, no cache tags. The fetch must not opt the route into dynamic rendering (check the `next build` route table: every public route is ○/● static).
- Draft mode on: `perspective: 'drafts'`, `useCdn: false`, `token: SANITY_API_READ_TOKEN`, `stega: { studioUrl }`, no caching (rendered per request on the Worker).
- Pass `stega: false` explicitly in `generateMetadata`, JSON-LD builders, `generateStaticParams`, the sitemap, `llms.txt` and anything compared in code. Use `stegaClean()` on enum-like strings (layout variants, tones) inside mappers.

### 5.3 Draft mode and Visual Editing (Presentation tool)
- `GET /api/draft-mode/enable` → `defineEnableDraftMode({ client: client.withConfig({ token }) })` from `next-sanity/draft-mode`.
- `GET /api/draft-mode/disable` → `(await draftMode()).disable()`, then redirect back.
- The `[locale]` layout renders `<PreviewTools />` (from `@/lib/content/preview`) only when `(await draftMode()).isEnabled`. It renders `<VisualEditing />` (from `next-sanity/visual-editing`) plus a "Exit preview" button hidden inside Presentation (`useIsPresentationTool`).
- No `SanityLive`. In draft mode, `VisualEditing` refreshes the route on mutations.
- The Studio's `presentationTool({ resolve, previewUrl: { initial: SITE_URL, previewMode: { enable: '/api/draft-mode/enable' } } })`. `resolve.locations` maps every routable document → its localized URL(s) using the same pathnames config.
- CORS: add the site origin(s) (`http://localhost:3000`, preview URL, production domain) in sanity.io/manage → API → CORS, **with credentials**.
- A Studio hosted on `*.sanity.studio` previews the site in a cross-site iframe. next-sanity sets CHIPS-partitioned cookies. Firefox strict ETP may still block it. Document this for the client ("use Chrome or Safari for Presentation").

### 5.4 Studio hosting
- **Embedded (default, ADR-010 confirmed by T00.4)**: `src/app/admin/[[...tool]]/page.tsx` renders `<NextStudio config={config} />` (`next-sanity/studio`; the config module starts with `'use client'`) and re-exports `metadata` / `viewport` from `next-sanity/studio`. It has its own root layout `src/app/admin/layout.tsx`. Three settings keep it static and under the 10 ms CPU limit (measured in T00.4: without them every `/admin` request rendered on the Worker at ~18–20 ms CPU, 512 ms on a cold isolate):
  - `export const dynamic = 'force-static'`, `export const dynamicParams = false` and `generateStaticParams() { return [{ tool: [] }] }`, so `/admin` itself is prerendered (without it Next only emits the `/admin/[[...tool]]` shell and OpenNext has no cache entry for `/admin`);
  - a `next.config.ts` rewrite `{ source: '/admin/:path+', destination: '/admin' }`, so deep links (`/admin/structure/...`) get the same static shell and the Studio's client router reads the URL.
  The Studio adds ~13 MiB to the Worker upload (6.4 → 19.1 MiB raw, 1.4 → 4.3 MiB gzip; the Free limit is 64 MiB uncompressed) and startup stays at ~350–440 ms (limit 1 s). T03.1 re-measured 7.3 → 21.3 MiB raw (1.6 → 4.9 MiB gzip) with `wrangler deploy --dry-run`. Load dev-only Studio plugins with a dynamic `import()` behind a `NODE_ENV` check (see `src/sanity/plugins.ts`): a static import of `@sanity/vision` added another 13.5 MiB to production even with the plugin disabled.
- **Hosted (optional)**: `pnpm sanity deploy` → `https://<client>.sanity.studio` from the same `sanity.config.ts`. Use it if the Worker ever gets close to the size or startup limit; `/admin` then becomes a redirect.

---

## 6. Static build and publishing on Cloudflare (ADR-012)

### 6.1 OpenNext config (`open-next.config.ts` + `wrangler.jsonc`, repo root, the only variant)
```ts
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache, enableCacheInterception: true })
```
wrangler: `ASSETS` (Static Assets), `IMAGES` (Images binding), `WORKER_SELF_REFERENCE` (service binding to itself), `observability.enabled`. Flags: `nodejs_compat`, `global_fetch_strictly_public`. `compatibility_date` = the pinned workerd build date. **No R2, D1, Durable Objects, KV or queues**, so nothing needs a payment card and nothing has to be created per client except the Worker itself.

The incremental cache is read-only: it serves what `next build` prerendered. `revalidateTag`/`revalidatePath` have nothing to refresh, so the template doesn't use them. Deploy with the OpenNext command (`opennextjs-cloudflare deploy`), which uploads the prerendered output as assets.

### 6.2 Publish → rebuild
- One Sanity GROQ webhook (Free plan allows 2): dataset `production`, trigger on create/update/delete, filter `!(_type match "sanity.*")`, **"Trigger webhook when drafts are modified" off**, HTTP POST to `https://api.github.com/repos/<owner>/<repo>/dispatches`, headers `Authorization: Bearer <fine-grained PAT, contents:write on this repo only>` and `Accept: application/vnd.github+json`, projection `{"event_type": "sanity-publish"}`. The PAT lives only in the webhook config (project settings, not the public dataset) and expires: rotate it before expiry (calendar reminder).
- `deploy.yml` runs on `repository_dispatch: [sanity-publish]` → `pnpm run deploy`. The production concurrency group lets a running deploy finish and keeps only the newest queued run, so a burst of publishes becomes at most two builds.
- Publish → live in about 3–5 minutes (build time). PRD F-06.
- A daily scheduled run of `deploy.yml` picks up time-based content (announcement start dates). The announcement banner also hides itself client-side after `endsAt`.
- Sanity is read at build time with the published perspective via the API CDN. Sanity's CDN is eventually consistent for a few seconds after publish; the GitHub runner start-up time covers that.

### 6.3 Draft mode on a static site
Draft mode sets the `__prerender_bypass` cookie. OpenNext's cache interception skips the static copy for those requests and renders on the Worker with the drafts perspective. This only happens for editors in Presentation, never for visitors. CPU per draft render is recorded in the T00.4/T04.5 notes; if it hits the Free 10 ms limit (Error 1102), preview through `pnpm dev` and note it in PROGRESS (no paid plan, ADR-012). Open point for T04.5: with `dynamicParams = false`, a never-published draft whose slug wasn't prerendered may 404 in Presentation; verify, and if so preview new documents after their first publish or via `pnpm dev`.

### 6.4 Static asset caching
`public/_headers`:
```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
/brand/*
  Cache-Control: public,max-age=86400
```
`next.config.ts` `headers()` don't apply to static assets on Workers. They apply to Worker responses (HTML, API).

### 6.5 Images
- CMS images: `ContentImage` → `next/image` with `loader` from `@/lib/content/image-loader`, which builds `https://cdn.sanity.io/...?...&w={width}&q={quality}&auto=format&fit=max` (hotspot → `object-position`). Domain type: `ImageAsset { src, width, height, alt, lqip?, focalPoint? }`.
- Local images (`/public/brand`, static imports): default `next/image` optimization through the `IMAGES` binding. These are few, far under 5,000 transforms/month.
- Next 16: add any quality other than 75 to `images.qualities`. Set `images.remotePatterns` for `cdn.sanity.io`.
- `next-sanity/image` is still **alpha**. Revisit once it is stable (it could replace our loader).

### 6.6 CPU budget (Free plan: 10 ms per request)
- Prerendered pages cost only `proxy.ts` + the static-asset read. Draft Mode SSR and the contact Server Action are the only per-request rendering/work, and they can approach 10 ms.
- Mitigations: no per-request OG generation (build-time only); emails rendered with inline styles (no `<Tailwind>` component); minimal Server Action work.
- There is no paid fallback (ADR-012). If something hits Error 1102, make it cheaper or move it to build time.

---

## 7. i18n design

### 7.1 Single source of truth (`src/config/i18n.ts`)
```ts
export const locales = ['bg', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'bg'
export const localeMeta: Record<Locale, { label: string; short: string; hreflang: string; ogLocale: string; intl: string }> = {
  bg: { label: 'Български', short: 'BG', hreflang: 'bg', ogLocale: 'bg_BG', intl: 'bg-BG' },
  en: { label: 'English',   short: 'EN', hreflang: 'en', ogLocale: 'en_GB', intl: 'en-GB' },
}
```
Consumers: next-intl routing, both Sanity i18n plugins (`supportedLanguages` / `languages`), the GROQ fallback params, sitemap alternates, hreflang, the language switcher and the Presentation resolver.

**Adding a language (e.g. `de`)**, checked by adding `de` and running `pnpm typecheck` (T02.5):
1. `src/config/i18n.ts`: add the code to `locales` and an entry to `localeMeta` (native `label`, `short`, `hreflang`, `ogLocale`, `intl`). This is the only config change; `pnpm typecheck` then lists steps 2–3.
2. `messages/de.json`: copy `en.json` and translate it. Register it in `src/i18n/request.ts` (`messageLoaders`) and `src/test/messages.ts` (`catalogs`); the parity test checks the keys.
3. `src/i18n/pathnames.ts`: add a `de` slug to every localized entry (7 today). Entries that are plain strings stay as they are.
4. Fonts: check that `src/config/fonts.ts` loads the subsets the language needs (e.g. `latin-ext` for Polish or Romanian). For a right-to-left language, add `dir` to `localeMeta` first.
5. Studio: the Sanity language lists read `locales` (T03.2), so the next deploy shows `de`. Translate the required documents (home, system and legal pages) and the field-level strings in siteSettings/navigation. Untranslated routable docs simply have no `de` URL.
6. `pnpm check`, deploy, then check `/de`, the language switcher and the hreflang tags in `<head>`.

### 7.2 Routing (next-intl)
- `defineRouting({ locales, defaultLocale, localePrefix: 'always', pathnames })`, plus `localeDetection: true` (only affects `/` and unprefixed paths; it sets the `NEXT_LOCALE` cookie, which is strictly necessary for functionality, so list it in the cookie registry).
- Localized static pathnames (Latin transliteration for BG, which is better for sharing and SEO tooling):

| Internal | bg | en |
| --- | --- | --- |
| `/` | `/` | `/` |
| `/services` | `/uslugi` | `/services` |
| `/services/[slug]` | `/uslugi/[slug]` | `/services/[slug]` |
| `/about` | `/za-nas` | `/about` |
| `/gallery` | `/galeriya` | `/gallery` |
| `/blog` | `/blog` | `/blog` |
| `/blog/page/[n]` | `/blog/stranica/[n]` | `/blog/page/[n]` |
| `/blog/[slug]` | `/blog/[slug]` | `/blog/[slug]` |
| `/contact` | `/kontakti` | `/contact` |
| `/legal/[slug]` | `/pravna-informaciya/[slug]` | `/legal/[slug]` |
| `/[slug]` | `/[slug]` | `/[slug]` |

- CMS slugs are per-language (document-level types). `page.slug` must not collide with the reserved first segments above (Studio validation).
- `next/root-params` (Next ≥ 16.3) supplies the locale in `i18n/request.ts`. Static rendering works without `setRequestLocale`.
- Type safety: augment `next-intl`'s `AppConfig` with `Locale`, `Messages` (from `messages/bg.json`) and `Formats`.

### 7.3 Sanity i18n: hybrid (ADR-001)

| Type | Approach | Reason |
| --- | --- | --- |
| `page`, `article`, `service`, `legalPage` | **Document-level** (`@sanity/document-internationalization`, `language` field, `translation.metadata`) | They have URLs. Each language needs its own slug, SEO and publish timing (EN is AI-translated, then reviewed, so it can lag BG). One URL = one document gives clean Presentation mapping, simple GROQ (`language == $locale`) and real hreflang alternates. Page-builder arrays stay readable (no nested per-field language arrays inside every section). |
| `siteSettings`, `navigation`, `serviceCategory`, `teamMember`, `faqItem`, `galleryItem`, `testimonial`, `announcement` | **Field-level** (`sanity-plugin-internationalized-array` v5) | Not routable. Most fields are shared (photo, phone, order, dates), so duplicating documents would drift. Editors see BG/EN side by side. |

- Field-level query pattern with fallback to the default language:
  `"name": coalesce(name[language == $locale][0].value, name[language == $defaultLocale][0].value)`.
  Fragments are built by a tiny helper in `src/lib/content/sanity/fragments.ts` that returns **string constants** composed into `defineQuery` template literals. Confirm TypeGen evaluates them (fall back to inline if not).
- Document-level fallback: if a routable document has no translation in the requested locale, it is **not** listed or linked in that locale, there is no hreflang alternate, and its URL 404s. Exceptions: `legalPage` and the home/system pages, which are required in every locale (Studio "missing translations" view and a CI content check).
- Alternates (language switcher + hreflang): query `*[_type == "translation.metadata" && references($id)][0].translations[]{ "locale": language, "slug": value->slug.current, "type": value->_type }`. Confirmed in T03.2 against the plugin source (`@sanity/document-internationalization` 6.3.0) and a test query on `development`: the metadata doc is `{ _type: 'translation.metadata', schemaTypes: ['page'], translations: [{ _key, _type: 'internationalizedArrayReferenceValue', language: 'bg', value: { _type: 'reference', _ref, _weak: true } }] }`. With `weakReferences: true` the references stay weak after publish, so deleting one language version never fails on a reference.
- Translation workflow (Free plan has no AI Assist): the editor creates the BG doc → "Translate → EN" (plugin duplicates the doc) → the developer or Claude translates through the **Sanity MCP** (`patch_documents` on the EN draft) or by hand → a human reviews → Publish.

---

## 8. Sanity schema design (summary; details in `CONTENT-MODEL.md`)

- **Singletons:** `siteSettings`, `navigation`. Created by fixed `_id`. Structure hides "create new"; document actions remove delete/duplicate.
- **Routable documents (doc-level i18n):** `page` (`pageKey` for system pages + `slug` for generic pages + `sections[]`), `article`, `service`, `legalPage`.
- **Collections (field-level i18n):** `serviceCategory`, `teamMember`, `faqItem`, `galleryItem`, `testimonial`, `announcement`.
- **Objects:** `seo`, `link`, `cta`, `imageWithAlt`, `richText` (Portable Text), `openingHoursSpec`, `specialHours`, `address`, `geo`, `socialLink`, `legalEntity`, `bookingConfig`.
- **Sections** (`page.sections[]`, each an object type `section.<name>`): `hero`, `textImage`, `tiles`, `faq`, `ctaBand`, `team`, `gallery`, `blogTeaser`, `contactHours`, `processSteps`, `testimonials`, `richTextBlock`. **Reserved, not built:** `priceList`, `beforeAfter`, `googleReviews`.
- Unique-attribute budget (Free: 2k per dataset): internationalized arrays keep attribute paths flat. Reuse object types instead of near-duplicates. Run `sanity documents validate` after seeding (locally; the write token never reaches CI). CI type-checks the seed against `schema.json` in unit tests.
- Ordering via `@sanity/orderable-document-list` (`orderRank` field).
- Datasets: `production` (live) and `development` (seed, experiments, Sanity MCP writes). Both are public on Free, so **never store secrets or personal data in Sanity**.

---

## 9. Environment variables (`src/env.ts` validates with Zod and fails the build if a value is missing)

| Name | Scope | Where set | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build, public | CI vars | Canonical origin (`https://www.client.bg`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | build, public | CI vars | |
| `NEXT_PUBLIC_SANITY_DATASET` | build, public | CI vars | `production` / `development` |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | build, public | CI vars | `/admin` or `https://x.sanity.studio` (stega + links) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build, public | CI vars | Test key `1x00000000000000000000AA` locally/CI |
| `NEXT_PUBLIC_ANALYTICS` | build, public | CI vars | `none` \| `cloudflare` \| `umami` \| `ga4` |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` / `NEXT_PUBLIC_UMAMI_WEBSITE_ID` / `NEXT_PUBLIC_UMAMI_SRC` / `NEXT_PUBLIC_GA_ID` | build, public | CI vars | Per provider |
| `NEXT_PUBLIC_ENABLE_STYLEGUIDE` | build, public | CI vars | `true` on preview, `false` in production after sign-off |
| `NEXT_PUBLIC_ENV` | build, public | CI vars | `production` \| `preview` \| `development` (robots/noindex) |
| `SANITY_API_READ_TOKEN` | runtime secret | `wrangler secret` | Viewer token: draft mode + seed reads |
| `RESEND_API_KEY` | runtime secret | `wrangler secret` | |
| `TURNSTILE_SECRET_KEY` | runtime secret | `wrangler secret` | Test secret `1x0000000000000000000000000000000AA` |
| `CONTACT_FROM_EMAIL` | runtime var | wrangler `vars` | e.g. `Website <noreply@mail.client.bg>` |
| `CONTACT_TO_EMAIL` | runtime var | wrangler `vars` | Overrides `siteSettings.contactForm.recipient` (keeps the inbox out of the public dataset if preferred) |
| `CONTACT_DRY_RUN` | runtime var | `.dev.vars` | `true` skips the Resend call (local testing only; never in production) |
| `SANITY_WRITE_TOKEN` | local only | `.env.local` | Seed script. **Never** deployed to the Worker or stored in CI. |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | CI only | GH secrets | Deploys |
| GitHub fine-grained PAT (`contents:write`, one repo) | Sanity webhook only | Sanity webhook header | Triggers `repository_dispatch` on publish (§6.2). Not an env var; never in the repo. |

Local: `.env.local` for `next dev`, `.dev.vars` for `pnpm preview` (workerd). Add `NEXTJS_ENV=development` to `.dev.vars`. `pnpm cf-typegen` generates `cloudflare-env.d.ts`. Access bindings via `getCloudflareContext()` from `@opennextjs/cloudflare`. Vars and secrets are also exposed on `process.env`.

---

## 10. Security
- Response headers (`next.config.ts` `headers()`, built by `src/config/csp.ts`): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), `X-Frame-Options: SAMEORIGIN` (only with the embedded Studio), and a `Content-Security-Policy` that starts in **Report-Only** with an allowlist: self, `cdn.sanity.io`, `*.api.sanity.io` (draft only), `challenges.cloudflare.com`, the analytics host, `www.google.com/maps` (frame, after consent). Use `frame-ancestors 'self' https://<client>.sanity.studio` so Presentation can iframe the site. Nonce-based CSP is incompatible with static pages, so stay allowlist-based: `script-src 'self' 'unsafe-inline'` + hosts (Next's inline RSC payload scripts differ per page and build). `/admin` gets its own looser policy (Sanity APIs + websockets, `core.sanity-cdn.com`, https images for user avatars, no `'unsafe-eval'`). OpenNext applies these headers to prerendered pages served from the Worker's cache (checked in T11.3 with `opennextjs-cloudflare preview`).
- The Server Action validates everything server-side and never trusts client flags. Origin check is built into Next Server Actions. Add a honeypot and Turnstile, and optionally rate-limit by IP (a Cloudflare WAF rate-limiting rule; Free plan includes one rule).
- No PII in logs. The Studio requires a Sanity login, and the client is invited as Administrator (Free has only Admin/Viewer).

---

## 11. CI/CD (GitHub Actions)
- `ci.yml` (PRs and main): pnpm install (frozen) → lint → typecheck → unit tests → `next build`. Nothing else (ADR-011, ADR-012). The token contrast check runs as a unit test (`scripts/check-contrast.test.ts`); from T03.1 `pnpm typecheck` regenerates Sanity types first, so stale query types fail the typecheck.
- `deploy.yml`: production (`pnpm run deploy` = `opennextjs-cloudflare build && opennextjs-cloudflare deploy`) on push to `main`, on `repository_dispatch: [sanity-publish]` (publish webhook, §6.2) and on a daily schedule. On PR → `opennextjs-cloudflare upload` (new version + preview URL, comment on the PR).
- No Renovate/Dependabot (ADR-012). Upgrade dependencies deliberately, one PR per platform major, and re-run the T00.4 deploy check after upgrading Next, OpenNext, Wrangler or Sanity.
- No backup workflow and no Lighthouse CI (ADR-012, brochure scope). Content export is manual (`pnpm sanity dataset export production production-YYYY-MM-DD.tar.gz`); Sanity Free has no restore SLA, so export before risky bulk edits, migrations and handover. Performance budgets (`SEO.md` §8) are checked with a manual Lighthouse run.

---

## 12. Per-client setup (summary; the full checklist is `NEW-CLIENT.md`)
1. "Use this template" → new private repo `client-<name>-site`.
2. Client creates (or approves) the accounts: **Sanity** (org + project, developer invited as Administrator), **Cloudflare** (Free account, no payment card; developer as member with Workers/DNS permissions), **Resend** (domain), optionally **Umami**.
3. `pnpm new-client` writes `src/config/site.ts` and `.env.local` and renames the worker. There are no bindings to create.
4. Theme: `tokens.css` + `fonts.ts`. `/styleguide` sign-off.
5. Content: seed structure → client and developer fill in BG → translate EN → review.
6. Publish webhook (→ GitHub), CORS, secrets, domain, email DNS, analytics, Search Console, Google Business Profile → launch QA.

---

## 13. Migration and exit plan
- **Content portability:** `sanity dataset export` (NDJSON + assets) weekly via CI. Portable Text is an open spec (portabletext.org) with renderers for many stacks.
- **Swap the CMS:** re-implement `src/lib/content/index.ts` (the get* functions) against the new source and keep `types.ts` unchanged. Components, routes and SEO stay untouched. The estimated surface is about 15 functions + mappers. Payload/Supabase migration: map NDJSON → tables. Images: download from the CDN and re-upload.
- **Swap the host:** the code is standard Next.js. Remove `open-next.config.ts` / `wrangler.jsonc` / `getCloudflareContext` usages (only in `src/lib/platform/*`, if any) and deploy to Vercel/Netlify/Node. Cloudflare-specific pieces: the static-assets cache config, `IMAGES` binding, Turnstile (works anywhere).
- **Client offboarding:** accounts are already client-owned. Remove the developer's memberships, transfer the GitHub repo or export it, and hand over `docs/` + credentials via a password manager.
- **Pricing changes:** contract clause, "third-party service fees are borne by the client". Cloudflare stays on Free with no card (ADR-012); the only expected paid upgrade is Sanity Growth $15/seat/mo only if roles, scheduled publishing or AI Assist are needed.
