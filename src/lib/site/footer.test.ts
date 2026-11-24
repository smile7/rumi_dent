import { describe, expect, it } from 'vitest'

import type { OpeningHours } from '@/lib/content'

import { addressLines, hoursRows } from './footer'

describe('addressLines', () => {
  it('joins postal code and city, skips empty parts', () => {
    expect(
      addressLines({
        street: 'ул. „Борисова“ 12',
        postalCode: '7000',
        city: 'Русе',
        countryCode: 'BG',
      }),
    ).toEqual(['ул. „Борисова“ 12', '7000 Русе'])
    expect(addressLines({ city: 'Русе', countryCode: 'BG' })).toEqual(['Русе'])
    expect(addressLines({ countryCode: 'BG' })).toEqual([])
  })
})

describe('hoursRows', () => {
  const hours: OpeningHours[] = [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:00' },
    { days: ['Sa'], opens: '09:00', closes: '13:00', note: 'by appointment' },
  ]

  it('formats each entry and appends the closed days', () => {
    expect(hoursRows('en', hours)).toEqual([
      { days: 'Mon–Fri', time: '09:00–18:00' },
      { days: 'Sat', time: '09:00–13:00', note: 'by appointment' },
      { days: 'Sun', time: null },
    ])
  })

  it('has no closed row when every day is open, and no rows without hours', () => {
    const everyDay: OpeningHours[] = [
      { days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], opens: '08:00', closes: '00:00' },
    ]
    expect(hoursRows('bg', everyDay)).toHaveLength(1)
    expect(hoursRows('bg', [])).toEqual([])
  })
})
