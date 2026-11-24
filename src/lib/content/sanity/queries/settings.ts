import { defineQuery } from 'next-sanity'

import {
  ctaI18nFields,
  i18n,
  imageFields,
  linkFields,
  localizedRef,
  routeFields,
} from '../fragments'

const addressFields = /* groq */ `
  "street": ${i18n('street')},
  "city": ${i18n('city')},
  postalCode,
  "region": ${i18n('region')},
  countryCode
`

export const siteSettingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  "brandName": ${i18n('brandName')},
  "tagline": ${i18n('tagline')},
  logo{ ${imageFields} },
  logoCompact{ ${imageFields} },
  businessType,
  "areaServed": ${i18n('areaServed')},
  priceRange,
  address{ ${addressFields} },
  geo,
  phones[]{ key, e164, display, "label": ${i18n('label')} },
  email,
  mapEmbedUrl,
  mapPlaceholder{ ${imageFields} },
  googleBusinessUrl,
  openingHours[]{ days, opens, closes, "note": ${i18n('note')} },
  specialHours[]{ "label": ${i18n('label')}, date, endDate, closed, opens, closes },
  timeZone,
  socials[]{ platform, url, "label": ${i18n('label')} },
  booking{ mode, url, "label": ${i18n('label')}, "note": ${i18n('note')} },
  contactForm{ "subjectPrefix": ${i18n('subjectPrefix')}, "successMessage": ${i18n('successMessage')} },
  legal{
    legalName, uic, vatNumber, representative, privacyEmail,
    registeredAddress{ ${addressFields} },
    "professionalBody": ${i18n('professionalBody')},
    "registration": ${i18n('registration')},
    "supervisoryAuthority": ${i18n('supervisoryAuthority')}
  },
  "legalLinks": legalLinks[]{ "doc": ${localizedRef('@', '^._ref')} },
  "privacyPage": *[_type == "legalPage" && kind == "privacy" && language == $locale][0]{ ${routeFields} },
  "cookiePolicyPage": *[_type == "legalPage" && kind == "cookies" && language == $locale][0]{ ${routeFields} },
  "footerNote": ${i18n('footerNote')},
  seoDefaults{
    "titleTemplate": ${i18n('titleTemplate')},
    "description": ${i18n('description')},
    ogImage{ ${imageFields} },
    googleVerification,
    bingVerification
  }
}`)

/** Read at submit time by the contact Server Action (the recipient is not part of `siteSettingsQuery`). */
export const contactFormSettingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  "brandName": ${i18n('brandName')},
  contactForm{ recipient, "subjectPrefix": ${i18n('subjectPrefix')} }
}`)

const navLinkFields = /* groq */ `_key, "label": ${i18n('label')}, link{ ${linkFields} }`

export const navigationQuery = defineQuery(`*[_id == "navigation"][0]{
  header[]{ ${navLinkFields}, children[]{ ${navLinkFields} } },
  headerCta{ ${ctaI18nFields} },
  footerColumns[]{ _key, "title": ${i18n('title')}, links[]{ ${navLinkFields} } },
  mobileActionBar
}`)

const announcementFields = /* groq */ `
  _id, _updatedAt, "message": ${i18n('message')}, link{ ${ctaI18nFields} }, tone, startsAt, endsAt, dismissible, pages
`

/** Active now (latest start first), else the next upcoming one; never an ended one. */
export const announcementQuery = defineQuery(`coalesce(
  *[_type == "announcement" && startsAt <= now() && (!defined(endsAt) || endsAt > now())]
    | order(startsAt desc)[0]{ ${announcementFields} },
  *[_type == "announcement" && startsAt > now()] | order(startsAt asc)[0]{ ${announcementFields} }
)`)
