# Phase 03 — Sanity Studio and schemas

**Goal:** an editor-friendly Studio at `/admin` with the full v1 content model, hybrid i18n, validation and seed content, plus generated types.
**Read first:** `docs/CONTENT-MODEL.md` (all), `docs/ARCHITECTURE.md` §5.3–5.4, §7 (Sanity i18n), `docs/DECISIONS.md` ADR-001/010, `.cursor/rules/sanity-schema.mdc`. Use the **Sanity MCP** (schema/docs lookups, dataset queries) and the Sanity agent-toolkit skills.
**Sandbox:** a developer-owned Sanity project with datasets `development` and `production` (both public on Free). Never store secrets or PII in documents.

---

### T03.1 — Sanity project wiring and embedded Studio
**Steps**
1. Install `sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/vision`, `styled-components` (exact versions from ARCHITECTURE §1).
2. `src/sanity/env.ts` (projectId, dataset, apiVersion `2026-11-01` as a constant, studioUrl `/admin`). `sanity.config.ts` (root; `basePath: '/admin'`, `name`, `title`, plugins via `src/sanity/plugins.ts`, schema from `src/sanity/schemaTypes`). `sanity.cli.ts` (`api`, `studioHost`, `typegen: { path: './src/**/*.{ts,tsx}', schema: 'schema.json', generates: 'sanity.types.ts', overloadClientMethods: true }`).
3. `src/app/admin/[[...tool]]/page.tsx` + `layout.tsx` per ARCHITECTURE §5.4, **including** `force-static`, `dynamicParams = false`, `generateStaticParams() → [{ tool: [] }]` and the `/admin/:path+ → /admin` rewrite in `next.config.ts` (T00.4: without them the Studio renders per request above the 10 ms CPU limit). Exclude `/admin` from the proxy matcher.
4. CORS origins with credentials: `http://localhost:3000`, `http://localhost:8787`, the preview worker URL. Document this in NEW-CLIENT (already listed, so verify it).
5. Scripts: `"typegen": "sanity schema extract --path schema.json && sanity typegen generate"`, `"studio:deploy": "sanity deploy"`.
6. T00.4 decision: the Studio stays embedded (ADR-010).
**AC:** `/admin` loads the Studio locally and on the preview worker; `pnpm preview` + `curl -sI /admin/structure` shows `x-opennext-cache: HIT`; `pnpm typegen` runs (empty schema OK).
**Done check:** open `/admin`, log in, see the empty desk.

### T03.2 — i18n plugins
**Steps:** Configure `@sanity/document-internationalization` (`supportedLanguages` from `src/config/i18n.ts`, `schemaTypes: ['page','service','article','legalPage']`, `languageField: 'language'`, weak references, metadata fields none) and `sanity-plugin-internationalized-array` v5 (`languages` from config, `defaultLanguages: ['bg']`, `fieldTypes: ['string', 'text', 'richTextSimple']` (add more only when a field needs it); v5 stores `{ _key, language, value }`). Add the hidden read-only `language` field to routable types. Confirm with the MCP/docs the exact v5 field shape and the GROQ for `translation.metadata` and record the snippets in ARCHITECTURE §7 if they differ.
**AC:** Creating a BG page and "Translate → EN" creates a linked EN document; field-level arrays show BG first.
**Done check:** manual Studio test + one GROQ query in Vision returning both translations via metadata.

### T03.3 — Shared object types
**Steps:** Implement every object in CONTENT-MODEL §1 with `defineType`/`defineField`/`defineArrayMember`, validation (alt text required unless `decorative`, link either internal ref or external URL with `https` validation, phone E.164 regex, hours `HH:mm`), `preview` configs and icons (`@sanity/icons`). Portable Text: allowed styles (normal, h2, h3, blockquote), decorators (strong, em), annotations (`link`), lists; no h1. Rich text image block uses `imageWithAlt`.
**Files:** `src/sanity/schemaTypes/objects/*.ts`.
**AC:** Each object has a description for editors (in BG with an EN fallback is OK; the Studio UI language is English) and validation messages that are understandable to non-technical editors.
**Done check:** `pnpm typegen` + Studio form check.

