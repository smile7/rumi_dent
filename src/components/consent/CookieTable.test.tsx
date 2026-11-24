import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import { CookieTable } from './CookieTable'
import { ProcessorsList } from './ProcessorsList'

afterEach(() => vi.unstubAllEnvs())

function rowNames() {
  const table = screen.getByRole('table', { name: 'Бисквитки и записи, които сайтът използва' })
  return within(table)
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent)
}

describe('CookieTable', () => {
  it('lists the necessary items and the map with the default (no analytics)', () => {
    renderWithIntl(<CookieTable />)
    const names = rowNames()
    expect(names).toEqual(
      expect.arrayContaining(['NEXT_LOCALE', 'consent', 'Cloudflare Turnstile']),
    )
    expect(names).not.toContain('_ga, _ga_*')
    expect(names).not.toContain('Cloudflare Web Analytics')
  })

  it('follows the analytics provider', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'ga4')
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-TEST')
    renderWithIntl(<CookieTable />)
    const row = screen.getByRole('rowheader', { name: '_ga, _ga_*' }).closest('tr')
    expect(row).not.toBeNull()
    expect(within(row!).getByText('Статистика')).toBeInTheDocument()
    expect(within(row!).getByText('До 2 години')).toBeInTheDocument()
  })

  it('uses the editor caption when set', () => {
    renderWithIntl(<CookieTable caption="Our cookies" />, 'en')
    expect(screen.getByRole('table', { name: 'Our cookies' })).toBeInTheDocument()
  })
})

describe('ProcessorsList', () => {
  it('includes the analytics provider in use only', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'cloudflare')
    vi.stubEnv('NEXT_PUBLIC_CF_BEACON_TOKEN', 'token')
    renderWithIntl(<ProcessorsList />, 'en')
    expect(screen.getByText('Cloudflare Web Analytics')).toBeInTheDocument()
    expect(screen.getByText('Resend, Inc.')).toBeInTheDocument()
    expect(screen.queryByText('Google Ireland Ltd. (Google Analytics)')).toBeNull()
  })
})
