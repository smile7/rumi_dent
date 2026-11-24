import 'server-only'

import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { hasLocale } from 'next-intl'

import type { Locale } from '@/config/i18n'
import { readPublicEnv } from '@/env'
import { routing } from '@/i18n/routing'
import {
  getPageByKey,
  getSiteSettings,
  type Page,
  type SiteSettings,
  type SystemPageKey,
} from '@/lib/content'

import { composeMetadata, type MetadataInput } from './metadata'

/** Metadata for a route's `generateMetadata`. Never hand-roll metadata in pages. */
export async function buildMetadata(input: MetadataInput): Promise<Metadata> {
  const { NEXT_PUBLIC_ENV } = readPublicEnv('NEXT_PUBLIC_ENV')
  const { isEnabled } = await draftMode()
  return composeMetadata(input, { env: NEXT_PUBLIC_ENV, draftMode: isEnabled })
}

/** A page-builder page: its intro and hero image are the description and OG fallbacks. */
export function cmsPageMetadata(
  page: Page,
  locale: Locale,
  settings: SiteSettings,
  overrides: Partial<MetadataInput> = {},
): Promise<Metadata> {
  const [first] = page.sections
  return buildMetadata({
    locale,
    settings,
    translations: page.translations,
    title: page.title,
    description: page.intro,
    seo: page.seo,
    image: first?.type === 'hero' ? first.image : undefined,
    home: page.pageKey === 'home',
    ...overrides,
  })
}

/** `generateMetadata` for a system page route (home, services, about, …). */
export async function systemPageMetadata(key: SystemPageKey, locale: string): Promise<Metadata> {
  if (!hasLocale(routing.locales, locale)) return {}
  const [page, settings] = await Promise.all([getPageByKey(key, locale), getSiteSettings(locale)])
  if (!page || !settings) return {}
  return cmsPageMetadata(page, locale, settings)
}
