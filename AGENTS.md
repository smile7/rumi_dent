# AGENTS.md — Client Site Starter (Next.js + Sanity + Cloudflare)

You are building a **reusable, multi-client website starter template**. It is not a single client's site. Every decision must work for the next client, too. The first real client is a pediatric-first dental clinic (Rumi Dent, Ruse, BG), so the template must fit **local service businesses** very well: clinics, studios, small offices.

## Read before you write code

1. `docs/PRD.md`: what we are building and the acceptance criteria.
2. `docs/ARCHITECTURE.md`: stack, pinned versions, folder layout, data flow, caching.
3. The task file you were given in `docs/tasks/`, plus any doc it links to.
4. `docs/DECISIONS.md`: decisions already made. Don't re-open them silently. Propose an ADR change instead.
5. `docs/PROGRESS.md`: what is done.

Version-matched framework docs ship in `node_modules`. **Prefer them over memory**:
- Next.js: `node_modules/next/dist/docs/` (Next 16.x has breaking changes vs. your training data: `proxy.ts`, async `params`, no `next lint`).
- Sanity: https://www.sanity.io/docs/llms.txt, plus the Sanity MCP `read_docs` / rules tools if they are connected.
- OpenNext Cloudflare: https://opennext.js.org/cloudflare
- next-intl: https://next-intl.dev/docs

If an API you plan to use is not in those docs, stop and say so. Don't invent APIs.

## Working agreement (one task per chat)

- Work on **exactly one task ID** (e.g. `T04.3`) per chat. Don't start the next one.
- Start in **Plan Mode**. Your plan must list the files you will touch, the approach, open questions, risks, and how you will verify the result. Wait for approval.
- Keep diffs small and focused. Never refactor outside the task scope. Write unrelated issues down under "Follow-ups" in `docs/PROGRESS.md` instead.
- When done:
  1. Run `pnpm check` (lint, typecheck, unit tests, contrast) and the task's **Done check**. Skip any e2e, Playwright or `pnpm shots` step in a Done check (ADR-011).
  2. Tick the task in `docs/PROGRESS.md` and add short notes.
  3. Propose a Conventional Commit message (`feat(header): shrink on scroll`). The human commits.
- If the task file is wrong or incomplete, say so in the plan. Don't improvise silently.

## Non-negotiable rules

**Boundaries**
- Only `src/lib/content/**` (runtime) and `src/sanity/**` (Studio) may import `sanity`, `next-sanity`, `@sanity/*`, `groq` or `@portabletext/*`. One exception: `src/app/admin/**` and the draft-mode route handlers may import from `next-sanity`. Pages and components consume **typed domain models** from `@/lib/content`.
- Server-only modules start with `import 'server-only'`. Secrets never reach client components.

**i18n**
- No hard-coded user-facing strings in components. That includes aria-labels, alt fallbacks, button text and form errors. UI strings live in `messages/{locale}.json` (next-intl). Content lives in Sanity.
- Locales come from `src/config/i18n.ts` only. Never write `'bg' | 'en'` literals anywhere else.
- Internal links use `Link` from `@/i18n/navigation`, never `next/link`, for localized routes.

**Styling and design**
- Use tokens only (Tailwind classes generated from `@theme` in `src/styles/tokens.css`). No raw hex values, no arbitrary pixel values for colors, spacing or radius unless the design-system doc allows them.
- Mobile-first: write base styles for 360 px, then `sm/md/lg` up.
- Follow `docs/DESIGN-SYSTEM.md`, including its **Anti-patterns** list. Use the `frontend-design` skill for any new visual work.

**Accessibility (WCAG 2.2 AA)**
- Semantic HTML first. Every interactive element is keyboard-operable, has a visible focus ring and a target of at least 24×24 px (44×44 for primary mobile actions).
- Sticky UI (header, call bar) must never cover the focused element (2.4.11). Use `scroll-padding` and bottom padding.
- Respect `prefers-reduced-motion` everywhere (`MotionConfig reducedMotion="user"`).

**Performance**
- Server Components by default. Use `'use client'` only for interactivity, as leaf components.
- Motion: use `LazyMotion` + `m` components. Never animate the LCP element on first paint.
- Images go through `ContentImage` (Sanity CDN loader) or `next/image` with explicit `sizes`.
- Third-party scripts (maps, analytics, Turnstile) load only when needed.

**Cloudflare Workers runtime**
- Code runs on workerd with `nodejs_compat`. No filesystem access at runtime, no native Node addons, no `export const runtime = 'edge'`.
- Static only (ADR-012): every public page is prerendered at build (`generateStaticParams`, `dynamicParams = false`). A Sanity publish triggers a rebuild. No ISR, cache tags, `revalidateTag`, R2, D1 or Durable Objects, and never a Cloudflare feature that needs a payment card.
- On the Workers Free plan, CPU is limited to 10 ms per request. Never do heavy work per request.

**Quality**
- TypeScript strict. No `any`, no `@ts-ignore` (use `@ts-expect-error` with a reason if truly needed).
- Every content mapper, i18n helper and JSON-LD builder has Vitest unit tests.
- There are no e2e or browser tests (no Playwright; ADR-011). Don't add them. Cover behavior with Vitest unit/render tests where jsdom allows it.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next dev server (Node). Studio at `/admin` |
| `pnpm preview` | Build and run in workerd locally (closest to production) |
| `pnpm check` | lint + typecheck + unit tests + contrast check (run before every commit) |
| `pnpm typegen` | Extract the Sanity schema and generate `sanity.types.ts` |
| `pnpm seed` | Seed demo BG/EN content into the `development` dataset |
| `pnpm run deploy` | OpenNext build + deploy (CI normally does this). Use `pnpm run deploy`, because `pnpm deploy` is a built-in pnpm command |

## Where things go

See `docs/ARCHITECTURE.md` §4 for the full tree. In short:
- `src/app/[locale]/…`: routes (thin: fetch through `@/lib/content`, then render sections).
- `src/components/ui/`: shadcn primitives (restyled). `src/components/sections/`: page-builder renderers. `src/components/site/`: header, footer, banners.
- `src/lib/content/`: the only CMS-aware runtime code.
- `src/sanity/`: Studio schemas, structure, plugins.
- `src/config/`: client-specific config (`site.ts`, `i18n.ts`, `features.ts`, `cookies.ts`).
- `src/styles/tokens.css`: the single theme file per client.

<!-- Next.js may add/maintain a managed block below (BEGIN/END:nextjs-agent-rules). Keep it. -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
