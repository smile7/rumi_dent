import { describe, expect, it } from 'vitest'

import {
  closedDays,
  formatDate,
  formatPhone,
  formatPrice,
  formatTimeRange,
  formatWeekdayRange,
} from './format'

const NBSP = '\u00a0'

describe('formatDate', () => {
  it('formats a calendar day per locale', () => {
    expect(formatDate('bg', '2026-11-19')).toBe('19 ноември 2026 г.')
    expect(formatDate('en', '2026-11-19')).toBe('19 November 2026')
  })

  it('never shifts a date-only value, whatever time zone is passed', () => {
    expect(formatDate('en', '2026-01-01', 'America/Los_Angeles')).toBe('1 January 2026')
  })

  it('formats a timestamp in the given time zone', () => {
    expect(formatDate('bg', '2026-11-19T23:30:00Z', 'Europe/Sofia')).toBe('20 ноември 2026 г.')
    expect(formatDate('bg', new Date('2026-11-19T23:30:00Z'))).toBe('19 ноември 2026 г.')
  })

  it('rejects an invalid date', () => {
    expect(() => formatDate('bg', 'not a date')).toThrow(RangeError)
  })
})

describe('formatTimeRange', () => {
  it('uses 24 h times and an en dash', () => {
    expect(formatTimeRange('09:00', '18:00')).toBe('09:00–18:00')
  })

  it('shows a midnight close as 24:00 and a midnight open as 00:00', () => {
    expect(formatTimeRange('18:00', '00:00')).toBe('18:00–24:00')
    expect(formatTimeRange('00:00', '06:00')).toBe('00:00–06:00')
  })

  it('rejects malformed times', () => {
    expect(() => formatTimeRange('9:00', '18:00')).toThrow(RangeError)
    expect(() => formatTimeRange('09:00', '24:00')).toThrow(RangeError)
  })
})

describe('formatWeekdayRange', () => {
  it('collapses consecutive days and keeps gaps', () => {
    expect(formatWeekdayRange('bg', ['Mo', 'Tu', 'Th'])).toBe('пн–вт, чт')
    expect(formatWeekdayRange('en', ['Mo', 'Tu', 'Th'])).toBe('Mon–Tue, Thu')
  })

  it('sorts input and handles a full week, a single day and no days', () => {
    expect(formatWeekdayRange('bg', ['Su', 'Mo', 'We', 'Tu', 'Th', 'Fr', 'Sa'])).toBe('пн–нд')
    expect(formatWeekdayRange('en', ['Fr', 'We'])).toBe('Wed, Fri')
    expect(formatWeekdayRange('en', ['Sa'])).toBe('Sat')
    expect(formatWeekdayRange('en', [])).toBe('')
  })
})

describe('closedDays', () => {
  it('returns the days not covered by any entry', () => {
    const rumi = [{ days: ['Mo', 'Tu', 'Th'] as const }, { days: ['We', 'Fr'] as const }]
    expect(closedDays(rumi)).toEqual(['Sa', 'Su'])
    expect(formatWeekdayRange('bg', closedDays(rumi))).toBe('сб–нд')
  })

  it('is every day when there are no hours, and none when all days are open', () => {
    expect(closedDays([])).toHaveLength(7)
    expect(closedDays([{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] }])).toEqual([])
  })
})

describe('formatPhone', () => {
  it('groups Bulgarian mobile, Sofia and other landline numbers', () => {
    expect(formatPhone('+359881234567')).toEqual({
      display: '+359 88 123 4567',
      href: 'tel:+359881234567',
    })
    expect(formatPhone('+35921234567').display).toBe('+359 2 123 4567')
    expect(formatPhone('+35982841190').display).toBe('+359 82 841 190')
  })

  it('strips formatting from the href and keeps foreign numbers as E.164', () => {
    expect(formatPhone('+359 88 123 4567').href).toBe('tel:+359881234567')
    expect(formatPhone('+442071234567')).toEqual({
      display: '+442071234567',
      href: 'tel:+442071234567',
    })
  })

  it('rejects numbers that are not E.164', () => {
    expect(() => formatPhone('0881234567')).toThrow(RangeError)
  })
})

describe('formatPrice', () => {
  it('formats euros per locale', () => {
    expect(formatPrice('bg', 25)).toBe(`25,00${NBSP}€`)
    expect(formatPrice('en', 25)).toBe('€25.00')
    expect(formatPrice('bg', 1234.5)).toBe(`1234,50${NBSP}€`)
  })

  it('accepts another currency', () => {
    expect(formatPrice('en', 10, 'BGN')).toBe(`BGN${NBSP}10.00`)
  })
})
