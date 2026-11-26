/**
 * Shared GROQ projections, interpolated into `defineQuery` template literals. TypeGen evaluates
 * both the constants and the helper calls (checked in T04.2). Every query takes `$locale` and
 * `$fallback` (the default locale) for field-level i18n.
 */

/** Field-level i18n value with fallback to the default locale (ARCHITECTURE §7.3). */
export const i18n = (field: string) =>
  `coalesce(${field}[language == $locale][0].value, ${field}[language == $fallback][0].value)`

/** What a link needs to build the localized href of a routable document. */
export const routeFields = /* groq */ `_type, title, "slug": slug.current, pageKey, hasDetailPage`

/**
 * A reference resolved to its version in `$locale`: the document itself when it is in that
 * language, otherwise its translation. Null when no version exists in `$locale`.
 * `refId` is the reference id seen from inside the subquery (`^.internal._ref`, or `^._ref` for
 * an item of a reference array). Two arguments because TypeGen can't evaluate conditionals.
 */
export const localizedRef = (ref: string, refId: string) => /* groq */ `select(
  ${ref}->language == $locale => ${ref}->{ ${routeFields} },
  *[_type == "translation.metadata" && references(${refId})][0]
    .translations[language == $locale][0].value->{ ${routeFields} }
)`

export const linkFields = /* groq */ `
  kind,
  systemRoute,
  href,
  anchor,
  openInNewTab,
  "internal": ${localizedRef('internal', '^.internal._ref')},
  "phone": select(kind == "tel" => *[_id == "siteSettings"][0].phones[key == ^.phoneKey][0].e164),
  "email": select(kind == "email" => *[_id == "siteSettings"][0].email)
`

export const imageFields = /* groq */ `
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  crop,
  hotspot,
  decorative,
  "alt": ${i18n('alt')}
`

/** `cta` (plain label, [D] parents). */
export const ctaFields = /* groq */ `label, action, style, link{ ${linkFields} }`

/** `ctaI18n` (localized label, [F] parents). */
export const ctaI18nFields = /* groq */ `"label": ${i18n('label')}, action, style, link{ ${linkFields} }`

const markDefs = /* groq */ `markDefs[]{ ..., _type == "link" => { ${linkFields} } }`

/** Projection for each block of a `richTextSimple` array. */
export const richTextSimpleBlock = /* groq */ `{ ..., ${markDefs} }`

/** Projection for each block of a full `richText` array. */
export const richTextBlock = /* groq */ `{
  ...,
  _type == "block" => { ${markDefs} },
  _type == "imageWithAlt" => { ${imageFields}, "caption": ${i18n('caption')} },
  _type == "ctaInline" => { ${ctaFields} }
}`

export const seoFields = /* groq */ `
  title, description, noIndex, canonicalOverride, ogImage{ ${imageFields} }
`

/** Every published translation of the current document (`^` = the document). */
export const translationsField = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)][0]
    .translations[]{ "locale": language, "doc": value->{ ${routeFields} } }
`

export const categoryFields = /* groq */ `
  _id,
  "title": ${i18n('title')},
  "slug": coalesce(slug[language == $locale][0].value.current, slug[language == $fallback][0].value.current),
  "description": ${i18n('description')},
  audience,
  tone
`

export const serviceSummaryFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  icon,
  image{ ${imageFields} },
  teaser,
  summary[]${richTextSimpleBlock},
  durationNote,
  priceNote,
  hasDetailPage,
  "category": category->{ ${categoryFields} }
`

export const teamMemberFields = /* groq */ `
  _id,
  name,
  nameLatin,
  "honorific": ${i18n('honorific')},
  "role": ${i18n('role')},
  "specialties": specialties[]{ "label": ${i18n('label')} },
  "bioShort": ${i18n('bioShort')},
  "bio": ${i18n('bio')}[]${richTextSimpleBlock},
  photo{ ${imageFields} },
  featured,
  yearsExperience,
  "credentials": credentials[]{ "label": ${i18n('label')}, year },
  sameAs
`

