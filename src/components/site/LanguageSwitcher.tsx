'use client'

import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import { localeMeta, locales } from '@/config/i18n'
import { Link, usePathname } from '@/i18n/navigation'
import type { Href, PageTranslations } from '@/lib/i18n/translations'
import { cn } from '@/lib/utils'

import { usePageTranslations } from './PageTranslations'

export type LanguageSwitcherProps = {
  /** CMS pages: the published translations. Omit on static routes (every locale exists). */
  translations?: PageTranslations
  /** Where a locale without a translation goes, e.g. the services index. */
  fallback?: Href
  className?: string
}

export function LanguageSwitcher({
  translations,
  fallback = '/',
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations('LanguageSwitcher')
  const currentLocale = useLocale()
  const pathname = usePathname()
  const params = useParams()
  const page = usePageTranslations()
  const pageTranslations = translations ?? page?.translations
  const pageFallback = translations ? fallback : (page?.fallback ?? fallback)
  const route = currentRoute(pathname, params)
  const cmsParent = cmsParents[pathname]

  return (
    <nav aria-label={t('label')} className={className}>
      <ul className="flex items-center gap-1">
        {locales.map((locale) => {
          const isCurrent = locale === currentLocale
          let translated: Href | undefined
          if (pageTranslations) translated = pageTranslations[locale]
          // CMS slugs differ per locale; until the page's translations arrive (hydration), link
          // other locales to the parent page rather than to a slug that may not exist there.
          else if (cmsParent && !isCurrent) translated = cmsParent
          else translated = route
          return (
            <li key={locale}>
              <Link
                href={translated ?? pageFallback}
                locale={locale}
                hrefLang={localeMeta[locale].hreflang}
                lang={localeMeta[locale].hreflang}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-button px-3 text-step--1 font-semibold underline-offset-4 hover:underline',
                  isCurrent ? 'text-fg' : 'text-fg-muted',
                )}
              >
                {localeMeta[locale].label}
                {translated === undefined ? (
                  <span className="sr-only" lang={localeMeta[currentLocale].hreflang}>
                    {t('missingTranslation')}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

const cmsParents: Partial<Record<string, Href>> = {
  '/[slug]': '/',
  '/services/[slug]': '/services',
  '/blog/[slug]': '/blog',
  '/blog/page/[n]': '/blog',
  '/legal/[slug]': '/',
}

const DYNAMIC_SEGMENT = /\[([^\]]+)\]/g

/**
 * On static routes the internal pathname + current params describe the page in every locale.
 * Unknown URLs (404) can match a dynamic pattern like `/[slug]` without its param; those return
 * `undefined`, so the link goes to the fallback.
 */
function currentRoute(pathname: string, params: ReturnType<typeof useParams>): Href | undefined {
  const names = Array.from(pathname.matchAll(DYNAMIC_SEGMENT), (match) => match[1])
  if (names.some((name) => name === undefined || params[name] === undefined)) return undefined
  // @ts-expect-error -- `pathname` and `params` come from the same matched route, so they always
  // fit together; next-intl can only check that pairing for literal pathnames.
  return { pathname, params }
}
