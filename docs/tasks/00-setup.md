# Phase 00 — Repo, toolchain, Cloudflare spike

**Goal:** a clean, strict Next.js 16 project that builds, tests and deploys to Cloudflare Workers via OpenNext, and **proves the risky parts early** (proxy.ts on Workers, CPU time, Studio size).
**Read first:** `AGENTS.md`, `docs/ARCHITECTURE.md` §1, §6, §9, §11, `docs/DECISIONS.md` ADR-004/009/010/012.

---

### T00.1 — Scaffold the Next.js app
**Context:** The repo already contains `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/` and `.cursor/`. `create-next-app` now also generates `AGENTS.md`/`CLAUDE.md` and may refuse a non-empty folder, so scaffold in a temp dir and merge.
**Steps**
1. `pnpm create next-app@latest ../_scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm` (check `--help` first, because flags change between releases; React Compiler: **No** for v1; if it asks about AGENTS.md, say yes, since we merge it next).
2. Move everything except `AGENTS.md`, `CLAUDE.md` and `README.md` into the repo root. Append only the Next.js managed block (`<!-- BEGIN:nextjs-agent-rules -->…<!-- END… -->`) from the scaffold's AGENTS.md to the end of our `AGENTS.md`.
3. Pin exact versions from ARCHITECTURE §1 (`next`, `react`, `react-dom`, `typescript@6.0.3`, `eslint@9.39.x`, `eslint-config-next@16.4.6`, Tailwind 4.3.5). Add `"packageManager": "pnpm@12.21.0"`, `"engines": { "node": ">=24 <25" }` and `.nvmrc` (`24`).
4. `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `verbatimModuleSyntax: true`, `paths: { "@/*": ["./src/*"] }`.
5. Delete the demo page content. Leave a minimal `src/app/page.tsx` placeholder (it will be replaced by `[locale]` in Phase 02).
6. `.gitignore`: add `.open-next`, `.wrangler`, `.dev.vars`, `.env*.local`.
**Files:** `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/*`, `.nvmrc`, `.gitignore`, `AGENTS.md` (append only).
**AC:** `pnpm dev` serves the placeholder; `pnpm build` succeeds; versions match the table exactly; our AGENTS.md content is preserved.
**Done check:** `pnpm build && node -e "const p=require('./package.json');console.log(p.dependencies.next,p.devDependencies.typescript)"` prints `16.4.6 6.0.3`.

### T00.2 — Lint, format, test tooling and scripts
**Context:** `next lint` no longer exists in Next 16. Use the ESLint CLI with flat config.
**Steps**
1. `eslint.config.mjs`: `eslint-config-next` (core-web-vitals + typescript), `eslint-plugin-jsx-a11y` strict rules, `eslint-config-prettier` last. Rules: `no-restricted-imports` placeholder for the content boundary (filled in T04.6), `react/jsx-no-literals` **warn** in `src/components/**` (allow `aria-hidden` symbols, punctuation), `@typescript-eslint/no-explicit-any: error`.
2. Prettier 3.10 + `prettier-plugin-tailwindcss` (`tailwindStylesheet: ./src/styles/globals.css`), `.prettierrc`, `.prettierignore` (generated files).
3. Vitest 5: `vitest.config.ts` (jsdom for `*.test.tsx`, node for `*.test.ts`), `@vitejs/plugin-react`, path alias, `src/test/setup.ts`. One sample test.
4. Scripts (note: call `pnpm run deploy`, since `pnpm deploy` is a pnpm built-in): `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `typecheck` (`tsc --noEmit`), `test`, `test:watch`, `check` (= lint + typecheck + test), `preview`, `deploy`, `upload`, `cf-typegen`, `typegen` (placeholder until T03.1).
5. Optional pre-commit: `simple-git-hooks` + `lint-staged` (prettier + eslint on staged files).
**Files:** `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `vitest.config.ts`, `src/test/setup.ts`, `package.json`.
**AC:** `pnpm check` passes; formatting sorts Tailwind classes.
**Done check:** `pnpm check`.

### T00.3 — Cloudflare / OpenNext configuration
**Context:** ARCHITECTURE §6, ADR-012 (static only: one config, no R2/D1/DO, no payment card).
**Steps**
1. `pnpm add -E @opennextjs/cloudflare@1.20.17` and `pnpm add -DE wrangler@4.165.0`. (You may run `npx @opennextjs/cloudflare migrate` and then review and trim its output to match the docs.)
2. `wrangler.jsonc`: `$schema`, `main: .open-next/worker.js`, `name: site-starter-demo`, `compatibility_date` = the pinned workerd date, `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`, `assets { directory: .open-next/assets, binding: ASSETS }`, `services` self-reference, `images { binding: IMAGES }`, `observability { enabled: true }`. No other bindings.
3. `open-next.config.ts`: `staticAssetsIncrementalCache` + `enableCacheInterception: true`.
4. `next.config.ts`: `initOpenNextCloudflareForDev()` call, `images.remotePatterns` for `cdn.sanity.io`, `images.qualities: [60, 75, 85]`, `poweredByHeader: false`, `trailingSlash: false`, `logging.fetches.fullUrl` in dev.
5. `public/_headers` (immutable `/_next/static/*`). `.dev.vars.example` with `NEXTJS_ENV=development`. `cf-typegen` → `cloudflare-env.d.ts`.
**Files:** `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts`, `public/_headers`, `.dev.vars.example`, `cloudflare-env.d.ts`, `package.json`.
**AC:** `pnpm preview` serves the app in workerd locally; `pnpm cf-typegen` generates types; config matches the OpenNext docs for the installed version.
**Done check:** `pnpm preview` → `curl -I http://localhost:8787` gives 200.

### T00.4 — Deploy check: does it fit Workers Free? (GATE, short)
**Context:** Validate ADR-004 (proxy.ts) and ADR-010 (embedded Studio) on the real platform before building on them. Static only (ADR-012), so there is no ISR/revalidation to measure. Temporary code lives under `src/app/(spike)/`. Remove it at the end, but keep the results.
**Steps**
1. Add a minimal `src/proxy.ts` (`next-intl` `createMiddleware` with a 2-locale routing stub), a prerendered `[locale]` page and one localized static path.
2. Add the embedded Sanity Studio route (`next-sanity/studio`, empty schema) for the sandbox Sanity project.
3. `pnpm run deploy` to the sandbox account (workers.dev, Free plan, no card).
4. Record in `docs/PROGRESS.md` → "Spike results": Wrangler "Total Upload" size (and gzip) vs the Free limit, worker startup time, and whether pages load: `/` → `/bg` redirect, a localized path rewrite, a prerendered page, `/admin`. Optionally CPU time per request from Observability.
5. Decide: proxy.ts OK or fall back to `middleware.ts`; Studio embedded or hosted (`/admin` → `<project>.sanity.studio`). Update the ADR statuses.
6. Remove the spike code (keep the proxy file only if T02.1 takes it over).
**AC:** Size vs limit and page checks recorded with numbers. ADR-004/010 statuses updated. The spike code is removed.
**Done check:** the "Spike results" section is complete; `git grep -n "(spike)"` returns nothing.

### T00.5 — CI/CD workflows
**Context:** ARCHITECTURE §11, ADR-008.
**Steps**
1. `.github/workflows/ci.yml`: on PR + push to main. Steps: checkout, pnpm/action-setup, setup-node (from `.nvmrc`, pnpm cache), `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (Turnstile test keys in the job env). Nothing else (ADR-012).
2. `.github/workflows/deploy.yml`: production `pnpm run deploy` on push to main, on `repository_dispatch: types: [sanity-publish]` (publish webhook) and on a daily schedule (env: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, all `NEXT_PUBLIC_*` from repo variables). On PR (same repo only) → `pnpm upload` + comment the preview URL.
3. Concurrency: PR previews cancel in-progress runs on the same ref; production never cancels a running deploy (newest queued run wins).
4. No Renovate/Dependabot (ADR-012).
**Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.
**AC:** A PR shows green CI and a preview URL comment. Main deploys to production (sandbox).
**Done check:** open a test PR and verify both workflows (screenshot or link in PROGRESS).

### T00.6 — Typed environment variables
**Context:** ARCHITECTURE §9.
**Steps**
1. `src/env.ts`: Zod schemas `serverEnv` (secrets/vars; with `import 'server-only'` in `src/env.server.ts`) and `clientEnv` (`NEXT_PUBLIC_*`, explicitly referenced so Next inlines them). Parse lazily with clear error messages listing the missing keys. Allow test keys in development.
2. `.env.example` documenting every variable (grouped, with comments), `.dev.vars.example` for workerd.
3. Unit test: missing required var → helpful error.
**Files:** `src/env.ts`, `src/env.server.ts`, `.env.example`, `.dev.vars.example`, `src/env.test.ts`.
**AC:** The build fails fast with a readable message when a required public var is missing; no secret is importable from a client component (the `server-only` import errors).
**Done check:** `pnpm test src/env.test.ts`, and `NEXT_PUBLIC_SITE_URL= pnpm build` fails with a clear message.

### T00.7 — AI tooling wiring and repo docs
**Context:** README §2 (skills/MCP). Verify that everything the agent relies on is present and documented.
**Steps**
1. Confirm `.cursor/mcp.json` servers start (shadcn, next-devtools, Sanity, Cloudflare docs/bindings/observability). List any server needing OAuth in PROGRESS.
2. Confirm the skills are installed: `npx skills ls -a cursor -a claude-code` shows `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`, `next-dev-loop`, the Sanity skills and the Cloudflare skills (if chosen).
3. Add a `CHANGELOG.md` (Keep a Changelog), `LICENSE` (private/proprietary note) and `.editorconfig`.
**AC:** `docs/PROGRESS.md` lists the MCP/skills status. Repo hygiene files exist.
**Done check:** manual review.
