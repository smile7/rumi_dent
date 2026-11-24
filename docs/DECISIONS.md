# Architecture Decision Records

Format: Context → Decision → Consequences → Status. To change a decision, add a new ADR that supersedes it. Don't edit history.

## ADR-001 Hybrid i18n in Sanity (document-level for routable, field-level for shared)
- **Context:** Two official plugins exist: `@sanity/document-internationalization` 6.x (document per language, `translation.metadata`) and `sanity-plugin-internationalized-array` 5.x (per-field arrays, `language` key). The doc-i18n plugin itself recommends using both when a project has both kinds of content. The EN version is AI-translated and reviewed later, so it can lag behind BG.
- **Decision:** Document-level for `page`, `article`, `service`, `legalPage`. Field-level for `siteSettings`, `navigation`, `serviceCategory`, `teamMember`, `faqItem`, `galleryItem`, `testimonial`, `announcement`.
- **Consequences:** + per-language slugs/SEO/publishing, clean Presentation mapping, simple queries, no attribute explosion. − Routable content counts ×2 against the 10k document quota (plus metadata docs); this is negligible for small sites. Editors must translate structural changes of pages in both languages (sections can differ per language, which is sometimes a feature).
- **Status:** Accepted.

## ADR-002 Tag-based caching with a signed webhook; no `defineLive`
- **Context:** Sanity recommends `defineLive` for most apps. It subscribes browsers to the Live Content API (Free: 1k live connections per dataset) and shifts work to runtime. Our sites are mostly static, and Workers Free has a 10 ms CPU limit.
- **Decision:** A custom `sanityFetch` (tags, draft-aware, stega in draft mode) + `/api/revalidate` with `parseBody` + `revalidateTag(tag, { expire: 0 })`. Visual Editing via `<VisualEditing/>` in draft mode only.
- **Consequences:** + Static HTML, no client JS for live updates, predictable quotas. − No real-time updates for visitors (not needed). Preview refreshes on mutation, but less instantly than with Live.
- **Status:** Superseded in part by ADR-012 (2026-11-21): no cache tags, no `/api/revalidate`, no `revalidateTag`; the webhook triggers a rebuild instead. "No `defineLive`" and Visual Editing in draft mode still stand.

## ADR-003 Two cache profiles (ISR default, Static fallback)
- **Context:** OpenNext's recommended small-site setup is R2 + DO queue + D1 tag cache. R2 requires a payment method on file even at $0. ISR regeneration runs inside the Worker (CPU limit on Free).
- **Decision:** Support both profiles, selected per client in `new-client`. ISR is the default. Static (static-assets incremental cache + rebuild via GitHub `repository_dispatch` from the Sanity webhook) is the fallback.
- **Consequences:** Two infra variants to test (CI builds both in the template repo).
- **Status:** Superseded by ADR-012 (2026-11-21): static-only, ISR removed.

## ADR-004 `proxy.ts` for next-intl, with a fallback
- **Context:** Next 16 renamed middleware → proxy (Node runtime). OpenNext Cloudflare supports Node middleware experimentally since 1.20.3 (maintainers confirm it is supported in the latest releases, Nov 2026). Edge `middleware.ts` still works but is deprecated.
- **Decision:** Use `src/proxy.ts`. The spike T00.4 deploys it. If it fails or adds unacceptable size/latency, switch to `src/middleware.ts` (same code) and record ADR-004b.
- **Status:** Accepted, confirmed by T00.4 (2026-11-21): on workers.dev `/` → 307 `/bg`, `/bg/proba/statichna` is rewritten to the internal route (200), `/bg/spike/static` redirects to the localized path, prerendered pages cost 1–2 ms CPU including the proxy.

## ADR-005 Sanity CDN image loader instead of Cloudflare Images for CMS images
- **Decision:** A custom `next/image` loader → `cdn.sanity.io` with `auto=format`, width and quality. Hotspot → `object-position`. Local assets only use the `IMAGES` binding.
- **Why:** No Worker CPU, no 5k-transform cap, crops follow the editor's hotspot. `next-sanity/image` is alpha, so revisit later.
- **Status:** Accepted.

## ADR-006 No Cache Components in v1
- **Decision:** Keep `cacheComponents` off. Use fetch-level `next.tags`. Revisit in v2 using the `next-cache-components-adoption` skill once next-intl + next-sanity + OpenNext patterns are well documented together.
- **Status:** Accepted.

## ADR-007 Always-prefixed locales
- **Decision:** `localePrefix: 'always'`, default `bg`. `/` redirects. `x-default` hreflang → `/bg`.
- **Alternative:** `as-needed` (BG at `/`), a one-line config change. Revisit per client if SEO wants root content.
- **Status:** Accepted.

