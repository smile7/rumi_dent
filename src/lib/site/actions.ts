import type { Cta, Navigation, Phone, SiteSettings } from '@/lib/content'
import { formatPhone } from '@/lib/i18n/format'

export type PhoneLink = { href: string; display: string }
export type BookingMode = SiteSettings['booking']['mode']
/** `bookingMode` is set when the link is the booking target (analytics `booking_click`). */
export type ActionLink = { href: string; external: boolean; bookingMode?: BookingMode }

/** The primary phone as a `tel:` link with the editor's display format (formatted E.164 as fallback). */
export function primaryPhone(settings: Pick<SiteSettings, 'phones'>): PhoneLink | null {
  const phone: Phone | undefined =
    settings.phones.find((p) => p.key === 'primary') ?? settings.phones[0]
  if (!phone) return null
  const formatted = formatPhone(phone.e164)
  return { href: formatted.href, display: phone.display || formatted.display }
}

/** Booking target: the external booking URL, or a call when booking is by phone. */
export function bookingLink(settings: Pick<SiteSettings, 'booking' | 'phones'>): ActionLink | null {
  if (settings.booking.mode === 'externalUrl' && settings.booking.url) {
    return { href: settings.booking.url, external: true, bookingMode: 'externalUrl' }
  }
  const phone = primaryPhone(settings)
  return phone ? { href: phone.href, external: false, bookingMode: 'phone' } : null
}

export type MessengerLink = {
  platform: 'viber' | 'whatsapp'
  href: string
  external: boolean
  /** `viber://` links only open with the app installed, so they are offered on mobile only. */
  mobileOnly: boolean
}

/** Viber / WhatsApp chat links from Site settings → Socials, in that order. */
export function messengerLinks(settings: Pick<SiteSettings, 'socials'>): MessengerLink[] {
  return (['viber', 'whatsapp'] as const).flatMap((platform) => {
    const social = settings.socials.find((s) => s.platform === platform)
    if (!social) return []
    const appLink = social.url.startsWith('viber:')
    return [{ platform, href: social.url, external: !appLink, mobileOnly: appLink }]
  })
}

/** Google Maps directions to the map position, or to the address when there is none (PRD F-10). */
export function directionsUrl(settings: Pick<SiteSettings, 'geo' | 'address'>): string | null {
  const { geo, address } = settings
  const destination = geo
    ? `${geo.lat},${geo.lng}`
    : [address.street, [address.postalCode, address.city].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ')
  if (!destination) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export type ActionSettings = Pick<SiteSettings, 'booking' | 'phones' | 'geo' | 'address'>

export type LabelledAction = ActionLink & { label: string }

/** The site's booking button: the navigation's header CTA when set, else the booking settings. */
export function bookingAction(
  settings: ActionSettings,
  headerCta: Cta | null | undefined,
  fallbackLabel: string,
): LabelledAction | null {
  const target = headerCta ? resolveCta(headerCta, settings) : bookingLink(settings)
  if (!target) return null
  return { ...target, label: headerCta?.label || settings.booking.label || fallbackLabel }
}

export type BarAction = {
  kind: 'call' | 'directions' | 'booking' | 'message' | 'email'
  href: string
  label: string
  external: boolean
  bookingMode?: BookingMode
  /** Set for `message` actions. */
  platform?: MessengerLink['platform']
}

export type BarLabels = Record<
  'call' | 'directions' | 'book' | 'viber' | 'whatsapp' | 'email',
  string
>

/**
 * Mobile action bar: Call, Directions (if enabled) and the navigation's secondary action.
 * A booking that would only repeat the call link is dropped.
 */
export function mobileBarActions(
  settings: ActionSettings & Pick<SiteSettings, 'email' | 'socials'>,
  bar: Navigation['mobileActionBar'],
  booking: LabelledAction | null,
  labels: BarLabels,
): BarAction[] {
  const actions: BarAction[] = []
  const phone = primaryPhone(settings)
  if (phone) actions.push({ kind: 'call', href: phone.href, label: labels.call, external: false })

  const directions = bar.showDirections ? directionsUrl(settings) : null
  if (directions) {
    actions.push({ kind: 'directions', href: directions, label: labels.directions, external: true })
  }

  const secondary = bar.secondaryAction
  if (secondary === 'booking' && booking && booking.href !== phone?.href) {
    actions.push({
      kind: 'booking',
      href: booking.href,
      label: labels.book,
      external: booking.external,
      ...(booking.bookingMode ? { bookingMode: booking.bookingMode } : {}),
    })
  } else if (secondary === 'email' && settings.email) {
    actions.push({
      kind: 'email',
      href: `mailto:${settings.email}`,
      label: labels.email,
      external: false,
    })
  } else if (secondary === 'viber' || secondary === 'whatsapp') {
    const messenger = messengerLinks(settings).find((m) => m.platform === secondary)
    if (messenger) {
      actions.push({
        kind: 'message',
        href: messenger.href,
        label: labels[secondary],
        external: messenger.external,
        platform: messenger.platform,
      })
    }
  }
  return actions
}

/** Where a CMS call-to-action goes. `null` when its target isn't configured. */
export function resolveCta(cta: Cta, settings: ActionSettings): ActionLink | null {
  switch (cta.action) {
    case 'link':
      return cta.link ? { href: cta.link.href, external: cta.link.external } : null
    case 'call': {
      const phone = primaryPhone(settings)
      return phone ? { href: phone.href, external: false } : null
    }
    case 'booking':
      return bookingLink(settings)
    case 'directions': {
      const href = directionsUrl(settings)
      return href ? { href, external: true } : null
    }
  }
}
