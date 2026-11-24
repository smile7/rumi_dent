import type { SchemaTypeDefinition } from 'sanity'

import { announcementType } from './collections/announcement'
import { faqItemType } from './collections/faqItem'
import { galleryItemType } from './collections/galleryItem'
import { serviceCategoryType } from './collections/serviceCategory'
import { teamMemberType } from './collections/teamMember'
import { testimonialType } from './collections/testimonial'
import { articleType } from './documents/article'
import { legalPageType } from './documents/legalPage'
import { pageType } from './documents/page'
import { serviceType } from './documents/service'
import { bookingConfigType, legalEntityType } from './objects/business'
import {
  openingHoursSpecType,
  phoneType,
  socialLinkType,
  specialHoursType,
} from './objects/contact'
import { ctaI18nType, ctaInlineType, ctaType } from './objects/cta'
import { imageWithAltType } from './objects/imageWithAlt'
import { cookieTableType, processorsListType } from './objects/legalBlocks'
import { linkType } from './objects/link'
import { addressType, geoType } from './objects/location'
import { calloutType, richTextSimpleType, richTextType } from './objects/richText'
import { seoType } from './objects/seo'
import { sectionTypes } from './sections'
import { navigationType } from './singletons/navigation'
import { siteSettingsType } from './singletons/siteSettings'

const objects = [
  imageWithAltType,
  richTextType,
  richTextSimpleType,
  calloutType,
  cookieTableType,
  processorsListType,
  linkType,
  ctaType,
  ctaI18nType,
  ctaInlineType,
  seoType,
  addressType,
  geoType,
  phoneType,
  openingHoursSpecType,
  specialHoursType,
  socialLinkType,
  legalEntityType,
  bookingConfigType,
]

const singletons = [siteSettingsType, navigationType]

const documents = [pageType, serviceType, articleType, legalPageType]

const collections = [
  serviceCategoryType,
  teamMemberType,
  faqItemType,
  galleryItemType,
  testimonialType,
  announcementType,
]

export const schemaTypes: SchemaTypeDefinition[] = [
  ...singletons,
  ...documents,
  ...collections,
  ...sectionTypes,
  ...objects,
]

/** Fixed-id documents, registered in `sanity.config.ts` `document.singletons` (document id = type name). */
export const singletonTypes = singletons.map((type) => type.name)