## ADR-008 GitHub Actions deploys
- **Decision:** Deploy with `opennextjs-cloudflare deploy|upload` from GitHub Actions using per-repo secrets, not Workers Builds (which also works and gives 3,000 free build minutes/month, but ties CI to each client's Cloudflare-GitHub app install).
- **Status:** Accepted.

## ADR-009 TypeScript 6.0 and ESLint 9.39
- **Context:** TS 7 (native) is `latest` on npm, but `typescript-eslint` 8.73 peers on `<6.1.0`. ESLint 10 is `latest`, but `eslint-plugin-jsx-a11y` (bundled by `eslint-config-next`) peers on ≤ 9.
- **Decision:** Pin TS 6.0.3 and ESLint 9.39.x. Re-evaluate monthly.
- **Status:** Accepted.

## ADR-010 Studio location
- Embedded `/admin` by default. If the spike shows the Studio bloats the Worker (size/startup), host it at `<client>.sanity.studio` and make `/admin` a redirect.
- **Status:** Accepted, confirmed by T00.4 (2026-11-21): embedded. Worker upload 19.1 MiB raw with the Studio vs 6.4 MiB without (Free limit 64 MiB uncompressed), startup ~350–440 ms (limit 1 s). Condition: `/admin` must be fully static (ARCHITECTURE §5.4: `generateStaticParams → [{ tool: [] }]`, `dynamicParams = false`, `/admin/:path+ → /admin` rewrite); otherwise each Studio request renders on the Worker at ~18–20 ms CPU, above the Free 10 ms limit.

## ADR-011 No Playwright: no e2e tests, no screenshot script
- **Context:** The owner decided (2026-11-21) to drop Playwright entirely.
- **Decision:** Removed `e2e/`, `playwright.config.ts`, `@playwright/test`, `@axe-core/playwright`, the `e2e` and `shots` scripts (`scripts/shots.ts`) and the CI e2e step. Every e2e, Playwright, axe-in-browser and `pnpm shots` step, AC and Done check in `docs/tasks/*` is **skipped**. Where a behavior can be tested in jsdom (render output, ARIA attributes, keyboard handlers, pure logic), cover it with a Vitest test instead.
- **Consequences:** Keyboard journeys, focus traps, axe on real pages, reduced motion, no-horizontal-scroll and network assertions (consent, map, Turnstile) are no longer verified automatically. WCAG 2.2 AA remains a requirement, now checked manually. Sign-off screenshots for clients are taken by hand. Revisit if regressions appear.
- **Status:** Accepted.

## ADR-012 Static-only: prerender everything, rebuild on publish (supersedes ADR-003 and part of ADR-002)
- **Context:** The ISR setup needs R2 (incremental cache), D1 (tag cache) and a Durable Object queue. R2 can only be enabled with a payment card on the Cloudflare account, even at $0 usage. The owner decided (2026-11-21) that **no Cloudflare account may ever need a payment card**, and that the template should carry one infra variant, not two. (This replaces a same-day draft of ADR-012 that kept ISR as an optional `infra/isr/` upgrade.)
- **Decision:**
  - One profile only. The repo root `open-next.config.ts` uses `staticAssetsIncrementalCache` + `enableCacheInterception`; `wrangler.jsonc` has only `ASSETS`, `IMAGES`, `WORKER_SELF_REFERENCE` and observability. No R2, D1, Durable Objects, KV or queues. `infra/` is deleted.
  - Every public page is prerendered in CI. Content routes set `dynamicParams = false` and enumerate every slug in `generateStaticParams`, so an unknown URL is a 404 and the Worker never renders a public page per request.
  - Publishing: one Sanity GROQ webhook (publish only, drafts off) calls the GitHub `repository_dispatch` API (`event_type: sanity-publish`), which runs `deploy.yml` (build + deploy). No cache tags, no `/api/revalidate`, no `revalidateTag`, no `SANITY_REVALIDATE_SECRET`, no cache purge.
  - Time-based content (announcement start/end) can't revalidate on a timer: the deploy workflow also runs on a daily schedule, and the banner hides itself client-side once `endsAt` has passed.
  - Only free Cloudflare features: Workers Free, Static Assets, Images binding (5k transforms/month, CMS images go to the Sanity CDN anyway), Turnstile, Web Analytics, Free DNS zone. Workers Paid is not an upgrade path of the template (it needs a card).
  - Renovate is removed. Dependencies are upgraded deliberately (monthly `pnpm outdated` review, one PR per platform major, re-run the T00.4 deploy check). CI = lint, typecheck, unit tests, build.
- **Consequences:** + No card, no bindings to create per client, no cache state to debug, almost no Worker CPU for public pages (they are static assets), one config to test. − Publishes go live in a few minutes (build time), not seconds. Every publish costs one CI build (GitHub Free: 2,000 Actions minutes/month on private repos, about 3–5 min per build, so roughly 400 publishes/month). A burst of publishes is coalesced by the deploy concurrency group. Draft mode (Presentation preview) and the contact Server Action still run on the Worker per request, under the 10 ms CPU limit (T00.4 records the numbers). If a client ever needs seconds-fast publishing, that is a new ADR, not a switch.
- **Amendment (2026-11-21): brochure scope.** The owner trimmed the remaining plan to what a simple brochure site needs:
  - **Already gone, nothing left to remove:** `/api/revalidate` and cache profiles (T04.4 is only the publish → rebuild webhook). T11.7's `new-client` no longer writes per-profile bindings or an `open-next.config.ts` profile.
  - **T11.1** (site-wide manual accessibility, keyboard and screen-reader pass) is skipped. WCAG 2.2 AA is still required: each UI task keeps its own manual check (Lighthouse accessibility audit + keyboard), and NEW-CLIENT §9 keeps the launch keyboard and screen-reader spot check.
  - **T11.2** (visual regression baselines) stays skipped (ADR-011).
  - **T11.4** (backup workflow and restore drill) is skipped: no `backup.yml`, no restore runbook, `SANITY_WRITE_TOKEN` is local only. Manual export when needed: `pnpm sanity dataset export production production-YYYY-MM-DD.tar.gz` (NEW-CLIENT §10).
  - **T10.5** keeps the bundle audit, a manual Lighthouse run against the SEO.md §8 budgets, and redirects. Lighthouse CI (`lighthouserc.json`, `lhci` job, `@lhci/cli`) is dropped.
  - The blog stays (T07.4, BlogTeaser).
  - **Consequences:** + fewer tasks, no extra CI job or GitHub secret, nothing scheduled besides the daily deploy. − No automated backup: Sanity Free has no restore SLA, so content is only as safe as the last manual export (export before risky bulk edits, migrations or handover). Performance and accessibility regressions are caught only by manual runs.
- **Status:** Accepted (amended 2026-11-21, brochure scope).
