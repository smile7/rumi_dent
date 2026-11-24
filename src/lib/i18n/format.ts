import { localeMeta, type Locale } from '@/config/i18n'
import { formats } from '@/i18n/formats'

/** Day codes as stored in Sanity `openingHoursSpec.days` (schema.org style), Monday first. */
export const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const
export type Weekday = (typeof weekdays)[number]

const EN_DASH = '\u2013'
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * `2026-11-19` → "19 ноември 2026 г." / "19 November 2026".
 * Date-only strings are calendar days and never shift; pass the site time zone for timestamps.
 */
export function formatDate(locale: Locale, value: string | Date, timeZone = 'UTC'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) throw new RangeError(`formatDate: invalid date "${value}"`)
  const zone = typeof value === 'string' && DATE_ONLY.test(value) ? 'UTC' : timeZone
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    ...formats.date,
    timeZone: zone,
  }).format(date)
}

/**
 * `09:00` + `18:00` → "09:00–18:00" (24 h, en dash, same in every locale).
 * A closing time of `00:00` means midnight at the end of the day and renders as "24:00".
 */
export function formatTimeRange(opens: string, closes: string): string {
  for (const time of [opens, closes]) {
    if (!TIME.test(time)) throw new RangeError(`formatTimeRange: expected HH:mm, got "${time}"`)
  }
  return `${opens}${EN_DASH}${closes === '00:00' ? '24:00' : closes}`
}

/** `['Mo','Tu','Th']` → "пн–вт, чт" / "Mon–Tue, Thu". Consecutive days collapse into a range. */
export function formatWeekdayRange(locale: Locale, days: readonly Weekday[]): string {
  const sorted = weekdays.filter((day) => days.includes(day))
  const runs: Weekday[][] = []
  for (const day of sorted) {
    const run = runs.at(-1)
    const previous = run?.at(-1)
    if (run && previous && weekdays.indexOf(day) === weekdays.indexOf(previous) + 1) run.push(day)
    else runs.push([day])
  }
  return runs
    .map((run) => {
      const first = weekdayName(locale, run[0]!)
      return run.length === 1 ? first : `${first}${EN_DASH}${weekdayName(locale, run.at(-1)!)}`
    })
    .join(', ')
}

/** Days not listed in any opening-hours entry are closed (CONTENT-MODEL `openingHoursSpec`). */
export function closedDays(hours: readonly { days: readonly Weekday[] }[]): Weekday[] {
  const open = new Set(hours.flatMap((entry) => entry.days))
  return weekdays.filter((day) => !open.has(day))
}

export type FormattedPhone = { display: string; href: string }

/**
 * E.164 → readable display + `tel:` href. Bulgarian numbers are grouped by type
 * (mobile `+359 88 123 4567`, Sofia `+359 2 123 4567`, other landlines `+359 82 841 190`);
 * other countries keep the E.164 form.
 */
export function formatPhone(e164: string): FormattedPhone {
  const compact = e164.replace(/[\s()-]/g, '')
  if (!/^\+[1-9]\d{6,14}$/.test(compact)) throw new RangeError(`formatPhone: not E.164: "${e164}"`)
  return { display: displayPhone(compact), href: `tel:${compact}` }
}

/** `25` → "25,00 €" / "€25.00". */
export function formatPrice(
  locale: Locale,
  amount: number,
  currency: string = formats.price.currency,
): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, { ...formats.price, currency }).format(
    amount,
  )
}

function weekdayName(locale: Locale, day: Weekday): string {
  // 2024-01-01 was a Monday; build the day from it in UTC so the time zone can't shift it.
  const date = new Date(Date.UTC(2024, 0, 1 + weekdays.indexOf(day)))
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    ...formats.weekdayShort,
    timeZone: 'UTC',
  }).format(date)
}

function displayPhone(compact: string): string {
  if (!compact.startsWith('+359')) return compact
  const national = compact.slice(4)
  const groups =
    national.length === 9 && /^[89]/.test(national)
      ? [2, 3, 4]
      : national.length === 8 && national.startsWith('2')
        ? [1, 3, 4]
        : national.length === 8
          ? [2, 3, 3]
          : null
  if (!groups) return `+359 ${national}`
  let rest = national
  const parts = groups.map((size) => {
    const part = rest.slice(0, size)
    rest = rest.slice(size)
    return part
  })
  return `+359 ${parts.join(' ')}`
}
