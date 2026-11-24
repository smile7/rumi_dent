import { describe, expect, it } from 'vitest'

import type { Cta, Phone, SiteSettings } from '@/lib/content'

import {
  bookingAction,
  bookingLink,
  directionsUrl,
  messengerLinks,
  mobileBarActions,
  primaryPhone,
  resolveCta,
} from './actions'

const phone = (key: Phone['key'], e164: string, display = ''): Phone => ({ key, e164, display })

const settings: Pick<SiteSettings, 'booking' | 'phones' | 'geo' | 'address'> = {
  booking: { mode: 'phone' },
  phones: [phone('primary', '+35982841190', '082 841 190')],
  geo: { lat: 43.8486, lng: 25.9534 },
  address: { street: 'ул. Александровска 1', postalCode: '7000', city: 'Русе', countryCode: 'BG' },
}

const cta = (action: Cta['action'], link: Cta['link'] = null): Cta => ({
  label: 'x',
  action,
  style: 'primary',
  link,
})

describe('primaryPhone', () => {
  it('prefers the primary phone and keeps the editor display', () => {
    expect(
      primaryPhone({
        phones: [
          phone('secondary', '+359888123456'),
          phone('primary', '+35982841190', '082 841 190'),
        ],
      }),
    ).toEqual({ href: 'tel:+35982841190', display: '082 841 190' })
  })

  it('falls back to the first phone and a formatted display', () => {
    const result = primaryPhone({ phones: [phone('secondary', '+35982841190')] })
    expect(result?.href).toBe('tel:+35982841190')
    expect(result?.display).not.toBe('')
  })

  it('returns null without phones', () => {
    expect(primaryPhone({ phones: [] })).toBeNull()
  })
})

describe('bookingLink', () => {
  it('calls when booking is by phone', () => {
    expect(bookingLink(settings)).toEqual({
      href: 'tel:+35982841190',
      external: false,
      bookingMode: 'phone',
    })
  })

  it('uses the external booking URL', () => {
    expect(
      bookingLink({ ...settings, booking: { mode: 'externalUrl', url: 'https://book.example' } }),
    ).toEqual({ href: 'https://book.example', external: true, bookingMode: 'externalUrl' })
  })

  it('returns null with neither URL nor phone', () => {
    expect(bookingLink({ booking: { mode: 'phone' }, phones: [] })).toBeNull()
  })
})

describe('directionsUrl', () => {
  it('prefers coordinates', () => {
    expect(directionsUrl(settings)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=43.8486%2C25.9534',
    )
  })

  it('falls back to the address', () => {
    expect(directionsUrl({ address: settings.address })).toBe(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('ул. Александровска 1, 7000 Русе')}`,
    )
  })

  it('returns null without position or address', () => {
    expect(directionsUrl({ address: { countryCode: 'BG' } })).toBeNull()
  })
})

describe('bookingAction', () => {
  it('uses the header CTA label and target', () => {
    expect(
      bookingAction(settings, { ...cta('booking'), label: 'Запишете час' }, 'fallback'),
    ).toEqual({
      href: 'tel:+35982841190',
      external: false,
      bookingMode: 'phone',
      label: 'Запишете час',
    })
  })

  it('falls back to the booking settings, then the message', () => {
    expect(
      bookingAction({ ...settings, booking: { mode: 'phone', label: 'Обадете се' } }, null, 'fb')
        ?.label,
    ).toBe('Обадете се')
    expect(bookingAction(settings, undefined, 'fb')?.label).toBe('fb')
  })

  it('has no booking mode when the header CTA points elsewhere', () => {
    const page = { href: '/bg/kontakti', external: false, label: 'x' }
    expect(bookingAction(settings, cta('link', page), 'fb')).toEqual({
      href: '/bg/kontakti',
      external: false,
      label: 'x',
    })
  })
})

describe('messengerLinks', () => {
  it('keeps Viber app links same-tab and mobile only, WhatsApp web links in a new tab', () => {
    expect(
      messengerLinks({
        socials: [
          { platform: 'facebook', url: 'https://facebook.com/x' },
          { platform: 'whatsapp', url: 'https://wa.me/359888123456' },
          { platform: 'viber', url: 'viber://chat?number=%2B359888123456' },
        ],
      }),
    ).toEqual([
      {
        platform: 'viber',
        href: 'viber://chat?number=%2B359888123456',
        external: false,
        mobileOnly: true,
      },
      {
        platform: 'whatsapp',
        href: 'https://wa.me/359888123456',
        external: true,
        mobileOnly: false,
      },
    ])
  })

  it('treats an https Viber link like any web link', () => {
    expect(
      messengerLinks({ socials: [{ platform: 'viber', url: 'https://invite.viber.com/?g=x' }] }),
    ).toEqual([
      {
        platform: 'viber',
        href: 'https://invite.viber.com/?g=x',
        external: true,
        mobileOnly: false,
      },
    ])
  })

  it('returns nothing without messenger socials', () => {
    expect(messengerLinks({ socials: [] })).toEqual([])
  })
})

describe('mobileBarActions', () => {
  const labels = {
    call: 'call',
    directions: 'dir',
    book: 'book',
    viber: 'viber',
    whatsapp: 'wa',
    email: 'mail',
  }
  const full = {
    ...settings,
    email: 'hello@example.bg',
    socials: [{ platform: 'viber' as const, url: 'viber://chat?number=%2B359888123456' }],
  }
  const kinds = (...args: Parameters<typeof mobileBarActions>) =>
    mobileBarActions(...args).map((a) => a.kind)
  const external = {
    href: 'https://book.example',
    external: true,
    bookingMode: 'externalUrl' as const,
    label: 'Book',
  }

  it('returns call, directions and an external booking with its mode', () => {
    const actions = mobileBarActions(
      full,
      { showDirections: true, secondaryAction: 'booking' },
      external,
      labels,
    )
    expect(actions.map((a) => a.kind)).toEqual(['call', 'directions', 'booking'])
    expect(actions[2]).toMatchObject({ bookingMode: 'externalUrl', external: true })
  })

  it('drops a booking that only repeats the call', () => {
    const byPhone = bookingAction(full, null, 'x')
    expect(
      kinds(full, { showDirections: true, secondaryAction: 'booking' }, byPhone, labels),
    ).toEqual(['call', 'directions'])
  })

  it('supports email and messengers, and hides directions when disabled', () => {
    expect(kinds(full, { showDirections: false, secondaryAction: 'email' }, null, labels)).toEqual([
      'call',
      'email',
    ])
    const viber = mobileBarActions(
      full,
      { showDirections: false, secondaryAction: 'viber' },
      null,
      labels,
    )
    expect(viber[1]).toMatchObject({ kind: 'message', label: 'viber', external: false })
    expect(
      kinds(full, { showDirections: false, secondaryAction: 'whatsapp' }, null, labels),
    ).toEqual(['call'])
  })
})

describe('resolveCta', () => {
  it('resolves every action', () => {
    expect(
      resolveCta(cta('link', { href: '/bg/za-nas', external: false, label: 'x' }), settings),
    ).toEqual({
      href: '/bg/za-nas',
      external: false,
    })
    expect(resolveCta(cta('link'), settings)).toBeNull()
    expect(resolveCta(cta('call'), settings)?.href).toBe('tel:+35982841190')
    expect(resolveCta(cta('booking'), settings)).toMatchObject({
      href: 'tel:+35982841190',
      bookingMode: 'phone',
    })
    expect(resolveCta(cta('directions'), settings)?.external).toBe(true)
  })
})
