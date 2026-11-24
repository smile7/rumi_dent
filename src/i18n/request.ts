import * as rootParams from 'next/root-params'
import { hasLocale, type Messages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import type { Locale } from '@/config/i18n'

import { routing } from './routing'

/** One loader per locale, so a missing `messages/<locale>.json` is a type error. */
const messageLoaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  bg: () => import('../../messages/bg.json'),
  en: () => import('../../messages/en.json'),
}

// Route handlers and Server Actions can't read root params: pass `locale` explicitly there.
export default getRequestConfig(async ({ locale }) => {
  const requested = locale ?? (await rootParams.locale())
  const resolved = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale: resolved,
    messages: (await messageLoaders[resolved]()).default,
  }
})
