# Content Model (Sanity)

Conventions
- **i18n legend:** **[D]** = document-level i18n (one document per language, `language` field, linked by `translation.metadata`). **[F]** = field-level: the field uses an `internationalizedArray*` type (`[{_key, language, value}]`). **[—]** = not translated (shared).
- Field-level types registered with the internationalized-array plugin (`fieldTypes`): `string`, `text`, `richTextSimple` (Portable Text: paragraphs, bold/italic, links, lists), `slug`. They become `internationalizedArrayString`, `internationalizedArrayText`, `internationalizedArrayRichTextSimple`, `internationalizedArraySlug`.
- `defaultLanguages: ['bg']` (from `defaultLocale`) creates a BG row on every new document. EN rows are added with "Add EN". Validation requires the default language. Other languages are optional, and the content layer falls back per field.
- Validation messages are written for non-technical editors ("Add a short title, max 60 characters").
- Every type defines a `preview` (title, subtitle, media) and an icon (`@sanity/icons`/lucide).
- Free-plan budget: keep the total unique attribute paths < 1,500 (limit 2,000). Reuse objects. Check `sanity documents validate` and the attribute count (`/data/stats/<dataset>` → `fields.count`) after seeding; 645 with the full demo seed (2026-11-21).
- **Never** store secrets or personal data. Datasets are public on Free.

---

## 1. Shared object types

### `imageWithAlt`
| Field | Type | i18n | Validation / notes |
| --- | --- | --- | --- |
| asset | image (`hotspot: true`) | — | required |
| alt | internationalizedArrayString | F | required for `defaultLocale` unless `decorative` is true. Max 140 chars. Description: "Describe what is in the photo for people who can't see it." |
| decorative | boolean | — | default false. Hides `alt`. |
| caption | internationalizedArrayString | F | optional, max 160 |
| credit | string | — | optional (stock attribution) |

### `richText` (full Portable Text, for articles, legal and rich text blocks)
Blocks: `normal`, `h2`, `h3`, `h4`, `blockquote`. Lists: bullet, number. Decorators: strong, em, underline (off), code (off). Annotations: `link` (see below). Custom blocks: `imageWithAlt`, `callout` (`tone: info|tip|warning`, text), `ctaInline` (cta), `cookieTable` and `processorsList` (optional `caption`; the site renders the content from config, for legal pages). No h1 (the page title is the h1). Validation: warn when headings skip levels.

### `richTextSimple`
Blocks: `normal` only, lists, strong/em, `link`. Used inside tiles, team bios, FAQ answers, hero subheading (optional).

### `link`
| Field | Type | Notes |
| --- | --- | --- |
| kind | string enum `internal \| external \| tel \| email \| anchor` | radio |
| internal | reference → `page`, `service`, `article`, `legalPage` | when internal; filtered to the same `language` as the parent doc (for [F] parents: any, resolved per locale) |
| systemRoute | string enum `home \| services \| about \| gallery \| blog \| contact` | alternative to `internal` for system pages |
| href | url (`https`, `mailto`, `tel` allowed) | when external |
| phoneKey | string enum `primary \| secondary` | when tel: pulls from settings |
| anchor | string (slug-like) | when anchor |
| openInNewTab | boolean | external only. The renderer adds "(opens in new tab)" visually hidden text from messages. |

### `cta`
| Field | Type | i18n | Notes |
| --- | --- | --- | --- |
| label | internationalizedArrayString (in [F] parents) / string (in [D] parents) | F/— | max 32 chars |
| action | string enum `link \| call \| booking \| directions` | — | `call`/`booking`/`directions` read from settings |
| link | link | — | when action = link |
| style | string enum `primary \| secondary \| outline \| ghost` | — | default primary |

> Rule for i18n inside objects: objects embedded in **[D] documents** use plain `string`/`text`/`richText` (the whole document is one language). Objects embedded in **[F] documents** use `internationalizedArray*`. Define two variants where needed (`cta` / `ctaI18n`) rather than mixing.

