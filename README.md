# Site Starter: multi-client website template (plan pack)

This folder is the **planning pack** for building a reusable website starter (Next.js 16 + Sanity + Cloudflare Workers, BG/EN) with Claude in Cursor. The first real use is **Rumi Dent** (a pediatric-first dental clinic in Ruse). Rumi Dent is a *design direction and stress test* only. Nothing client-specific is hardcoded in the template.

We (humans) wrote the **what and why**. Claude writes the code, one task at a time, in Plan Mode, with a commit after each task.

---

## 1. What's in the pack

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Agent entry point: rules, commands, definition of done. Read on every chat. |
| `CLAUDE.md` | Imports `AGENTS.md` (for Claude Code / Claude in Cursor). |
| `docs/PRD.md` | Product requirements, features F-01…F-15 with acceptance criteria, non-goals. |
| `docs/ARCHITECTURE.md` | Pinned versions, folder tree, data flow, caching, i18n, env, security, CI/CD. |
| `docs/DECISIONS.md` | ADRs (why we chose what we chose). |
| `docs/DESIGN-SYSTEM.md` | Tokens, typography (Cyrillic!), motion, header and tiles behavior, components. |
| `docs/CONTENT-MODEL.md` | Every Sanity type, field, validation, Studio structure and seed. |
| `docs/SEO.md` | Metadata, JSON-LD, sitemap, robots, `llms.txt`, OG, CWV budgets. |
| `docs/LEGAL-GDPR.md` | Privacy-by-default, cookie registry, consent, BG legal notes (verify!). |
| `docs/NEW-CLIENT.md` | Checklist to turn the template into a client site (client-owned accounts). |
| `docs/PROGRESS.md` | Task checklist + spike results + follow-ups (the agent updates it). |
| `docs/tasks/00…11-*.md` | 12 phases, 75 tasks. Each has context, steps, files, acceptance criteria and a done check. |
| `.cursor/rules/*.mdc` | Scoped rules: workflow (always), i18n, content-layer, components-a11y, styling-tokens, seo, sanity-schema, cloudflare-runtime. |
| `.cursor/mcp.json`, `.mcp.json` | MCP servers for Cursor and Claude Code (same content). |

---

## 2. Install first (once per machine)

