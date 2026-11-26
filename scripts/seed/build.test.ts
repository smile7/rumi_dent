import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { locales, type Locale } from '../../src/config/i18n'
import { assertLegalPagePublishable } from '../../src/lib/content/legal'
import type { LegalPageQueryRow } from '../../src/lib/content/sanity/query-types'
import { mapLegalPage } from '../../src/lib/content/sanity/mappers/documents'
import { reservedSlugs } from '../../src/lib/slug'
import { SLUG_LIKE, placeholdersIn, sectionProblems } from '../../src/sanity/lib/validation'
import { buildSeed, type SeedDocument } from './build'

const imageNames = readdirSync(resolve(__dirname, '../../seed/images'))
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .map((file) => file.replace(/\.(jpe?g|png|webp)$/i, ''))
const images = Object.fromEntries(imageNames.map((name) => [name, `image-${name}-asset`]))

const demo = buildSeed('demo', images)
const client = buildSeed('client', {})

type Reference = { _ref: string; _weak?: boolean }

/** Every `{ _ref }` in a document, at any depth. */
const referencesIn = (value: unknown): Reference[] => {
  if (Array.isArray(value)) return value.flatMap(referencesIn)
  if (!value || typeof value !== 'object') return []
  const own = '_ref' in value && typeof value._ref === 'string' ? [value as Reference] : []
  return [...own, ...Object.values(value).flatMap(referencesIn)]
}

/** Documents keep their fields in `attributes`, object types in `value.attributes`. */
type SchemaEntry = {
  name: string
  attributes?: Record<string, unknown>
  value?: { attributes?: Record<string, unknown> }
}
const schema = JSON.parse(
  readFileSync(resolve(__dirname, '../../schema.json'), 'utf8'),
) as SchemaEntry[]
const fieldsByType = new Map(
  schema.flatMap((entry) => {
    const attributes = entry.attributes ?? entry.value?.attributes
    return attributes ? [[entry.name, new Set(Object.keys(attributes))] as const] : []
  }),
)

/** `path: key` for every key the extracted schema doesn't define, at any depth. */
const unknownFields = (value: unknown, path = ''): string[] => {
  if (Array.isArray(value)) return value.flatMap((item, i) => unknownFields(item, `${path}[${i}]`))
  if (!value || typeof value !== 'object') return []
  const fields =
    '_type' in value && typeof value._type === 'string' ? fieldsByType.get(value._type) : undefined
  return Object.entries(value).flatMap(([key, child]) => [
    ...(fields && key !== '_key' && !fields.has(key) ? [`${path}.${key}`] : []),
    ...unknownFields(child, `${path}.${key}`),
  ])
}

const publishedId = (id: string) => id.replace(/^drafts\./, '')
const routable = (docs: SeedDocument[]) =>
  docs.filter((doc) =>
    ['page', 'service', 'article', 'legalPage'].includes(doc._type),
  ) as (SeedDocument & {
    language: string
    slug?: { current?: string }
    sections?: Parameters<typeof sectionProblems>[0]
    pageKey?: string
    body?: Parameters<typeof placeholdersIn>[0]
  })[]

describe.each([
  ['demo', demo],
  ['client', client],
] as const)('%s seed', (_mode, docs) => {
  const ids = new Set(docs.map((doc) => publishedId(doc._id)))

  it('uses unique, prefixed ids (singletons keep their fixed id)', () => {
    expect(ids.size).toBe(docs.length)
    for (const id of ids)
      expect(
        (id.startsWith('seed-') && !id.includes('.')) ||
          ['siteSettings', 'navigation'].includes(id),
      ).toBe(true)
  })

  it('only writes fields the schema defines (catches renamed or removed fields)', () => {
    expect(docs.flatMap((doc) => unknownFields(doc, doc._id))).toEqual([])
  })

  it('is deterministic', () => {
    expect(buildSeed(_mode, _mode === 'demo' ? images : {})).toEqual(docs)
  })

  it('only references documents it creates; only weak references may point at drafts', () => {
    for (const doc of docs) {
      for (const reference of referencesIn(doc)) {
        if (reference._ref.startsWith('image-')) continue
        expect(ids, `${doc._id} → ${reference._ref}`).toContain(reference._ref)
        const target = docs.find((other) => publishedId(other._id) === reference._ref)
        if (target?._id.startsWith('drafts.')) expect(reference._weak).toBe(true)
      }
    }
  })

  it('links every routable document to its translations in every locale', () => {
    const metadata = docs.filter((doc) => doc._type === 'translation.metadata')
    for (const doc of routable(docs)) {
      const meta = metadata.find((m) =>
        referencesIn(m).some((reference) => reference._ref === publishedId(doc._id)),
      )
      expect(meta, doc._id).toBeDefined()
      expect(referencesIn(meta).length).toBe(locales.length)
    }
  })

  it('gives routable documents valid slugs, unique per type and language', () => {
    const seen = new Set<string>()
    for (const doc of routable(docs)) {
      if (doc._type === 'page' && doc.pageKey) continue
      const slug = doc.slug?.current ?? ''
      expect(slug, doc._id).toMatch(SLUG_LIKE)
      expect(reservedSlugs.has(slug), slug).toBe(false)
      const scoped = `${doc._type}:${doc.language}:${slug}`
      expect(seen.has(scoped), scoped).toBe(false)
      seen.add(scoped)
    }
  })

  it('respects the page-builder rules', () => {
    for (const doc of routable(docs).filter((d) => d._type === 'page')) {
      expect(sectionProblems(doc.sections, { requireOne: !doc.pageKey }), doc._id).toBe(true)
    }
  })
})

describe('demo seed', () => {
  it('uses every image in seed/images', () => {
    const used = new Set(referencesIn(demo).map((reference) => reference._ref))
    expect(imageNames.filter((name) => !used.has(images[name]!))).toEqual([])
  })

  it('fills every legal placeholder and publishes everything', () => {
    for (const doc of routable(demo).filter((d) => d._type === 'legalPage')) {
      expect(placeholdersIn(doc.body), doc._id).toEqual([])
    }
    expect(demo.filter((doc) => doc._id.startsWith('drafts.'))).toEqual([])
  })
})

describe('client seed', () => {
  it('creates drafts only (metadata stays published) and keeps the legal placeholders', () => {
    for (const doc of client) {
      expect(doc._id.startsWith('drafts.'), doc._id).toBe(doc._type !== 'translation.metadata')
    }
    for (const doc of routable(client).filter((d) => d._type === 'legalPage')) {
      expect(placeholdersIn(doc.body).length, doc._id).toBeGreaterThan(0)
    }
  })

  it('fails the production legal guard until the placeholders are replaced', () => {
    for (const doc of routable(client).filter((d) => d._type === 'legalPage')) {
      const slug = doc.slug as { current: string }
      const row = { ...doc, slug: slug.current, translations: null } as unknown as LegalPageQueryRow
      const page = mapLegalPage(row, doc.language as Locale)
      expect(page?.placeholders.length, doc._id).toBeGreaterThan(0)
      expect(() => assertLegalPagePublishable(page!, 'production'), doc._id).toThrow(/placeholders/)
      expect(assertLegalPagePublishable(page!, 'preview')).toBe(page)
    }
  })

  it('creates one page per system page and language', () => {
    expect(routable(client).filter((doc) => doc._type === 'page')).toHaveLength(6 * locales.length)
  })
})
