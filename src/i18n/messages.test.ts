import type { MessageKeys, Messages, NestedKeyOf } from 'next-intl'
import { describe, expect, it } from 'vitest'

import { defaultLocale, locales } from '@/config/i18n'
import { catalogs } from '@/test/messages'

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('messages', () => {
  const reference = keyPaths(catalogs[defaultLocale]).toSorted()

  it.each(locales)('%s has exactly the keys of the default locale', (locale) => {
    expect(keyPaths(catalogs[locale]).toSorted()).toEqual(reference)
  })

  it.each(locales)('%s has no empty strings', (locale) => {
    const empty = keyPaths(catalogs[locale]).filter((path) => {
      const value = path
        .split('.')
        .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], catalogs[locale])
      return typeof value !== 'string' || value.trim() === ''
    })
    expect(empty).toEqual([])
  })

  it('types message keys from bg.json', () => {
    const key: MessageKeys<Messages, NestedKeyOf<Messages>> = 'LanguageSwitcher.label'
    // @ts-expect-error typos in message keys are compile errors
    const typo: MessageKeys<Messages, NestedKeyOf<Messages>> = 'LanguageSwitcher.lable'
    expect([key, typo]).toHaveLength(2)
  })
})
