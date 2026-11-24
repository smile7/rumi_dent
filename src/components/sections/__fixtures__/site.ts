import type { SectionSiteContext } from '../types'

/** Minimal site context for section tests and the styleguide. */
export const fixtureSite: SectionSiteContext = {
  phones: [
    {
      key: 'primary',
      e164: '+359828411900',
      display: '082 841 190',
      label: 'Регистратура',
    },
  ],
  address: { street: 'ул. „Борисова“ 12', city: 'Русе', postalCode: '7000', countryCode: 'BG' },
  geo: { lat: 43.8564, lng: 25.9706 },
  openingHours: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:00' }],
  specialHours: [],
  timeZone: 'Europe/Sofia',
  email: 'hello@demo.dental',
  booking: { mode: 'phone' },
  brandName: 'Demo Dental',
  mapEmbedUrl: undefined,
  mapPlaceholder: undefined,
  contactForm: {},
}