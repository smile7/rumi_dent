import { defaultLocale, type Locale } from '@/config/i18n'
import type { SiteSettings } from '@/lib/content/types'
import { getPathname } from '@/i18n/navigation'
import type { Href } from '@/lib/i18n/translations'

/** What every builder needs. `siteUrl` has no trailing slash. */
export type JsonLdContext = { siteUrl: string; locale: Locale; settings: SiteSettings }

export const absoluteUrl = (ctx: Pick<JsonLdContext, 'siteUrl'>, locale: Locale, href: Href) =>
  `${ctx.siteUrl}${getPathname({ locale, href })}`

/** Stable `@id`s: site-wide nodes hang off the site root, page nodes off the page URL. */
export const ids = {
  organization: (siteUrl: string) => `${siteUrl}/#organization`,
  website: (siteUrl: string) => `${siteUrl}/#website`,
  person: (siteUrl: string, memberId: string) => `${siteUrl}/#person-${memberId}`,
  webPage: (url: string) => `${url}#webpage`,
  breadcrumb: (url: string) => `${url}#breadcrumb`,
  faq: (url: string) => `${url}#faq`,
  article: (url: string) => `${url}#article`,
  service: (url: string) => `${url}#service`,
}

export const homeUrl = (ctx: Pick<JsonLdContext, 'siteUrl'>) => absoluteUrl(ctx, defaultLocale, '/')
