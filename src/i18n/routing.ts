import { defineRouting } from 'next-intl/routing'

import { defaultLocale, locales } from '@/config/i18n'

import { pathnames } from './pathnames'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Only affects `/` and unprefixed paths. Sets the NEXT_LOCALE cookie (strictly necessary).
  localeDetection: true,
  // hreflang alternates come from page metadata, which knows when a CMS translation is missing.
  alternateLinks: false,
  pathnames,
})
