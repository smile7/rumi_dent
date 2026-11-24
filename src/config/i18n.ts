/**
 * The single source of truth for site languages (ARCHITECTURE §7.1).
 * Adding a language: add it to `locales` + `localeMeta`, then follow the TypeScript errors.
 */
export const locales = ['bg', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'bg'

export type LocaleMeta = {
  /** Native name, shown in the language switcher. */
  label: string
  short: string
  /** BCP 47 tag for `hreflang` alternates. */
  hreflang: string
  ogLocale: string
  /** Tag for `Intl.*` formatting. */
  intl: string
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  bg: { label: 'Български', short: 'BG', hreflang: 'bg', ogLocale: 'bg_BG', intl: 'bg-BG' },
  en: { label: 'English', short: 'EN', hreflang: 'en', ogLocale: 'en_GB', intl: 'en-GB' },
}