### T03.4 — Singletons: siteSettings and navigation
**Steps:** Per CONTENT-MODEL §2. Singleton pattern: fixed `_id`, structure item opens the document directly, document actions limited (no delete/duplicate/unpublish), excluded from "new document" menu. Group fields with `groups` (Brand, Contact, Hours, Social, Legal, Booking, SEO).
**AC:** Only one instance possible; required fields enforced before publish.
**Done check:** try to create a second instance (must be impossible).

### T03.5 — Collections
**Steps:** `serviceCategory`, `teamMember`, `faqItem`, `galleryItem`, `testimonial`, `announcement` per CONTENT-MODEL §4, field-level i18n. `galleryItem.showsPatient` → `consentOnFile` must be true to publish (custom validation, message explains why). `announcement` has `startsAt/endsAt` with validation `endsAt > startsAt`. `orderRank` via `@sanity/orderable-document-list` for team/FAQ/gallery/serviceCategory.
**AC:** Validation rules behave as documented. Orderable lists drag-and-drop.
**Done check:** Studio test of each validation.

### T03.6 — Routable documents and slug rules
**Steps:** `page` (with `pageKey` for system pages: home, services, about, gallery, blog, contact; read-only after creation; unique per language), `service`, `article`, `legalPage` per CONTENT-MODEL §3. Slugs: `isUnique` scoped per `_type` + `language`, auto-generated with a Bulgarian → Latin `slugify` (shared util in `src/lib/slug.ts`, unit-tested: "Детска стоматология" → "detska-stomatologiya"), reserved slugs rejected (the system pathnames in both languages, `admin`, `api`, `styleguide`). SEO object on each.
**AC:** Duplicate or reserved slug cannot be published; slugify tests pass.
**Done check:** `pnpm test src/lib/slug.test.ts` + Studio check.

### T03.7 — Section schemas and insert menu
**Steps:** All `section.*` types from CONTENT-MODEL §5 with the stated validation (hero first and single; FAQ `emitSchema` once). Shared base fields (`anchorId` optional slug-like, `tone`). `page.sections` array with `options.insertMenu` (groups: Intro, Content, Social proof, Contact; grid view with preview images from `public/studio/sections/*.png` — placeholders now, real thumbnails after Phase 06). Reserved types are not registered when `features.*` is false.
**AC:** Editors can add/reorder sections with visual previews; invalid combos blocked with clear messages.
**Done check:** Studio check + `pnpm typegen`.

### T03.8 — Desk structure and document UX
**Steps:** `src/sanity/structure.ts` per CONTENT-MODEL §7: language-filtered lists, "Missing translations" list (documents whose metadata lacks the other language), orderable lists, Announcements Active/Scheduled/Past (GROQ filters with `now()`). Default document node: form + (later) Presentation. Vision only in dev. Studio theme matching the brand lightly (`buildLegacyTheme` or the current theming API).
**AC:** An editor can find any content in ≤ 2 clicks; missing translations are visible.
**Done check:** walkthrough screenshot in PROGRESS.

### T03.9 — Seed script and typegen in CI
**Steps**
1. `scripts/seed.ts` (`tsx`, uses `@sanity/client` with a write token from `.env.local` `SANITY_WRITE_TOKEN`, never committed): uploads images from `seed/images/`, `createOrReplace` deterministic IDs, builds translation metadata documents, flags `--dataset`, `--client` (structure only), `--reset` (deletes seed docs only, by ID prefix).
2. Demo content "Demo Dental" BG + EN for every type and section (BG written natively, EN natural, not literal).
3. Types in CI: `pnpm typecheck` runs `pnpm typegen` before `tsc`, so CI type-checks against freshly generated Sanity types without an extra CI step (ADR-012: CI = lint, typecheck, unit tests, build). Commit the regenerated files.
**AC:** `pnpm seed --dataset development` is idempotent; Studio shows complete BG/EN content; a query/schema mismatch fails `pnpm typecheck`.
**Done check:** run the seed twice → no duplicates; CI green.
