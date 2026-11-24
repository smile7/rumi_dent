import type {
  DayOfWeek,
  LocalBusinessLeaf,
  OpeningHoursSpecification,
  PostalAddress,
  WebSite,
} from 'schema-dts'

import { localeMeta, locales } from '@/config/i18n'
import { ogImageUrl, sanityImageLoader } from '@/lib/content/image-loader'
import type { Address, BusinessType, Weekday } from '@/lib/content/types'

import { homeUrl, ids, type JsonLdContext } from './ids'

/** `@type` comes from `siteSettings.businessType` (all LocalBusiness subtypes). */
export type OrganizationNode = Omit<LocalBusinessLeaf, '@type'> & { '@type': BusinessType }

const DAYS: Record<Weekday, DayOfWeek> = {
  Mo: 'https://schema.org/Monday',
  Tu: 'https://schema.org/Tuesday',
  We: 'https://schema.org/Wednesday',
  Th: 'https://schema.org/Thursday',
  Fr: 'https://schema.org/Friday',
  Sa: 'https://schema.org/Saturday',
  Su: 'https://schema.org/Sunday',
}

export function postalAddress(address: Address): PostalAddress {
  return {
    '@type': 'PostalAddress',
    streetAddress: address.street,
    addressLocality: address.city,
    postalCode: address.postalCode,
    addressRegion: address.region,
    addressCountry: address.countryCode,
  }
}

const isWebUrl = (url: string) => /^https?:\/\//.test(url)

export function organization(ctx: JsonLdContext): OrganizationNode {
  const { settings, siteUrl } = ctx
  const phone = settings.phones.find((p) => p.key === 'primary') ?? settings.phones[0]
  const image = settings.seoDefaults.ogImage ?? settings.logo
  const sameAs = [
    ...settings.socials.map((social) => social.url),
    ...(settings.googleBusinessUrl ? [settings.googleBusinessUrl] : []),
  ].filter(isWebUrl)

  return {
    '@type': settings.businessType,
    '@id': ids.organization(siteUrl),
    name: settings.brandName,
    legalName: settings.legal.legalName,
    url: homeUrl(ctx),
    logo: settings.logo ? sanityImageLoader({ src: settings.logo.src, width: 600 }) : undefined,
    image: image ? ogImageUrl(image) : undefined,
    telephone: phone?.e164,
    email: settings.email,
    address: postalAddress(settings.address),
    geo: settings.geo
      ? { '@type': 'GeoCoordinates', latitude: settings.geo.lat, longitude: settings.geo.lng }
      : undefined,
    openingHoursSpecification: settings.openingHours.map((row): OpeningHoursSpecification => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: row.days.map((day) => DAYS[day]),
      opens: row.opens,
      closes: row.closes,
    })),
    specialOpeningHoursSpecification: settings.specialHours.map(
      (row): OpeningHoursSpecification => ({
        '@type': 'OpeningHoursSpecification',
        validFrom: row.date,
        validThrough: row.endDate ?? row.date,
        // Google's convention for "closed all day".
        opens: row.closed ? '00:00' : row.opens,
        closes: row.closed ? '00:00' : row.closes,
      }),
    ),
    ...(settings.priceRange ? { priceRange: settings.priceRange } : {}),
    areaServed: settings.areaServed,
    currenciesAccepted: 'EUR',
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    hasMap: settings.googleBusinessUrl,
  }
}

export function website(ctx: JsonLdContext): WebSite {
  return {
    '@type': 'WebSite',
    '@id': ids.website(ctx.siteUrl),
    url: homeUrl(ctx),
    name: ctx.settings.brandName,
    inLanguage: locales.map((l) => localeMeta[l].hreflang),
    publisher: { '@id': ids.organization(ctx.siteUrl) },
  }
}
