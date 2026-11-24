import { features } from '@/config/features'

import { BlogTeaserSection } from './BlogTeaser'
import { ContactHoursSection } from './ContactHours'
import { CtaBandSection } from './CtaBand'
import { FaqSection } from './Faq'
import { GallerySection } from './Gallery'
import { HeroSection } from './Hero'
import { ProcessStepsSection } from './ProcessSteps'
import { RichTextBlockSection } from './RichTextBlock'
import { TeamSection } from './Team'
import { TestimonialsSection } from './Testimonials'
import { TextImageSection } from './TextImage'
import { TilesSection } from './Tiles'
import type { SectionRegistry } from './types'

export const sectionRegistry = {
  hero: HeroSection,
  textImage: TextImageSection,
  richText: RichTextBlockSection,
  tiles: TilesSection,
  processSteps: ProcessStepsSection,
  faq: FaqSection,
  blogTeaser: BlogTeaserSection,
  testimonials: TestimonialsSection,
  team: TeamSection,
  gallery: GallerySection,
  contactHours: ContactHoursSection,
  ctaBand: CtaBandSection,
} satisfies SectionRegistry

export const reservedSectionTypes = {
  priceList: features.priceList ? null : null,
  beforeAfter: features.beforeAfter ? null : null,
  googleReviews: features.googleReviews ? null : null,
} as const

export function registryEntry(type: keyof typeof sectionRegistry) {
  return sectionRegistry[type]
}