# Task files

One file per phase. Each task is sized for **one Cursor chat** (roughly 30–120 min of agent work) and ends with a commit.

Task format
- **Context:** why the task exists and the docs to read.
- **Steps:** the expected outline. The agent refines it into a concrete plan in Plan Mode.
- **Files:** created/modified (indicative).
- **Acceptance criteria (AC):** what must be true. Verify every AC before claiming done.
- **Done check:** commands/observations that prove it.

> **ADR-011 (no Playwright).** The task files no longer contain e2e, Playwright, axe-in-browser or `pnpm shots` steps; those checks were rewritten as Vitest tests (where jsdom can cover the behavior) or manual checks noted in PROGRESS. Don't add browser tests back. Skipped: **T01.7** (screenshot script) and **T11.2** (visual regression).

> **ADR-012 (static only).** No ISR, R2, D1, Durable Objects, cache tags, `/api/revalidate` or Renovate. Every page is prerendered; a Sanity publish triggers a GitHub rebuild + deploy. No Cloudflare feature that needs a payment card. Task files were rewritten accordingly (T00.3–T00.5, T04.1/T04.3/T04.4/T04.7, T05.4, T07.1).

> **ADR-012 amendment (brochure scope).** Skipped: **T11.1** (site-wide a11y/keyboard pass; per-task manual checks stay) and **T11.4** (backup workflow + restore drill; manual `sanity dataset export` instead). **T10.5** has no Lighthouse CI, only a manual Lighthouse run plus redirects. The blog stays.

Phase order and gates

| Phase | File | Gate at the end |
| --- | --- | --- |
| 00 | `00-setup.md` | Deploy check recorded (fits Workers Free). ADR-004/010 confirmed or amended |
| 01 | `01-design-foundation.md` | Styleguide reviewed by Silvena |
| 02 | `02-i18n-routing.md` | Both locales route correctly |
| 03 | `03-sanity-studio.md` | Studio usable with seed content |
| 04 | `04-content-layer.md` | Publish → rebuild → page updated on workers.dev in ≤ 10 min |
| 05 | `05-layout-shell.md` | Header/menu/action bar pass a manual keyboard + visual review |
| 06 | `06-sections.md` | Every section in the styleguide + home renders the seed |
| 07 | `07-routes-pages.md` | All routes in both locales (manual check) |
| 08 | `08-contact-integrations.md` | Form sends real email from preview |
| 09 | `09-consent-analytics-legal.md` | Banner logic correct with GA4 on/off |
| 10 | `10-seo-performance.md` | Manual Lighthouse run within budgets on preview |
| 11 | `11-qa-launch.md` | Template v1.0.0 tagged |

Dependencies: phases run in order. Inside a phase, tasks run in numeric order unless marked "parallel-safe".
