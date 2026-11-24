import type { Locale } from '@/config/i18n'
import type { Address, OpeningHours } from '@/lib/content'
import { closedDays, formatTimeRange, formatWeekdayRange } from '@/lib/i18n/format'

/** `{ street, postalCode, city }` → `['ул. „Борисова“ 12', '7000 Русе']`. Empty parts are skipped. */
export function addressLines(address: Address): string[] {
  const place = [address.postalCode, address.city].filter(Boolean).join(' ')
  return [address.street, place].filter((line): line is string => Boolean(line))
}

/** One line per opening-hours entry, then the closed days (`time: null`). */
export type HoursRow = { days: string; time: string | null; note?: string }

export function hoursRows(locale: Locale, hours: readonly OpeningHours[]): HoursRow[] {
  if (hours.length === 0) return []
  const rows: HoursRow[] = hours.map((entry) => ({
    days: formatWeekdayRange(locale, entry.days),
    time: formatTimeRange(entry.opens, entry.closes),
    ...(entry.note ? { note: entry.note } : {}),
  }))
  const closed = closedDays(hours)
  return closed.length > 0
    ? [...rows, { days: formatWeekdayRange(locale, closed), time: null }]
    : rows
}
