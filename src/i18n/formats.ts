/**
 * Shared `Intl` options for `src/lib/i18n/format.ts`. They are applied with `localeMeta[l].intl`
 * (`bg-BG`, `en-GB`), not next-intl's formatter, which would format `en` as US English.
 */
export const formats = {
  date: { day: 'numeric', month: 'long', year: 'numeric' },
  weekdayShort: { weekday: 'short' },
  price: { style: 'currency', currency: 'EUR' },
} as const satisfies {
  date: Intl.DateTimeFormatOptions
  weekdayShort: Intl.DateTimeFormatOptions
  price: Intl.NumberFormatOptions
}
