# Phase 11 — QA, launch, template packaging

**Goal:** a verified, documented, tagged template (v1.0.0) that becomes a new client site in under a day using `docs/NEW-CLIENT.md`.
**Read first:** `docs/PRD.md` (quality targets), `docs/ARCHITECTURE.md` §10–13, `docs/NEW-CLIENT.md`, `docs/LEGAL-GDPR.md` §10.

---

### T11.1 — Manual accessibility and keyboard pass — SKIPPED (ADR-012, brochure scope)
No site-wide pass. WCAG 2.2 AA is still required: each UI task does its own manual check (Lighthouse accessibility audit + keyboard), and NEW-CLIENT §9 keeps the launch keyboard and screen-reader spot check.

### T11.2 — Visual regression baselines — SKIPPED (ADR-011)
Dropped with Playwright. No replacement; visual review is manual.

### T11.3 — Security headers and CSP
**Steps:** Implement ARCHITECTURE §10 headers. CSP in `Content-Security-Policy-Report-Only` first (allowlist built from `src/config/csp.ts`, derived from enabled features/analytics provider); route `/admin` gets its own relaxed policy (Studio needs `'unsafe-eval'`? verify against Sanity docs and keep it scoped to `/admin`). Test on preview with the browser console and `securityheaders.com`/Mozilla Observatory. Switch to enforcing after a clean week on a real client (document the switch step in NEW-CLIENT). Add a Cloudflare WAF rate-limiting rule recommendation for the form POST (documented, client-owned).
**AC:** Observatory grade ≥ A on preview (with Report-Only noted); no CSP violations in the browser console on a manual walk-through of every page journey.
**Done check:** walk-through notes + Observatory result in PROGRESS.

### T11.4 — Backup workflow and restore drill — SKIPPED (ADR-012, brochure scope)
No `backup.yml` and no drill. Manual export when needed: `pnpm sanity dataset export production production-YYYY-MM-DD.tar.gz` (NEW-CLIENT §10).

### T11.5 — Editor guide and handover pack
**Steps:** `docs/handover/EDITOR-GUIDE.bg.md` (Bulgarian, non-technical, with screenshots): logging in, editing pages and sections, Presentation (preview + click-to-edit), translations workflow (create EN from BG, AI-assisted translation via Sanity MCP/agent by the developer, review), images (alt text, hotspot, child photo consent), announcements (holiday hours), publishing and what happens after (live in about 3–5 min after Publish; drafts never go live), what not to do. `docs/handover/OWNERSHIP.bg.md`: accounts the client owns (Cloudflare, Sanity, Resend, domain, GitHub optional), roles, billing expectations ($0; Cloudflare Free with no payment card, ADR-012; Sanity Growth only if roles or scheduling are wanted), DSR procedure (T09.4).
**AC:** A non-technical reviewer can follow the guide to publish an announcement unaided (dry run with Silvena).
**Done check:** dry-run notes.

### T11.6 — Launch checklist automation
**Steps:** `scripts/launch-check.ts` (`pnpm launch-check --url https://…`): fetches the sitemap and checks every URL (200, canonical = self, hreflang pairs reciprocal, `noindex` absent, OG image reachable, JSON-LD parses), robots allows indexing and points to the sitemap, no `[[placeholders]]` in legal pages, `NEXT_PUBLIC_ENV=production`, styleguide disabled (404), security headers present, contact form test submission (optional flag), DNS email records (SPF/DKIM/DMARC via DoH lookup). Prints a pass/fail table and exits non-zero on failures. NEW-CLIENT §9 references this task.
**AC:** Run against the sandbox production: all automated checks pass, and the remaining manual items are listed at the end of the output.
**Done check:** output pasted into PROGRESS.

### T11.7 — Template packaging and v1.0.0
**Steps**
1. `scripts/new-client.ts` (interactive, `@clack/prompts`): asks the NEW-CLIENT §2 questions, writes `src/config/site.ts`, `.env.local`, `.dev.vars`, the worker name in `wrangler.jsonc` (no bindings to add, ADR-012), resets `docs/PROGRESS.md` to a client copy, removes demo seed images if requested, and prints the next manual steps. It's idempotent and has a `--dry-run`.
2. Theme presets: `src/styles/presets/{neutral,rumi-dent}.css` (tokens only); `new-client` copies the chosen one into `tokens.css`.
3. Mark the GitHub repo as a **template repository**. Document "Use this template" → private repo in the client's or Silvena's org (NEW-CLIENT §2), and the upstream-sync strategy (NEW-CLIENT: `git remote add template …`, cherry-pick or merge tagged releases).
4. `CHANGELOG.md` v1.0.0, tag `v1.0.0`, and a release note listing the pinned versions and known limitations (from PROGRESS follow-ups).
5. Fresh-clone test: follow NEW-CLIENT end-to-end on a throwaway Sanity project + Cloudflare account and time it (target < 1 day including content seeding; < 2 h technical setup).
**AC:** The fresh-clone test succeeds without undocumented steps (fix the docs where needed).
**Done check:** timing + issues logged in PROGRESS; tag pushed.
