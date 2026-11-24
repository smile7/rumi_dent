import type {
  Article,
  InternationalizedArrayRichTextSimple,
  InternationalizedArrayString,
  InternationalizedArrayText,
  LegalPage,
  Page,
  RichText,
  RichTextSimple,
  Service,
  TranslationMetadata,
} from '../../sanity.types'
import { type Locale, locales } from '../../src/config/i18n'

/** A value per site language. Adding a locale makes TypeScript point at every missing text. */
export type Localized<T = string> = Record<Locale, T>

/** Uploaded image asset ids by file name in `seed/images/` (without extension). */
export type SeedImages = Readonly<Record<string, string>>

/** Document as written by the seed: Sanity adds the system fields. */
export type SeedDoc<T> = Omit<T, '_createdAt' | '_updatedAt' | '_rev'>

/**
 * Dash-separated on purpose: Sanity treats ids containing `.` as private paths, so tokenless
 * (published, CDN) reads, which is how the site builds, would not see dotted seed documents.
 */
export const seedPrefix = 'seed-'

const localizedRows = <T, K extends string>(type: K, values: Localized<T>) =>
  locales.map((language) => ({
    _key: language,
    _type: type,
    language,
    value: values[language],
  }))

export const i18nString = (values: Localized): InternationalizedArrayString =>
  localizedRows('internationalizedArrayStringValue', values)

export const i18nText = (values: Localized): InternationalizedArrayText =>
  localizedRows('internationalizedArrayTextValue', values)

export const i18nRichTextSimple = (
  values: Localized<RichTextSimple>,
): InternationalizedArrayRichTextSimple =>
  localizedRows('internationalizedArrayRichTextSimpleValue', values)

/** Gives every array item a deterministic `_key` (its index), so re-seeding is idempotent. */
export const keyed = <T extends object>(items: T[], prefix = 'k'): (T & { _key: string })[] =>
  items.map((item, index) => ({ ...item, _key: `${prefix}${index}` }))

type Block = Extract<RichText[number], { _type: 'block' }>
type BlockStyle = NonNullable<Block['style']>

const block = (text: string, style: BlockStyle = 'normal', listItem?: 'bullet' | 'number') => ({
  _type: 'block' as const,
  style,
  markDefs: [],
  children: [{ _type: 'span' as const, _key: 's0', text, marks: [] }],
  ...(listItem ? { listItem, level: 1 } : {}),
})

/**
 * Plain text → Portable Text. `## Heading` lines become h2, `### ` h3, `- item` bullets,
 * `{{cookieTable}}` / `{{processorsList}}` the generated legal blocks, anything else a paragraph.
 */
export const richText = (...lines: string[]): RichText =>
  keyed(
    lines.map((line) => {
      if (line === '{{cookieTable}}') return { _type: 'cookieTable' as const }
      if (line === '{{processorsList}}') return { _type: 'processorsList' as const }
      if (line.startsWith('### ')) return block(line.slice(4), 'h3')
      if (line.startsWith('## ')) return block(line.slice(3), 'h2')
      if (line.startsWith('- ')) return block(line.slice(2), 'normal', 'bullet')
      return block(line)
    }),
    'b',
  )

/** Paragraphs and bullets only (the `richTextSimple` type has no headings). */
export const simpleText = (...lines: string[]): RichTextSimple =>
  keyed(
    lines.map((line) =>
      line.startsWith('- ')
        ? { ...block(line.slice(2), 'normal', 'bullet'), style: 'normal' as const }
        : { ...block(line), style: 'normal' as const },
    ),
    'b',
  )

export const ref = (id: string, options: { weak?: boolean } = {}) => ({
  _type: 'reference' as const,
  _ref: id,
  ...(options.weak ? { _weak: true } : {}),
})

export const refs = (ids: string[], prefix = 'r') =>
  keyed(
    ids.map((id) => ref(id)),
    prefix,
  )

export const slugOf = (current: string) => ({ _type: 'slug' as const, current })

/** An `imageWithAlt` pointing at an uploaded seed image. */
export const image = (images: SeedImages, name: string, alt: Localized) => {
  const assetId = images[name]
  if (!assetId) throw new Error(`Seed image "${name}" was not uploaded (missing in seed/images/?)`)
  return {
    _type: 'imageWithAlt' as const,
    asset: { _type: 'reference' as const, _ref: assetId },
    alt: i18nString(alt),
  }
}

type RoutableDoc = Article | LegalPage | Page | Service

/** `seed-page-home-bg`: one document per routable item and language (CONTENT-MODEL §8). */
export const routableId = (type: RoutableDoc['_type'], key: string, locale: Locale) =>
  `${seedPrefix}${type}-${key}-${locale}`

/**
 * One document per language plus the `translation.metadata` document that links them, in the
 * shape the document-internationalization plugin writes (ARCHITECTURE §7.3).
 */
export const routable = <T extends RoutableDoc>(
  type: T['_type'],
  key: string,
  fields: (locale: Locale) => Omit<SeedDoc<T>, '_id' | '_type' | 'language'>,
): (SeedDoc<T> | SeedDoc<TranslationMetadata>)[] => [
  ...locales.map(
    (locale) =>
      ({
        _id: routableId(type, key, locale),
        _type: type,
        language: locale,
        ...fields(locale),
      }) as SeedDoc<T>,
  ),
  {
    _id: `${seedPrefix}meta-${type}-${key}`,
    _type: 'translation.metadata',
    schemaTypes: [type],
    translations: locales.map((language) => ({
      _key: language,
      _type: 'internationalizedArrayReferenceValue' as const,
      language,
      value: ref(routableId(type, key, language), { weak: true }),
    })),
  },
]

/** Orderable-list rank in the plugin's LexoRank format, spaced so editors can insert between. */
export const rank = (index: number) => `0|${String((index + 1) * 1000).padStart(6, '0')}:`
