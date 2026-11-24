import { defineField } from 'sanity'

import { defaultLocale, localeMeta, locales } from '../config/i18n'

/** Studio language list for both i18n plugins, derived from `src/config/i18n.ts` (ARCHITECTURE §7.1). */
export const studioLanguages = locales.map((id) => ({ id, title: localeMeta[id].label }))

export const defaultLanguage = defaultLocale

/** Document-level i18n (ADR-001): one document per language, linked by `translation.metadata`. */
export const routableTypes = ['page', 'service', 'article', 'legalPage'] as const

export type RoutableType = (typeof routableTypes)[number]

export const isRoutableType = (type: string): type is RoutableType =>
  (routableTypes as readonly string[]).includes(type)

/** Set by `@sanity/document-internationalization`; editors never change it. */
export const languageField = defineField({
  name: 'language',
  title: 'Language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