### `seo`
| Field | Type | Notes |
| --- | --- | --- |
| title | string | 30–60 chars (warning outside the range). Fallback: document title. |
| description | text (rows 3) | 70–160 chars (warning). Fallback: excerpt/settings default. |
| ogImage | imageWithAlt | 1200×630 crop via hotspot. Fallback: hero/cover image → settings default. |
| noIndex | boolean | default false |
| canonicalOverride | url | rarely used |
(In [F] parents the same object with `internationalizedArray*` fields: `seoI18n`. Not built in v1: no [F] document has its own SEO; `siteSettings.seoDefaults` covers the site-wide defaults.)

### `phone` (array item of `siteSettings.phones`)
`key` (`primary | secondary`), `e164` (E.164 regex `^\+[1-9]\d{6,14}$`), `display` (string, required), `label` [F] (optional). A `link` with `kind: tel` dials the phone with the matching `phoneKey`; `kind: email` uses `siteSettings.email`.

### `address`
`street` [F] (e.g. «ж.к. Възраждане, ул. „Плиска" 54»), `city` [F], `postalCode` [—], `region` [F, optional], `countryCode` [—] (ISO 3166-1 alpha-2, default `BG`).

### `geo`
`lat` number (−90…90), `lng` number (−180…180). Required for the directions link, map pin and JSON-LD.

### `openingHoursSpec` (array item)
| Field | Type | Notes |
| --- | --- | --- |
| days | array of string enum `Mo Tu We Th Fr Sa Su` | ≥ 1 |
| opens | string `HH:mm` | regex validation |
| closes | string `HH:mm` | must be after `opens` |
| note | internationalizedArrayString | optional ("by appointment") |
Days not listed = closed. Example Rumi Dent: `[Mo,Tu,Th] 09:00–18:00`, `[We,Fr] 09:00–14:00`.

### `specialHours` (array item: holidays/exceptions)
`date` (date), `endDate` (optional date range), `closed` boolean, `opens`/`closes`, `label` [F] ("Christmas"). Shown on the contact block and footer when within the next 14 days. JSON-LD `specialOpeningHoursSpecification`.

### `socialLink`
`platform` enum (`facebook instagram tiktok youtube linkedin viber whatsapp googleBusiness other`), `url` (url), `label` [F] (for `other`).

### `legalEntity`
`legalName` (string, e.g. «Руми Дент ЕООД»), `uic` (ЕИК, string, 9 or 13 digits), `vatNumber` (optional), `registeredAddress` (address), `representative` (optional string), `professionalBody` [F] (e.g. «Български зъболекарски съюз»), `registration` [F] (e.g. the registration number at the Regional Health Inspectorate (РЗИ)), `supervisoryAuthority` [F] (optional). Used in the footer/legal pages (Bulgarian E-Commerce Act provider information; confirm with the client's lawyer).

### `bookingConfig`
| Field | Type | Notes |
| --- | --- | --- |
| mode | enum `phone \| externalUrl \| embed` | v1 implements `phone` + `externalUrl`. `embed` is reserved. |
| provider | enum `superdoc \| other` | informational |
| url | url | when externalUrl |
| label | internationalizedArrayString | default from messages ("Book an appointment") |
| note | internationalizedArrayString | e.g. "Appointments recommended" |

---

## 2. Singletons

### `siteSettings` [F] (fixed `_id: "siteSettings"`)
Groups (Studio tabs): Brand · Contact · Hours · SEO · Booking & form · Legal · Integrations.

| Field | Type | i18n | Validation / notes |
| --- | --- | --- | --- |
| brandName | internationalizedArrayString | F | required (BG «Руми Дент», EN "Rumi Dent") |
| tagline | internationalizedArrayString | F | optional, ≤ 80 |
| logo | image (SVG preferred) | — | optional. If empty, the `Wordmark` component renders `brandName`. |
| logoCompact | image | — | optional (mark/initials for the compact header) |
| favicon | image | — | optional (source for documentation; real favicons live in `/public/brand`) |
| businessType | enum `Dentist MedicalClinic Physician LocalBusiness ProfessionalService HealthAndBeautyBusiness Store` | — | JSON-LD `@type`. Default `LocalBusiness`. |
| address | address | F | required |
| geo | geo | — | required |
| phones | array of `{ key: 'primary'\|'secondary', e164: string, display: string, label [F] }` | — | ≥ 1, E.164 regex `^\+[1-9]\d{6,14}$` |
| email | string (email) | — | optional, public. Description: "Shown on the website." |
| openingHours | array of openingHoursSpec | — | ≥ 1 |
| specialHours | array of specialHours | — | |
| timeZone | string | — | default `Europe/Sofia` (IANA). Used for "open now". |
| mapEmbedUrl | url | — | must start with `https://www.google.com/maps/embed` (from Google Maps → Share → Embed a map) |
| mapPlaceholder | imageWithAlt | — | optional static image shown before the click |
| googleBusinessUrl | url | — | Google Business Profile / Maps place URL (JSON-LD `hasMap`, reviews link) |
| socials | array of socialLink | — | |
| booking | bookingConfig | — | required (`mode: phone` default) |
| contactForm | `{ recipient: email, subjectPrefix: [F] string, successMessage: [F] text }` | mixed | recipient optional if the `CONTACT_TO_EMAIL` env var is set. Description warns: "This address is publicly readable via the API." |
| seoDefaults | `{ titleTemplate: [F] string ("%s · Руми Дент"), description: [F] text, ogImage: imageWithAlt, googleVerification: string, bingVerification: string }` | F | required description; the two verification codes are optional (DNS verification is preferred, SEO.md §6) |
| legal | legalEntity | mixed | required before launch (warning) |
| priceRange | string | — | optional JSON-LD (`€€`) |
| areaServed | internationalizedArrayString | F | e.g. «Русе и региона» |
| footerNote | internationalizedArrayText | F | optional |
| legalLinks | array of reference → legalPage (BG docs; resolved per locale via translations) | — | |

### `navigation` [F] (fixed `_id: "navigation"`)
| Field | Type | Notes |
| --- | --- | --- |
| header | array (≤ 6) of `{ label [F], link: link, children?: array (≤ 8) of { label [F], link } }` | One level of dropdown max. Mobile shows all. |
| headerCta | ctaI18n | default action = booking/call |
| footerColumns | array (≤ 4) of `{ title [F], links: array of { label [F], link } }` | |
| mobileActionBar | `{ showDirections: boolean (true), secondaryAction: enum none\|booking\|viber\|whatsapp\|email }` | |

---

## 3. Routable documents [D]
All share: `language` (string, readOnly, hidden; set by the plugin), `title` (string, required, ≤ 70), `slug` (slug, source title, required, **unique per language**, lowercase Latin, `isUnique` checks `language`), `seo` (seo), `publishedAt`/`updatedAt` where relevant.

Slug uniqueness per language: custom `isUnique` that queries `!defined(*[_type == $type && slug.current == $slug && language == $lang && !(_id in [$id, $draftId])][0]._id)`. See the plugin doc "Allowing the same slug on different language versions".

### `page`
| Field | Type | Validation / notes |
| --- | --- | --- |
| pageKey | enum `home services about gallery blog contact` \| empty | Unique per language. Locked once set (administrators can still change it, to fix a mis-click). If set, the page is a **system page** bound to a code route (its slug is ignored and hidden). If empty, the page is generic at `/[slug]`. |
| title | string | required |
| slug | slug | required when no pageKey. Must not be a reserved segment: `uslugi services za-nas about galeriya gallery blog kontakti contact pravna-informaciya legal admin api styleguide en bg` (generated from pathnames config). |
| intro | text | optional; used in cards, meta fallback |
| sections | array of section types (see §5) | ≥ 1 for generic pages. The insert menu is grouped (Intro, Content, Social proof, Contact) with a grid of thumbnails from `public/studio/sections/<type>.png`. Each item shows a preview with its type and heading. |
| seo | seo | |
| hideFromNav / hideFromSitemap | boolean | |

### `service`
| Field | Type | Validation / notes |
| --- | --- | --- |
| title | string | required, ≤ 60 |
| slug | slug | required |
| category | reference → serviceCategory | required |
| icon | string (lucide icon name from the curated list in `src/config/icons.ts`) or image | one of icon/image |
| image | imageWithAlt | optional |
| teaser | string | required, ≤ 120 (tile teaser) |
| summary | richTextSimple (plain, [D] doc) | required (tile panel content) |
| body | richText | optional; enables the detail page |
| hasDetailPage | boolean | default false. If true, `body` is required and the tile shows "Read more". |
| durationNote / priceNote | string | optional free text (until the price list exists) |
| faq | array of references → faqItem | optional |
| doctors | array of references → teamMember | optional |
| orderRank | string (orderable) | hidden |
| seo | seo | |

### `article`
| Field | Type | Validation / notes |
| --- | --- | --- |
| title | string | required, ≤ 90 |
| slug | slug | required |
| excerpt | text | required, 80–200 |
| cover | imageWithAlt | required |
| body | richText | required |
| author | reference → teamMember | optional (E-E-A-T) |
| reviewedBy | reference → teamMember | optional ("medically reviewed by") |
| publishedAt | datetime | required, default now |
| updatedAt | datetime | optional; shown when > publishedAt + 1 day |
| readingTime | number | computed in GROQ/mapper (not stored) |
| related | array (≤ 3) of reference → article (same language) | optional; fallback: latest |
| categories | array of string | **reserved, hidden** in v1 |
| seo | seo | |

### `legalPage`
| Field | Type | Validation / notes |
| --- | --- | --- |
| kind | enum `privacy cookies gdpr terms other` | unique per language |
| title | string | required |
| slug | slug | required |
| body | richText | required. **Custom validation blocks publishing while any `[[…]]` placeholder remains.** The `cookieTable` and `processorsList` blocks render live from `src/config/cookies.ts` / `src/config/processors.ts`. |
| lastUpdated | date | required |

---

## 4. Collections [F]

### `serviceCategory`
`title` [F] (required), `slug` [F] (internationalizedArraySlug, for anchors), `description` [F] text, `audience` enum `children adults everyone` (drives grouping: children first for Rumi Dent), `tone` enum (`soft brand accent`), `orderRank`.

### `teamMember`
| Field | Type | i18n | Validation / notes |
| --- | --- | --- | --- |
| name | string | — | required (shown as-is; BG Cyrillic. Optional `nameLatin` for EN) |
| nameLatin | string | — | optional (EN pages use it if present) |
| honorific | internationalizedArrayString | F | e.g. «д-р» / "Dr." |
| role | internationalizedArrayString | F | required ("Pediatric dentist") |
| specialties | array of `specialty` objects (`label`: internationalizedArrayString) | F | optional chips; wrapped in an object because Sanity doesn't allow arrays directly inside arrays |
| bioShort | internationalizedArrayText | F | required, ≤ 300 |
| bio | internationalizedArrayRichTextSimple | F | optional |
| photo | imageWithAlt | F(alt) | required (real photo) |
| featured | boolean | — | the featured member is shown first and larger (Rumi Dent: the pediatric dentist) |
| yearsExperience | number | — | optional; shown on team cards (e.g. 12) |
| categories | array of reference → serviceCategory | — | links a doctor to children/adults |
| credentials | array of `{ label [F], year }` | F | optional (education, memberships) |
| slug | slug | — | **reserved** for future profile pages (hidden) |
| sameAs | array of url | — | JSON-LD (professional profiles) |
| orderRank | string | — | |

### `faqItem`
`question` [F] (required, ≤ 140), `answer` [F] richTextSimple (required; first sentence = direct answer, see SEO AEO rules), `category` enum or reference (`general firstVisit children adults prices emergencies`), `orderRank`.

### `galleryItem`
| Field | Type | Notes |
| --- | --- | --- |
| image | imageWithAlt | required |
| album | enum `clinic team patients events other` | required |
| showsPatient | boolean | default false |
| consentOnFile | boolean | **required true when showsPatient** (custom validation). Description: "Written consent from the parent/guardian is signed and stored at the clinic." |
| consentReference | string | internal reference ID only (no personal data). Required when showsPatient. |
| pairWith | reference → galleryItem | **reserved** for before/after (hidden) |
| orderRank | string | |

### `testimonial`
`quote` [F] (required, ≤ 400), `authorName` (string, e.g. "Maria, mother of Niki (5)"; first name/initials only), `rating` (1–5, optional), `date` (date), `source` enum `manual google` (google reserved), `sourceUrl` url, `consentOnFile` boolean (required true for manual), `featured` boolean. Medical-advertising caution: the clinic must confirm testimonials comply with professional ethics rules (see LEGAL-GDPR).

### `announcement`
`message` [F] (required, ≤ 140), `link` (ctaI18n, optional), `tone` enum `info promo warning`, `startsAt` datetime (required), `endsAt` datetime (optional, after startsAt), `dismissible` boolean (default true), `pages` enum `all home` (default all). Query (at build time): not ended = `!defined(endsAt) || endsAt > now()`; prefer the active one (`startsAt <= now()`, latest `startsAt` first), else the next upcoming one. The site is static (ADR-012), so the banner gets `startsAt`/`endsAt` and checks them client-side (hidden before start and after end); the daily scheduled deploy refreshes the choice.

---

## 5. Sections (objects inside `page.sections`)
All sections share the base fields: `anchorId` (slug-like, optional, unique within the page), `tone` (enum `base soft brand accent inverse`, default base), `spacing` (enum `default compact none`), `hidden` (boolean: lets the editor hide without deleting). Text fields are plain (the page is [D]).

| `_type` | Fields (beyond base) | Validation |
| --- | --- | --- |
| `section.hero` | `heading` (string, req, ≤ 80), `subheading` (text, ≤ 220), `ctas` (array ≤ 2 of cta), `image` (imageWithAlt, req), `variant` (`split cutout fullBleed`), `trustItems` (array ≤ 4 of `{ icon, text ≤ 40 }`) | Only 1 hero per page, and it must be first (custom validation). |
| `section.textImage` | `heading`, `body` (richText, req), `image` (optional), `imagePosition` (`left right`), `cta` (optional) | |
| `section.tiles` | `heading`, `intro`, `source` (`manual services`), `items` (manual: array 2–8 of `{ title, teaser, icon, image, body richTextSimple, cta, slug }`), `serviceCategory` (ref, for source=services; empty = all, grouped by category), `allowMultiple` (boolean), `density` (`comfortable compact`), `layout` (`grid orbit`, default `grid`) | `items` required when manual. Item `slug` unique (deep link). |
| `section.faq` | `heading`, `intro`, `source` (`selected category all`), `items` (refs → faqItem), `category`, `emitSchema` (boolean, default true), `layout` (`accordion split`, default `accordion`) | At most 1 FAQ section with `emitSchema` per page. |
| `section.ctaBand` | `heading` (req), `text`, `ctas` (1–2) | |
| `section.team` | `heading`, `intro`, `members` (refs; empty = all by orderRank), `layout` (`featuredFirst grid duo`) | |
| `section.gallery` | `heading`, `album` (enum or empty = all), `items` (refs, optional override), `limit` (number 1–24, default 9), `showLinkToGallery` (boolean) | |
| `section.blogTeaser` | `heading`, `mode` (`latest selected`), `articles` (refs ≤ 3), `count` (1–6, default 3), `layout` (`grid featured`, default `grid`) | |
| `section.contactHours` | `heading`, `showMap` (boolean), `showForm` (boolean; contact page only), `note` (text) | Data from siteSettings. |
| `section.processSteps` | `heading`, `intro`, `steps` (array 3–6 of `{ title ≤ 50, text ≤ 220, icon }`), `cta`, `layout` (`cards compact`, default `cards`) | |
| `section.testimonials` | `heading`, `items` (refs → testimonial; empty = featured), `showRating` (boolean) | |
| `section.richTextBlock` | `heading` (optional), `body` (richText, req), `width` (`prose wide`) | |
| **Reserved (not built in v1)** | `section.priceList`, `section.beforeAfter`, `section.googleReviews` | Names reserved in the registry. The Studio hides them while `features.*` is false. |

Renderer contract: the content layer maps each section to a discriminated union `Section = HeroSection | TextImageSection | …` with `type: 'hero' | 'textImage' | …` (CMS-agnostic names). Unknown types are dropped with a dev-only console warning.

---

## 6. Future types (design only, do not build)
- `priceItem` [F]: `name`, `category` (ref serviceCategory), `price` (number), `priceTo` (optional range), `currency` (`EUR` default; Bulgaria adopted the euro on 2026-01-01), `unit` [F] ("per tooth"), `note` [F], `orderRank`. Section `priceList` groups by category. JSON-LD `Offer` on `Service`.
- `beforeAfter`: pair of `galleryItem` (both `showsPatient` + consent), `caption` [F], `treatment` (ref service). Slider component with a keyboard-accessible range input.
- `googleReviews`: fetched at build from the Google Places API (server-side key), cached, rendered via `Testimonials` with `source: google` and attribution as required by Google's terms.
- `location` (multi-location clients): extract `address/geo/hours/phones` from siteSettings into a document. siteSettings then references the primary location.

---

## 7. Studio structure (`src/sanity/structure.ts`)
```
Settings
  ├─ Site settings (singleton)
  └─ Navigation (singleton)
Pages            → by language (BG | EN)
Services         → Categories (orderable), Services by language (orderable)
Team             → orderable
FAQ              → orderable, filter by category
Gallery          → orderable, by album
Blog             → Articles by language (newest first)
Testimonials
Announcements    → Active / Scheduled / Past
Legal            → by language
Missing translations → "Not yet in <language>" per language, across page/service/article/legalPage
```
- Document actions: singletons → no delete/duplicate/unpublish. `legalPage` → no delete (unpublish only).
- New-document templates: language-specific ("Page (BG)", "Page (EN)") via the document-internationalization plugin.
- Presentation tool: `resolve.locations` for page/service/article/legalPage (localized URLs), plus `mainDocuments` so opening a URL in Presentation selects its document.
- Vision tool only in development (`process.env.NODE_ENV !== 'production'` or a dev-only workspace).

---

## 8. Seed content (`seed/`, `pnpm seed` → `development` dataset)
- Deterministic `_id`s (`seed-page-home-bg`, metadata `seed-meta-page-home`; singletons keep `siteSettings` / `navigation`), idempotent (`createOrReplace`). **No dots in ids:** Sanity treats ids containing `.` as private paths, so the site's tokenless published reads would not see them. `--reset` deletes `seed-*` and `drafts.seed-*` only (not combinable with `--client`). Demo seed and `--reset` are allowed only on the `development` dataset unless `--force`; demo content is refused for `production` (use `--client`).
- Demo brand "Demo Dental" with plausible BG/EN content for every section and type, images from `seed/images/` (generated placeholders labelled "placeholder"; Sanity dedupes re-uploads by hash).
- Legal pages from the `LEGAL-GDPR.md` templates with `[[placeholders]]` (filled with demo company details in demo mode).
- For a real client, `pnpm seed --client --dataset production` creates only the structure (system pages with standard empty sections, empty settings, legal templates with placeholders, system-route navigation) **as drafts, create-only**: a document is skipped if its published or draft version exists, so re-running never overwrites a client's edits. Translation metadata is published, as the plugin does.
- Checked offline by `scripts/seed/build.test.ts` (unique ids, references resolve, metadata per routable doc, slugs, section rules, every field exists in `schema.json`) and after a run by `sanity documents validate`. The seed doesn't run in CI (the write token is local only).