1. **Node 24 LTS** (`nvm install 24 && nvm use 24`) and **pnpm 12**: `npm i -g pnpm@12.21.0` (Corepack is no longer bundled with newer Node versions, so don't rely on it).
2. **Git** + a GitHub account (optional: GitHub CLI `gh auth login`).
3. **Cursor** (latest). Settings → Models: use Claude (the strongest available model for Plan Mode and for coding). Settings → Rules: make sure project rules are enabled. Settings → MCP: the servers from `.cursor/mcp.json` appear once the repo is open.
4. **Sandbox accounts for development** (yours, not the client's): Sanity (free), Cloudflare (Free plan, **never add a payment card**: ADR-012), Resend (free), GitHub. Client accounts are created later (`docs/NEW-CLIENT.md`).
5. **Wrangler login** (after Phase 00 installs it): `pnpm wrangler login`.

---

## 3. Create the repo and install agent tooling

```bash
mkdir site-starter && cd site-starter && git init
# copy this pack's contents (including .cursor/ and .mcp.json) into the repo root
git add -A && git commit -m "docs: planning pack"

# Skills (project-level, installed for both Cursor and Claude Code)
npx skills add anthropics/skills --skill frontend-design -a cursor -a claude-code -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --skill vercel-react-best-practices -a cursor -a claude-code -y
npx skills add vercel/next.js --skill next-dev-loop --skill next-bundle-optimizer -a cursor -a claude-code -y
npx skills add sanity-io/agent-toolkit --skill sanity-best-practices --skill content-modeling-best-practices --skill portable-text-serialization --skill sanity-singletons --skill seo-aeo-best-practices -a cursor -a claude-code -y
npx skills add cloudflare/skills --skill nextjs-on-cloudflare --skill wrangler --skill workers-best-practices --skill web-perf -a cursor -a claude-code -y
npx skills ls            # verify
git add -A && git commit -m "chore: agent skills"
```
Use `npx skills add <repo> --list` to see what a repo offers. Skills land in `.agents/skills/` (Cursor) and `.claude/skills/` (Claude Code). Commit them so every chat (and every client repo) has the same tooling. Update monthly with `npx skills update -p -y`.

**MCP servers** (`.cursor/mcp.json`, already in the pack):

| Server | What for | Auth |
| --- | --- | --- |
| `shadcn` | Current component APIs, add components | none |
| `next-devtools` | Next 16 docs, runtime errors, routes from the running dev server (`/_next/mcp`) | none (run `pnpm dev`) |
| `sanity` (`https://mcp.sanity.io`) | Query/patch datasets, schema info, docs, translations | OAuth on first use (or `npx sanity@latest mcp configure`) |
| `cloudflare-docs` | Current Workers/OpenNext/limits docs | none |
| `cloudflare-bindings` | Inspect Workers and bindings on your account | OAuth |
| `cloudflare-observability` | Logs and CPU time of deployed workers | OAuth |

Optional: the full Cloudflare API MCP `https://mcp.cloudflare.com/mcp` (powerful; only enable it when needed) and `https://builds.mcp.cloudflare.com/mcp` if you switch to Workers Builds. After opening the repo in Cursor: Settings → MCP → enable each server and complete OAuth. **Don't enable write-capable MCP tools against a client's production dataset** without reviewing each call.

---

## 4. The working loop (per task)

1. Open a **new chat** in Cursor (one task = one chat; keeps context clean).
2. Switch to **Plan Mode**. Paste the per-task prompt (§5.2) with the task ID.
3. Review the plan. Push back on anything that contradicts the docs, adds scope or skips verification. Then let it build (switch to Agent mode).
4. Claude verifies the acceptance criteria, runs `pnpm check`, ticks `docs/PROGRESS.md` and commits.
5. **You** look at the result: the page in your browser (UI) and the diff summary. If it's not right, use the fix prompt (§5.5) in the **same** chat. If the chat gets long or confused, start a new one with the "resume" prompt.
6. At the end of a phase, run the phase review prompt (§5.3) in a new chat, then pass the gate in `docs/tasks/README.md`.

Rules of thumb
- Never let a chat "also do" the next task. Never skip Plan Mode for tasks that touch more than 2 files.
- If Claude proposes changing a decision, it must write it as an ADR in `docs/DECISIONS.md` first.
- Push to GitHub after each phase (CI runs, PR previews deploy from Phase 00 onward).

---

## 5. Prompts (copy-paste)

### 5.1 Kickoff (first chat, Plan Mode)
```
Read AGENTS.md, then docs/PRD.md, docs/ARCHITECTURE.md, docs/DECISIONS.md and docs/tasks/README.md.
Don't write code yet. Give me:
1) a 10-line summary of what we're building and the key constraints (Workers CPU limit, client-owned accounts, hybrid i18n, content-layer boundary),
2) the contradictions, gaps or risky assumptions you find across the docs (with file + section),
3) for each, a proposed doc fix.
Then wait. After I approve, apply only the doc fixes and commit "docs: kickoff review fixes".
```

### 5.2 Per-task (new chat each time, Plan Mode)
```
Task: T<XX.Y> from docs/tasks/<phase-file>.md.
Read AGENTS.md, the task, every doc section the task's "Read first" lists, and the related .cursor/rules.
Check docs/PROGRESS.md for earlier deviations and follow-ups that affect this task.
Before using any library API, verify it against the installed version (node_modules docs or the MCP servers). Versions are pinned in ARCHITECTURE §1.

Plan first:
- restate the goal and the acceptance criteria in your own words,
- list the files you'll create/change,
- list the risks/unknowns and how you'll verify each,
- say what you will NOT do (scope guard).
Wait for my OK. Then implement, verify every acceptance criterion with evidence (command output, test names), skip any e2e/Playwright/pnpm shots step (ADR-011), run pnpm check, update docs/PROGRESS.md (tick + notes), and commit with a Conventional Commit message that includes the task ID.
```

### 5.3 Phase review (new chat after the last task of a phase)
```
Phase <NN> is done. Review it against docs/tasks/<phase-file>.md and the rules in .cursor/rules.
1) For every task: are all acceptance criteria met? Show evidence or say "not verified".
2) Look for boundary violations (content layer, i18n strings, tokens), accessibility gaps, performance risks on Workers (CPU, bundle size) and drift from the docs.
3) Run pnpm check. List what needs a manual check in the browser at 360/768/1280 (keyboard, focus, reduced motion, layout).
Report findings as a prioritized list (blocker / should fix / nice to have). Don't fix anything yet; wait for me to pick.
```

### 5.4 Design review (UI phases 01, 05, 06, 07)
```
Use the frontend-design and web-design-guidelines skills.
Review the screenshots I attach (all widths) and the components behind them.
Our direction: docs/DESIGN-SYSTEM.md §1 and §13 (warm, calm, trustworthy, child-friendly but not childish; parents are the audience; mobile-first).
Give me 5–10 concrete improvements (spacing, hierarchy, type, color use, motion, touch targets), each tied to a token or component change, not one-off classes. Flag anything that looks like a generic template.
Then wait. I'll pick which to apply.
```

### 5.5 Fix / bug (same chat if small, new chat if not)
```
Problem: <what you see, where (URL, viewport, locale), expected vs actual; paste the error or attach the screenshot>.
Find the root cause first and explain it in 2–3 sentences. Then propose the smallest fix consistent with the docs and rules. After my OK: fix, add a regression test (unit/render), run pnpm check, commit "fix(<scope>): … (T<XX.Y>)".
```

### 5.6 Resume (when a chat got long or was interrupted)
```
We're on T<XX.Y>. Read AGENTS.md, the task, docs/PROGRESS.md and `git log -10 --stat` / `git status`.
Tell me what is done, what's left against the acceptance criteria, and the next step. Then continue in Plan Mode.
```

### 5.7 Doc change / decision change
```
I want to change: <decision>. Read docs/DECISIONS.md and every doc section affected.
Write a new ADR (context, decision, consequences) and list every doc + task that must change. Wait for OK, then update the docs only (no code) and commit "docs: ADR-<n> <title>".
```

### 5.8 New client (after v1.0.0)
```
We're starting client <name>. Follow docs/NEW-CLIENT.md step by step. Tell me what you need from me for each [C] (client) and [D] (developer) item, do only the [D] items that don't need my accounts, and stop at each checkpoint.
```

---

## 6. Phases and gates (summary)

| Phase | Outcome | Your gate |
| --- | --- | --- |
| 00 Setup + spike | Strict repo, CI, deploys to Workers. Deploy check: proxy.ts, Worker size vs the Free limit, Studio embedded | Read the deploy-check results. Confirm embedded vs hosted Studio |
| 01 Design foundation | Tokens, fonts (Cyrillic), primitives, shadcn, motion, `/styleguide` | Pick font pairing + palette from the styleguide |
| 02 i18n | BG/EN routing, localized paths, switcher, hreflang | Click through both languages |
| 03 Studio | Full content model, i18n plugins, seed | Try editing as an editor would |
| 04 Content layer | Typed API, publish → rebuild webhook, preview/Presentation | Publish → see it live on workers.dev in a few minutes |
| 05 Shell | Shrinking header, mobile menu, action bar, banner, footer | Test on your phone |
| 06 Sections | All sections incl. expand-in-place tiles | Design review |
| 07 Pages | All routes, both locales | Click through everything |
| 08 Contact | Form → email, map, booking CTAs | Send a real message |
| 09 Consent/legal | Banner only when needed, analytics adapters, legal templates | Check with GA4 on and off |
| 10 SEO/perf | JSON-LD, sitemap, `llms.txt`, OG, Lighthouse ≥ 95, redirects | Read the manual Lighthouse scores |
| 11 QA/launch | CSP, editor guide, launch check, `new-client`, v1.0.0 | Fresh-clone test |

Realistic effort: about 75 focused chats. Phases 00–04 are the foundation, so don't rush them. The spike in T00.4 decides two important ADRs.

---

## 7. Things to know before you start

- **Static only, no payment card (ADR-012).** Every page is prerendered in CI; a Sanity publish triggers a GitHub rebuild + deploy (live in ~3–5 min). No ISR, R2, D1 or Durable Objects, because R2 needs a card even at $0.
- **Cloudflare Free plan CPU = 10 ms per request.** Public page views do no rendering. Only draft preview and the contact form action run per request; keep them light, there is no paid fallback.
- **Sanity Free**: datasets are **public** (no secrets/PII in content), only Admin/Viewer roles, 2 webhooks, no AI Assist. Our design fits within it.
- **Pins on purpose**: TypeScript 6.0 (not 7) and ESLint 9 (not 10) because of lint-plugin compatibility. Don't bump them without checking `docs/DECISIONS.md` ADR-009. There is no Renovate (ADR-012); upgrade deliberately.
- **Legal notes are not legal advice.** Items marked "verify" in `docs/LEGAL-GDPR.md` need a lawyer's or the client's confirmation before launch.
- **EN content** is AI-translated (via the Sanity MCP / agent) and then reviewed by a human. BG is the source of truth.

---

## 8. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Claude uses an outdated API (e.g. `middleware.ts`, `revalidateTag`/ISR, `@react-email/components`) | Point it to ARCHITECTURE §1 and `node_modules/next/dist/docs/`. Add the case to `.cursor/rules` if it repeats. |
| Error 1102 (CPU exceeded) on Workers | Check `cloudflare-observability` logs. Move work to build time. See ARCHITECTURE §6.6. |
| Preview (Presentation) iframe is blank | CORS origin with credentials missing in Sanity, or the CSP `frame-ancestors` lacks the Studio origin. Firefox strict tracking protection blocks third-party cookies (use Chrome/Safari). |
| Publish doesn't update the site | Webhook delivery log in sanity.io/manage (401/404 from GitHub = PAT expired or missing `contents:write`). Then the `deploy.yml` run in GitHub Actions. |
| Bulgarian letters look wrong in a font | The font lacks Cyrillic or `subsets` misses `'cyrillic'`. See DESIGN-SYSTEM §3. |
| Skills/MCP not used by the agent | Say it explicitly in the prompt ("use the frontend-design skill", "check with the shadcn MCP"). Verify they're enabled in Cursor settings. |
