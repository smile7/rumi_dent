import type { CtaBandSection, SiteSettings } from '@/lib/content'

/**
 * The closing "book / call" band of service and article pages. Booking by phone resolves to the
 * same `tel:` link as Call, so Book only appears for an external booking URL.
 */
export function bookingCtaBand(
  settings: Pick<SiteSettings, 'booking'>,
  labels: { heading: string; book: string; call: string },
): CtaBandSection {
  return {
    type: 'ctaBand',
    key: 'booking-cta',
    tone: 'brand',
    spacing: 'default',
    heading: labels.heading,
    ctas: [
      ...(settings.booking.mode === 'externalUrl'
        ? [
            {
              label: labels.book,
              action: 'booking' as const,
              style: 'secondary' as const,
              link: null,
            },
          ]
        : []),
      { label: labels.call, action: 'call', style: 'primary', link: null },
    ],
  }
}
