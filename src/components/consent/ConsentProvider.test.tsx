import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MapEmbed } from '@/components/map/MapEmbed'
import { parseConsent, readConsentCookie } from '@/lib/consent/consent'
import { renderWithIntl } from '@/test/intl'

import { ConsentProvider } from './ConsentProvider'
import { CookieSettingsButton } from './CookieSettingsButton'

function clearCookies() {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`
  }
}

function storedConsent() {
  return parseConsent(readConsentCookie(document.cookie), 1)
}

function renderSite() {
  return renderWithIntl(
    <ConsentProvider cookiePolicyHref="/bg/pravna-informaciya/biskvitki">
      <p>Page</p>
      <CookieSettingsButton label="Настройки на бисквитките" />
      <MapEmbed
        embedUrl="https://www.google.com/maps/embed?pb=demo"
        title="Карта"
        loadLabel="Зареди картата"
        notice="Notice"
        alwaysAllowLabel="Винаги зареждай Google Maps"
      >
        <span>Placeholder</span>
      </MapEmbed>
    </ConsentProvider>,
  )
}

function enableGa4() {
  vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'ga4')
  vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-TEST')
}

beforeEach(clearCookies)
afterEach(() => {
  vi.unstubAllEnvs()
  clearCookies()
})

describe('CookieBanner', () => {
  it('is not shown when analytics is cookieless', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'cloudflare')
    vi.stubEnv('NEXT_PUBLIC_CF_BEACON_TOKEN', 'token')
    renderSite()
    expect(screen.queryByRole('region', { name: 'Бисквитки' })).toBeNull()
  })

  it('shows three equal buttons with ga4 and no stored choice', () => {
    enableGa4()
    renderSite()
    const banner = screen.getByRole('region', { name: 'Бисквитки' })
    const buttons = [
      screen.getByRole('button', { name: 'Приемам всички' }),
      screen.getByRole('button', { name: 'Отказвам всички' }),
      screen.getByRole('button', { name: 'Настройки' }),
    ]
    for (const button of buttons) expect(banner).toContainElement(button)
    expect(new Set(buttons.map((button) => button.className)).size).toBe(1)
  })

  it('stores "reject all" and hides the banner', () => {
    enableGa4()
    renderSite()
    fireEvent.click(screen.getByRole('button', { name: 'Отказвам всички' }))
    expect(storedConsent()?.categories).toEqual([])
    expect(screen.queryByRole('region', { name: 'Бисквитки' })).toBeNull()
  })

  it('stores "accept all" with every category in use', () => {
    enableGa4()
    renderSite()
    fireEvent.click(screen.getByRole('button', { name: 'Приемам всички' }))
    expect(storedConsent()?.categories).toEqual(['analytics', 'embeds'])
  })
})

describe('PreferencesDialog', () => {
  it('has necessary locked on and nothing pre-ticked', () => {
    enableGa4()
    renderSite()
    fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
    const dialog = screen.getByRole('dialog', { name: 'Настройки на бисквитките' })
    expect(dialog).toBeInTheDocument()
    const necessary = screen.getByRole('switch', { name: /Необходими/ })
    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()
    expect(screen.getByRole('switch', { name: 'Статистика' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: 'Външно съдържание' })).not.toBeChecked()
  })

  it('saves the selected categories', () => {
    enableGa4()
    renderSite()
    fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Статистика' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запазване на избора' }))
    expect(storedConsent()?.categories).toEqual(['analytics'])
  })

  it('opens from the footer button, and withdrawing analytics deletes the GA cookies', () => {
    enableGa4()
    renderSite()
    fireEvent.click(screen.getByRole('button', { name: 'Приемам всички' }))
    document.cookie = '_ga=GA1.1.123; Path=/'
    document.cookie = '_ga_TEST=GS1.1; Path=/'
    fireEvent.click(screen.getByRole('button', { name: 'Настройки на бисквитките' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Статистика' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запазване на избора' }))
    expect(storedConsent()?.categories).toEqual(['embeds'])
    expect(document.cookie).not.toMatch(/_ga/)
  })
})

describe('MapEmbed with consent', () => {
  it('loads directly, without taking focus, when embeds are allowed', () => {
    renderSite()
    fireEvent.click(screen.getByRole('button', { name: 'Настройки на бисквитките' }))
    fireEvent.click(screen.getByRole('button', { name: 'Приемам всички' }))
    const iframe = screen.getByTitle('Карта')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe).not.toHaveFocus()
  })

  it('"always load" grants embeds when the map is loaded', () => {
    renderSite()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Винаги зареждай Google Maps' }))
    fireEvent.click(screen.getByRole('button', { name: 'Зареди картата' }))
    expect(storedConsent()?.categories).toEqual(['embeds'])
    expect(screen.getByTitle('Карта')).toHaveFocus()
  })
})
