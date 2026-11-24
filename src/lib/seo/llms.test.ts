import { describe, expect, it } from 'vitest'

import type { SiteSettings } from '@/lib/content/types'

import { buildLlmsTxt, type LlmsSection } from './llms'

const settings = {
  brandName: 'Демо Дентал',
  tagline: 'Детска и семейна дентална клиника',
  address: { street: 'ул. „Демо“ 1', city: 'Русе', postalCode: '7000', countryCode: 'BG' },
  phones: [{ key: 'primary', e164: '+35982000000', display: '082 000 000' }],
  email: 'hello@example.com',
  openingHours: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:00' }],
  seoDefaults: { description: 'Прегледи без страх в Русе.' },
} as SiteSettings

const section = (locale: 'bg' | 'en', title: string): LlmsSection => ({
  locale,
  services: [{ title, url: `https://example.com/${locale}/s`, description: 'One\nline' }],
  team: [{ name: 'Д-р Мария', role: 'Детски зъболекар', specialties: ['Детска стоматология'] }],
  pages: [{ title: 'Contact', url: `https://example.com/${locale}/contact` }],
  articles: [],
})

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt({
    settings,
    sections: [section('bg', 'Пломби'), section('en', 'Fillings')],
  })

  it('starts with the brand, summary and contact facts in the default locale', () => {
    expect(text.split('\n').slice(0, 4)).toEqual([
      '# Демо Дентал',
      '> Детска и семейна дентална клиника. Прегледи без страх в Русе.',
      '',
      'Address: ул. „Демо“ 1, 7000 Русе · Phone: +35982000000 · Email: hello@example.com · Hours: пн–пт 09:00–18:00 · Languages: Български, English',
    ])
  })

  it('lists key pages in both languages with one-line descriptions, EN under its own heading', () => {
    expect(text).toContain('## Services\n- [Пломби](https://example.com/bg/s): One line\n')
    expect(text).toContain('## Team\n- Д-р Мария, Детски зъболекар, Детска стоматология\n')
    expect(text).toContain('## Key pages\n- [Contact](https://example.com/bg/contact)\n')
    expect(text).toContain(
      '## English\n### Services\n- [Fillings](https://example.com/en/s): One line',
    )
    expect(text).not.toContain('Articles')
  })
})
