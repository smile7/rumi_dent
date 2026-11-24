import { defaultLocale } from '../../config/i18n'

/** One row of an internationalized-array field (plugin v5 shape). */
export type I18nRow<T = unknown> = { _key: string; language?: string; value?: T }

export type ValidationResult =
  true | string | { message: string; path: (string | { _key: string })[] }[]

const isFilled = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null
}

/** The row for `language` (default: the site's default locale), if it has content. */
export const i18nValue = <T>(
  rows: I18nRow<T>[] | undefined,
  language: string = defaultLocale,
): T | undefined => rows?.find((row) => row.language === language && isFilled(row.value))?.value

type I18nRules = {
  /** Require the default-language row. Pass the editor-facing message. */
  required?: string
  /** Max characters per language row (strings and text only). */
  max?: number
}

/**
 * Validates an `internationalizedArray*` field: the default language must be filled when required,
 * and every filled row must respect `max`. Messages point at the offending row.
 */
export const validateI18n =
  ({ required, max }: I18nRules) =>
  (rows: I18nRow[] | undefined): ValidationResult => {
    if (required && i18nValue(rows) === undefined) return required
    if (max === undefined || !rows) return true
    const tooLong = rows.filter((row) => typeof row.value === 'string' && row.value.length > max)
    if (tooLong.length === 0) return true
    return tooLong.map((row) => ({
      message: `Keep it under ${max} characters (now ${(row.value as string).length}).`,
      path: [{ _key: row._key }, 'value'],
    }))
  }

/** E.164: `+`, country code, up to 15 digits, no spaces (`+359888123456`). */
export const E164 = /^\+[1-9]\d{6,14}$/

/** 24-hour `HH:mm`. */
export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

/** Lowercase Latin words joined by single hyphens (`first-visit`). */
export const SLUG_LIKE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** IANA time zone known to the runtime (`Europe/Sofia`). */
export const isTimeZone = (value: string): boolean => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value })
    return true
  } catch {
    return false
  }
}

/** Minutes since midnight. A closing time of `00:00` means midnight at the end of the day. */
export const toMinutes = (time: string, { closing = false } = {}): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const total = hours * 60 + minutes
  return closing && total === 0 ? 24 * 60 : total
}

export const closesAfterOpens = (opens: string | undefined, closes: string | undefined): boolean =>
  !opens ||
  !closes ||
  !TIME.test(opens) ||
  !TIME.test(closes) ||
  toMinutes(closes, { closing: true }) > toMinutes(opens)

/** Array items whose picked value already appeared earlier in the array (empty values skipped). */
export const duplicateKeys = <T extends { _key: string }>(
  items: T[],
  pick: (item: T) => string | undefined,
): { _key: string; value: string }[] => {
  const seen = new Set<string>()
  const duplicates: { _key: string; value: string }[] = []
  for (const item of items) {
    const value = pick(item)
    if (!value) continue
    if (seen.has(value)) duplicates.push({ _key: item._key, value })
    seen.add(value)
  }
  return duplicates
}

type SectionItem = { _key: string; _type: string; anchorId?: string; emitSchema?: boolean }

/**
 * Page-builder rules across sections: one hero, and only as the first section; one FAQ section
 * with structured data; unique anchor IDs. Messages point at the offending section.
 */
export const sectionProblems = (
  sections: SectionItem[] | undefined,
  { requireOne = false } = {},
): ValidationResult => {
  if (!sections?.length) return requireOne ? 'Add at least one section.' : true
  const problems: { message: string; path: (string | { _key: string })[] }[] = []
  sections.forEach((section, index) => {
    if (section._type === 'section.hero' && index > 0) {
      problems.push({
        message: 'The hero must be the first section, and a page can have only one.',
        path: [{ _key: section._key }],
      })
    }
  })
  const faqWithSchema = sections.filter(
    (section) => section._type === 'section.faq' && section.emitSchema !== false,
  )
  for (const section of faqWithSchema.slice(1)) {
    problems.push({
      message:
        'Only one FAQ section per page can be marked for Google. Untick "Mark as FAQ for Google" here.',
      path: [{ _key: section._key }, 'emitSchema'],
    })
  }
  for (const { _key, value } of duplicateKeys(sections, (section) => section.anchorId)) {
    problems.push({
      message: `The anchor ID "${value}" is already used by another section.`,
      path: [{ _key }, 'anchorId'],
    })
  }
  return problems.length ? problems : true
}

type PortableTextBlock = {
  _type: string
  _key: string
  style?: string
  children?: { _type: string; text?: string }[]
}

const PLACEHOLDER = /\[\[[^\]]*\]\]/g

/** Template placeholders like `[[company name]]` left in Portable Text, without duplicates. */
export const placeholdersIn = (blocks: PortableTextBlock[] | undefined): string[] => {
  const found = new Set<string>()
  for (const block of blocks ?? []) {
    for (const child of block.children ?? []) {
      for (const match of child.text?.match(PLACEHOLDER) ?? []) found.add(match)
    }
  }
  return [...found]
}

const HEADING_LEVEL: Record<string, number> = { h2: 2, h3: 3, h4: 4 }

/**
 * Headings must not skip levels (h2 → h4) and must start at h2 (the page title is the h1).
 * Returns the keys of the offending blocks.
 */
export const headingsSkippingLevels = (blocks: PortableTextBlock[] | undefined): string[] => {
  let previous = 1
  const offenders: string[] = []
  for (const block of blocks ?? []) {
    const level = block._type === 'block' && block.style ? HEADING_LEVEL[block.style] : undefined
    if (level === undefined) continue
    if (level > previous + 1) offenders.push(block._key)
    previous = level
  }
  return offenders
}
