import type { BlogPosting } from 'schema-dts'

import { localeMeta } from '@/config/i18n'
import { ogImageUrl } from '@/lib/content/image-loader'
import type { Article } from '@/lib/content/types'

import { ids, type JsonLdContext } from './ids'

export function blogPosting(ctx: JsonLdContext, url: string, article: Article): BlogPosting {
  const organizationId = { '@id': ids.organization(ctx.siteUrl) }
  return {
    '@type': 'BlogPosting',
    '@id': ids.article(url),
    headline: article.title,
    description: article.excerpt,
    image: article.cover ? ogImageUrl(article.cover) : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: article.author ? { '@id': ids.person(ctx.siteUrl, article.author.id) } : organizationId,
    publisher: organizationId,
    inLanguage: localeMeta[ctx.locale].hreflang,
    mainEntityOfPage: { '@id': ids.webPage(url) },
  }
}