export const faqItemFields = /* groq */ `
  _id,
  "question": ${i18n('question')},
  "answer": ${i18n('answer')}[]${richTextSimpleBlock},
  category
`

/**
 * Patient photos only with signed consent on file. Studio blocks publishing without it; the query
 * enforces it too, so a schema change or an API write can't put a patient photo on the site.
 */
export const galleryConsentFilter = /* groq */ `(showsPatient != true || consentOnFile == true)`

export const galleryItemFields = /* groq */ `
  _id,
  album,
  image{ ${imageFields}, "caption": ${i18n('caption')} }
`

export const testimonialFields = /* groq */ `
  _id, "quote": ${i18n('quote')}, authorName, rating, date, featured
`

export const articleSummaryFields = /* groq */ `
  _id, title, "slug": slug.current, excerpt, cover{ ${imageFields} }, publishedAt, updatedAt
`

/** Page-builder sections. Hidden sections never leave the query. `^` = the section. */
export const sectionsField = /* groq */ `
  "sections": sections[hidden != true]{
    _key,
    _type,
    tone,
    spacing,
    anchorId,
    _type == "section.hero" => {
      heading, subheading, variant,
      ctas[]{ _key, ${ctaFields} },
      image{ ${imageFields} },
      trustItems[]{ _key, icon, text }
    },
    _type == "section.textImage" => {
      heading, imagePosition, body[]${richTextBlock}, image{ ${imageFields} }, cta{ ${ctaFields} }
    },
    _type == "section.richTextBlock" => { heading, width, body[]${richTextBlock} },
    _type == "section.tiles" => {
      heading, intro, source, allowMultiple, density, layout,
      items[]{
        _key, title, teaser, icon, slug,
        image{ ${imageFields} },
        body[]${richTextSimpleBlock},
        cta{ ${ctaFields} }
      },
      "services": select(source == "services" => *[
        _type == "service" && language == $locale
        && (!defined(^.serviceCategory) || category._ref == ^.serviceCategory._ref)
      ] | order(orderRank){ ${serviceSummaryFields} })
    },
    _type == "section.processSteps" => {
      heading, intro, layout, steps[]{ _key, title, text, icon }, cta{ ${ctaFields} }
    },
    _type == "section.faq" => {
      heading, intro, emitSchema, layout,
      "items": select(
        source == "selected" => items[]->{ ${faqItemFields} },
        source == "category" => *[_type == "faqItem" && category == ^.category]
          | order(orderRank){ ${faqItemFields} },
        *[_type == "faqItem"] | order(orderRank){ ${faqItemFields} }
      )
    },
    _type == "section.blogTeaser" => {
      heading, count, layout,
      "articles": select(
        mode == "selected" => articles[]->{ ${articleSummaryFields} },
        *[_type == "article" && language == $locale] | order(publishedAt desc)[0...6]
          { ${articleSummaryFields} }
      )
    },
    _type == "section.testimonials" => {
      heading, showRating,
      "items": select(
        count(items) > 0 => items[]->{ ${testimonialFields} },
        *[_type == "testimonial" && featured == true] | order(date desc){ ${testimonialFields} }
      )
    },
    _type == "section.team" => {
      heading, intro, layout,
      "members": select(
        count(members) > 0 => members[]->{ ${teamMemberFields} },
        *[_type == "teamMember"] | order(orderRank){ ${teamMemberFields} }
      )
    },
    _type == "section.gallery" => {
      heading, showLinkToGallery, limit,
      "items": select(
        count(items) > 0 => items[
          @->showsPatient != true || @->consentOnFile == true
        ]->{ ${galleryItemFields} },
        *[_type == "galleryItem" && ${galleryConsentFilter} && (!defined(^.album) || album == ^.album)]
          | order(orderRank)[0...24]{ ${galleryItemFields} }
      )
    },
    _type == "section.contactHours" => { heading, showMap, showForm, note },
    _type == "section.ctaBand" => { heading, text, ctas[]{ _key, ${ctaFields} } }
  }
`
