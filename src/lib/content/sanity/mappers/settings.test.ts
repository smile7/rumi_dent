import { describe, expect, it } from 'vitest'

import type { AnnouncementQueryRow, NavigationQueryRow, SiteSettingsQueryRow } from '../query-types'
import { fixture, linkRow, routeDoc } from './fixtures'
import { mapAnnouncement, mapNavigation, mapSiteSettings } from './settings'

describe('mapSiteSettings', () => {
  it('returns null without a brand name', () => {
    expect(mapSiteSettings(null, 'bg')).toBeNull()
    expect(mapSiteSettings(fixture<SiteSettingsQueryRow>({ brandName: null }), 'bg')).toBeNull()
  })

  it('applies defaults and drops incomplete list items', () => {
    const settings = mapSiteSettings(
      fixture<SiteSettingsQueryRow>({
        brandName: 'Demo Dental',
        tagline: '',
        address: {
          street: 'ul. Pliska 54',
          city: 'Ruse',
          postalCode: '7000',
          region: null,
          countryCode: null,
        },
        geo: { lat: 43.85, lng: 25.97 },
        phones: [
          { key: 'primary', e164: '+359888123456', display: '088 812 3456', label: null },
          { key: 'secondary', e164: null, display: 'x', label: null },
        ],
        openingHours: [{ days: ['Mo', 'Tu'], opens: '09:00', closes: '18:00', note: null }],
        specialHours: null,
        timeZone: null,
        booking: null,
        legalLinks: [
          { doc: { _type: 'legalPage', title: 'Privacy', slug: 'privacy' } },
          { doc: null },
        ],
      }),
      'en',
    )
    expect(settings).toMatchObject({
      brandName: 'Demo Dental',
      businessType: 'LocalBusiness',
      address: { street: 'ul. Pliska 54', countryCode: 'BG' },
      geo: { lat: 43.85, lng: 25.97 },
      phones: [{ key: 'primary', e164: '+359888123456' }],
      openingHours: [{ days: ['Mo', 'Tu'], opens: '09:00', closes: '18:00' }],
      specialHours: [],
      timeZone: 'Europe/Sofia',
      booking: { mode: 'phone' },
      legalLinks: [{ href: '/en/legal/privacy', external: false, label: 'Privacy' }],
    })
    expect(settings).not.toHaveProperty('tagline')
  })

  it('maps the privacy contact and the cookie policy link', () => {
    const settings = mapSiteSettings(
      fixture<SiteSettingsQueryRow>({
        brandName: 'Demo Dental',
        legal: fixture<NonNullable<SiteSettingsQueryRow>['legal']>({
          privacyEmail: 'privacy@example.com',
        }),
        cookiePolicyPage: { _type: 'legalPage', title: 'Cookies', slug: 'cookies' },
      }),
      'en',
    )
    expect(settings?.legal.privacyEmail).toBe('privacy@example.com')
    expect(settings?.cookiePolicyHref).toBe('/en/legal/cookies')
  })
})

describe('mapNavigation', () => {
  it('drops links without a target in this locale, including dropdown children', () => {
    const nav = mapNavigation(
      fixture<NavigationQueryRow>({
        header: [
          {
            _key: 'n1',
            label: 'Services',
            link: linkRow({ systemRoute: 'services' }),
            children: [
              {
                _key: 'c1',
                label: 'Kids',
                link: linkRow({ internal: routeDoc({ slug: 'kids' }) }),
              },
              { _key: 'c2', label: 'Untranslated', link: linkRow() },
            ],
          },
          { _key: 'n2', label: 'Untranslated', link: linkRow(), children: null },
        ],
        headerCta: { label: 'Book', action: 'booking', style: null, link: null },
        footerColumns: null,
        mobileActionBar: null,
      }),
      'bg',
    )
    expect(nav).toEqual({
      header: [
        {
          href: '/bg/uslugi',
          external: false,
          label: 'Services',
          children: [{ href: '/bg/kids', external: false, label: 'Kids' }],
        },
      ],
      headerCta: { label: 'Book', action: 'booking', style: 'primary', link: null },
      footerColumns: [],
      mobileActionBar: { showDirections: true, secondaryAction: 'none' },
    })
  })
})

describe('mapAnnouncement', () => {
  it('maps dates and defaults', () => {
    expect(
      mapAnnouncement(
        fixture<AnnouncementQueryRow>({
          _id: 'a',
          _updatedAt: '2026-11-20T10:00:00Z',
          message: 'Closed on 24 December',
          link: null,
          tone: null,
          startsAt: '2026-12-01T00:00:00Z',
          endsAt: null,
          dismissible: null,
          pages: null,
        }),
        'en',
      ),
    ).toEqual({
      id: 'a',
      updatedAt: '2026-11-20T10:00:00Z',
      message: 'Closed on 24 December',
      link: null,
      tone: 'info',
      startsAt: '2026-12-01T00:00:00Z',
      dismissible: true,
      pages: 'all',
    })
  })
})
