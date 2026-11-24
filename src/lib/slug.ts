import { locales } from '../config/i18n'
import { pathnames } from '../i18n/pathnames'

// Relative imports: the Sanity CLI (schema extract, typegen) loads this file through the Studio config.

/** Bulgarian → Latin, the official streamlined system (Transliteration Act, 2009). */
const BG_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
}

export const SLUG_MAX_LENGTH = 96

/** "Детска стоматология" → "detska-stomatologiya"; "Café & Co." → "cafe-co". */
export function slugify(input: string): string {
  const latin = Array.from(input.toLowerCase(), (char) => BG_TO_LATIN[char] ?? char).join('')
  return latin
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, '')
}

const firstSegment = (path: string) => path.split('/')[1] ?? ''

/**
 * Top-level URL segments a CMS slug must not take: every system route in every locale (from the
 * pathnames config), the locale prefixes and the non-localized app routes.
 */
export const reservedSlugs: ReadonlySet<string> = new Set(
  [
    ...Object.entries(pathnames).flatMap(([internal, localized]) => [
      internal,
      ...(typeof localized === 'string' ? [localized] : Object.values(localized)),
    ]),
  ]
    .map(firstSegment)
    .filter((segment) => segment && !segment.startsWith('['))
    .concat(locales, ['admin', 'api', 'styleguide']),
)
