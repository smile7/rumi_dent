import type { Locale } from '@/config/i18n'

import type { AnnouncementQueryRow, NavigationQueryRow, SiteSettingsQueryRow } from '../query-types'
import type { Address, Announcement, Navigation, SiteSettings, Weekday } from '../../types'
import { mapList } from './collections'
import { clean, mapCta, mapImage, mapLink, routePath } from './shared'

const DEFAULT_TIME_ZONE = 'Europe/Sofia'

type AddressInput = SiteSettingsQueryRow['address']

function mapAddress(address: AddressInput): Address {
  return {
    ...(address?.street ? { street: address.street } : {}),
    ...(address?.city ? { city: address.city } : {}),
    ...(address?.postalCode ? { postalCode: address.postalCode } : {}),
    ...(address?.region ? { region: address.region } : {}),
    countryCode: clean(address?.countryCode) ?? 'BG',
  }
}

/** Optional string fields: copies only the non-empty ones. */
function present<K extends string>(fields: Record<K, string | null | undefined>) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => typeof value === 'string' && value !== ''),
  ) as Partial<Record<K, string>>
}

export function mapSiteSettings(
  row: SiteSettingsQueryRow | null,
  locale: Locale,
): SiteSettings | null {
  if (!row?.brandName) return null
  const brandName = row.brandName
  const logo = mapImage(row.logo, brandName)
  const logoCompact = mapImage(row.logoCompact, brandName)
  const mapPlaceholder = mapImage(row.mapPlaceholder)
  const ogImage = mapImage(row.seoDefaults?.ogImage)
  const geo =
    row.geo?.lat != null && row.geo.lng != null ? { lat: row.geo.lat, lng: row.geo.lng } : undefined

  return {
    brandName,
    ...present({ tagline: row.tagline, areaServed: row.areaServed, priceRange: row.priceRange }),
    ...(logo ? { logo } : {}),
    ...(logoCompact ? { logoCompact } : {}),
    businessType: clean(row.businessType) ?? 'LocalBusiness',
    address: mapAddress(row.address),
    ...(geo ? { geo } : {}),
    phones: (row.phones ?? []).flatMap((phone) =>
      phone.e164 && phone.display
        ? [
            {
              key: clean(phone.key) ?? 'primary',
              e164: clean(phone.e164),
              display: phone.display,
              ...present({ label: phone.label }),
            },
          ]
        : [],
    ),
    ...present({
      email: clean(row.email),
      mapEmbedUrl: clean(row.mapEmbedUrl),
      googleBusinessUrl: clean(row.googleBusinessUrl),
    }),
    ...(mapPlaceholder ? { mapPlaceholder } : {}),
    openingHours: (row.openingHours ?? []).flatMap((spec) =>
      spec.days?.length && spec.opens && spec.closes
        ? [
            {
              days: spec.days.map((day) => clean(day) as Weekday),
              opens: clean(spec.opens),
              closes: clean(spec.closes),
              ...present({ note: spec.note }),
            },
          ]
        : [],
    ),
    specialHours: (row.specialHours ?? []).flatMap((spec) =>
      spec.date
        ? [
            {
              date: clean(spec.date),
              closed: Boolean(spec.closed),
              ...present({
                label: spec.label,
                endDate: clean(spec.endDate),
                opens: clean(spec.opens),
                closes: clean(spec.closes),
              }),
            },
          ]
        : [],
    ),
    timeZone: clean(row.timeZone) ?? DEFAULT_TIME_ZONE,
    socials: (row.socials ?? []).flatMap((social) =>
      social.platform && social.url
        ? [
            {
              platform: clean(social.platform),
              url: clean(social.url),
              ...present({ label: social.label }),
            },
          ]
        : [],
    ),
    booking: {
      mode: clean(row.booking?.mode) ?? 'phone',
      ...present({
        url: clean(row.booking?.url),
        label: row.booking?.label,
        note: row.booking?.note,
      }),
    },
    contactForm: present({
      subjectPrefix: row.contactForm?.subjectPrefix,
      successMessage: row.contactForm?.successMessage,
    }),
    legal: {
      ...present({
        legalName: row.legal?.legalName,
        uic: clean(row.legal?.uic),
        vatNumber: clean(row.legal?.vatNumber),
        representative: row.legal?.representative,
        privacyEmail: clean(row.legal?.privacyEmail),
        professionalBody: row.legal?.professionalBody,
        registration: row.legal?.registration,
        supervisoryAuthority: row.legal?.supervisoryAuthority,
      }),
      ...(row.legal?.registeredAddress
        ? { registeredAddress: mapAddress(row.legal.registeredAddress) }
        : {}),
    },
    legalLinks: (row.legalLinks ?? []).flatMap(({ doc }) => {
      const href = doc ? routePath(doc, locale) : null
      return href && doc?.title ? [{ href, external: false, label: doc.title }] : []
    }),
    ...present({
      footerNote: row.footerNote,
      privacyHref: row.privacyPage ? routePath(row.privacyPage, locale) : null,
      cookiePolicyHref: row.cookiePolicyPage ? routePath(row.cookiePolicyPage, locale) : null,
    }),
    seoDefaults: {
      ...present({
        titleTemplate: row.seoDefaults?.titleTemplate,
        description: row.seoDefaults?.description,
        googleVerification: row.seoDefaults?.googleVerification,
        bingVerification: row.seoDefaults?.bingVerification,
      }),
      ...(ogImage ? { ogImage } : {}),
    },
  }
}

export function mapNavigation(row: NavigationQueryRow | null, locale: Locale): Navigation {
  return {
    header: mapList(row?.header, (item) => {
      const link = mapLink(item.link, item.label, locale)
      return link
        ? {
            ...link,
            children: mapList(item.children, (child) => mapLink(child.link, child.label, locale)),
          }
        : null
    }),
    headerCta: mapCta(row?.headerCta, locale),
    footerColumns: mapList(row?.footerColumns, (column) =>
      column.title
        ? {
            title: column.title,
            links: mapList(column.links, (l) => mapLink(l.link, l.label, locale)),
          }
        : null,
    ),
    mobileActionBar: {
      showDirections: row?.mobileActionBar?.showDirections !== false,
      secondaryAction: clean(row?.mobileActionBar?.secondaryAction) ?? 'none',
    },
  }
}

export function mapAnnouncement(
  row: AnnouncementQueryRow | null,
  locale: Locale,
): Announcement | null {
  if (!row?.message || !row.startsAt) return null
  return {
    id: row._id,
    updatedAt: row._updatedAt,
    message: row.message,
    link: mapCta(row.link, locale),
    tone: clean(row.tone) ?? 'info',
    startsAt: clean(row.startsAt),
    ...(row.endsAt ? { endsAt: clean(row.endsAt) } : {}),
    dismissible: row.dismissible !== false,
    pages: clean(row.pages) ?? 'all',
  }
}
