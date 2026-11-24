# Changelog

All notable changes to this template are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-22

First release: a static, bilingual (BG/EN) site for local service businesses on Next.js + Sanity + Cloudflare Workers Free, with no payment card (ADR-012). First client: Rumi Dent.

### Added
- Next.js 16 scaffold with pinned toolchain, strict TypeScript, ESLint/Prettier and Vitest; OpenNext Cloudflare config, static only (static-assets cache, no R2/D1/Durable Objects/KV).
- CI (lint, typecheck, unit tests, build) and deploy workflows; a Sanity publish triggers a rebuild via `repository_dispatch`, plus a daily scheduled build.
- Design tokens (one `tokens.css` per client, presets `neutral` and `rumi-dent`), restyled shadcn/Base UI primitives, `/styleguide`, WCAG AA contrast check as a unit test.
- next-intl routing with localized pathnames, a single locale config, language switcher with real alternates.
- Embedded Sanity Studio at `/admin` (document-level i18n for routable types, field-level for the rest, desk structure, singletons, orderable lists, seed script), Presentation and draft mode.
- Layout shell (header, mobile menu, mobile action bar, announcement banner, footer) and 12 page-builder sections.
- Pages: home, services + service detail, about, gallery, blog + articles, contact, legal, generic CMS pages.
- Contact form (Server Action, Zod, honeypot, Turnstile, Resend), click-to-load Google map, booking modes phone / external URL, Viber/WhatsApp links.
- Cookie consent (only when an analytics provider needs it), analytics adapters (none, Cloudflare Web Analytics, Umami, GA4), cookie policy and processors tables, GDPR request procedure.
- SEO/AEO: metadata builder (full `og:title`, truncated `<title>`), JSON-LD `@graph` per page, sitemap with hreflang, robots, `llms.txt`, build-time OG fallback image, redirects list, bundle audit.
- Security headers and a Report-Only CSP (`src/config/csp.ts`), with a separate `/admin` policy.
- `pnpm launch-check` (sitemap, canonical, hreflang, noindex, JSON-LD, OG images, placeholders, robots, styleguide, headers, email DNS).
- `pnpm new-client` (interactive, idempotent, `--dry-run`).
- Bulgarian handover pack: editor guide and ownership sheet (`docs/handover/`).

### Pinned versions
Node 24 LTS, pnpm 12.21.0, next 16.4.6, react 19.3.1, typescript 6.0.3, tailwindcss 4.3.5, @base-ui/react 1.9.0, next-intl 4.15.3, sanity 6.24.0, next-sanity 13.5.1, @opennextjs/cloudflare 1.20.17, wrangler 4.165.0, zod 4.6.7, resend 6.39.0, react-email 6.11.16, vitest 5.1.1. Full list: `docs/ARCHITECTURE.md` §1.

### Known limitations
- The CSP ships as Report-Only and needs `script-src 'unsafe-inline'` (prerendered pages can't use nonces). Switch to enforcing after a clean week live (NEW-CLIENT §9).
- First-load JS is about 239 KB gzip (budget 250 KB; Lighthouse Perf and TBT are the real gates).
- Next 16.4.6 renders `notFound()` as a blank HTML shell until hydration; no-JS visitors see an empty 404 page (status and `noindex` are correct).
- Draft preview renders on the Worker within the Free 10 ms CPU limit; a heavy page or `/{locale}/opengraph-image` in draft mode may fail there (preview with `pnpm dev`). Never-published documents 404 in Presentation.
- No automated content backups (Sanity Free has no restore SLA); export by hand.
- Header dropdowns (`navigation.header[].children`) are not rendered; booking modes are phone and external URL only.
- The Studio uses Sanity's default theme (a brand theme broke the login screen in dark mode).
- No e2e or visual regression tests (ADR-011); manual browser review.
