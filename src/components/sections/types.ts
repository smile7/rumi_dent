import type { ReactNode } from 'react'

import type { Locale } from '@/config/i18n'
import type { Section, SectionType, SiteSettings } from '@/lib/content'
import type { ActionSettings } from '@/lib/site/actions'

export type SectionSiteContext = ActionSettings &
  Pick<
    SiteSettings,
    | 'openingHours'
    | 'specialHours'
    | 'timeZone'
    | 'address'
    | 'phones'
    | 'email'
    | 'geo'
    | 'mapEmbedUrl'
    | 'mapPlaceholder'
    | 'brandName'
    | 'contactForm'
    | 'privacyHref'
  >

export type SectionComponentProps<T extends Section = Section> = {
  section: T
  index: number
  sections: readonly Section[]
  locale: Locale
  site: SectionSiteContext
  imagePriority: boolean
}

export type SectionComponent<T extends Section = Section> = (
  props: SectionComponentProps<T>,
) => ReactNode | Promise<ReactNode>

export type SectionRegistry = Record<SectionType, SectionComponent | null>