import { defineQuery } from 'next-sanity'

import {
  articleSummaryFields,
  faqItemFields,
  richTextBlock,
  routeFields,
  sectionsField,
  seoFields,
  serviceSummaryFields,
  teamMemberFields,
  translationsField,
} from '../fragments'

const pageFields = /* groq */ `
  _id,
  pageKey,
  title,
  "slug": slug.current,
  intro,
  seo{ ${seoFields} },
  hideFromNav,
  hideFromSitemap,
  ${sectionsField},
  ${translationsField}
`

export const pageByKeyQuery = defineQuery(
  `*[_type == "page" && language == $locale && pageKey == $key][0]{ ${pageFields} }`,
)

export const pageBySlugQuery = defineQuery(
  `*[_type == "page" && language == $locale && !defined(pageKey) && slug.current == $slug][0]{
    ${pageFields}
  }`,
)

export const servicesQuery = defineQuery(
  `*[_type == "service" && language == $locale && ($category == null || category._ref == $category)]
    | order(orderRank){ ${serviceSummaryFields} }`,
)

export const serviceBySlugQuery = defineQuery(
  `*[_type == "service" && language == $locale && hasDetailPage == true && slug.current == $slug][0]{
    ${serviceSummaryFields},
    body[]${richTextBlock},
    faq[]->{ ${faqItemFields} },
    doctors[]->{ ${teamMemberFields} },
    seo{ ${seoFields} },
    ${translationsField}
  }`,
)

export const articlesQuery = defineQuery(`{
  "items": *[_type == "article" && language == $locale] | order(publishedAt desc)[$start...$end]{
    ${articleSummaryFields}
  },
  "total": count(*[_type == "article" && language == $locale])
}`)

export const articleBySlugQuery = defineQuery(
  `*[_type == "article" && language == $locale && slug.current == $slug][0]{
    ${articleSummaryFields},
    body[]${richTextBlock},
    "wordCount": length(string::split(pt::text(body), " ")),
    author->{ ${teamMemberFields} },
    reviewedBy->{ ${teamMemberFields} },
    related[]->{ ${articleSummaryFields} },
    "latest": *[_type == "article" && language == $locale && _id != ^._id]
      | order(publishedAt desc)[0...3]{ ${articleSummaryFields} },
    seo{ ${seoFields} },
    ${translationsField}
  }`,
)

export const legalPageQuery = defineQuery(
  `*[_type == "legalPage" && language == $locale && slug.current == $slug][0]{
    _id, kind, title, "slug": slug.current, body[]${richTextBlock}, lastUpdated,
    ${translationsField}
  }`,
)

export const translationsQuery = defineQuery(`*[_id == $id][0]{
  _type, language, "slug": slug.current, pageKey, hasDetailPage, ${translationsField}
}`)

/** Routable documents with a URL of their own (for `generateStaticParams`). */
export const staticSlugsQuery = defineQuery(`*[
  _type == $type && defined(slug.current) && defined(language)
  && ($type != "page" || !defined(pageKey))
  && ($type != "service" || hasDetailPage == true)
]{ "slug": slug.current, language }`)

/**
 * Every published, indexable URL: system pages, generic pages, services with a detail page,
 * articles and legal pages (`noIndex` and `hideFromSitemap` excluded).
 */
export const sitemapQuery = defineQuery(`*[
  _type in ["page", "service", "article", "legalPage"] && defined(language)
  && seo.noIndex != true && hideFromSitemap != true
  && (_type != "service" || hasDetailPage == true)
  && (defined(pageKey) || defined(slug.current))
]{ ${routeFields}, language, _updatedAt, ${translationsField} }`)
