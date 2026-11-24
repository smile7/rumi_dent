import { defineArrayMember, defineField, type InsertMenuOptions } from 'sanity'

import { features } from '../../../config/features'
import { sectionProblems } from '../../lib/validation'
import { contactHoursSection, ctaBandSection } from './contact'
import {
  blogTeaserSection,
  faqSection,
  processStepsSection,
  richTextBlockSection,
  textImageSection,
  tilesSection,
} from './content'
import { heroSection } from './intro'
import { gallerySection, teamSection, testimonialsSection } from './socialProof'

const groups = [
  { name: 'intro', title: 'Intro', of: [heroSection] },
  {
    name: 'content',
    title: 'Content',
    of: [
      textImageSection,
      richTextBlockSection,
      tilesSection,
      processStepsSection,
      faqSection,
      blogTeaserSection,
    ],
  },
  {
    name: 'socialProof',
    title: 'Social proof',
    of: [testimonialsSection, teamSection, gallerySection],
  },
  { name: 'contact', title: 'Contact', of: [contactHoursSection, ctaBandSection] },
]

/**
 * Reserved sections (`section.priceList`, `section.beforeAfter`, `section.googleReviews`) are not
 * built in v1. When a `features` flag is switched on, its type must be added here first.
 */
const reservedSections = Object.entries(features).filter(([, enabled]) => enabled)
if (reservedSections.length > 0) {
  throw new Error(
    `Feature flags ${reservedSections.map(([name]) => name).join(', ')} are on, but their sections are not built yet (CONTENT-MODEL §6).`,
  )
}

export const sectionTypes = groups.flatMap((group) => group.of)

const insertMenu: InsertMenuOptions = {
  filter: true,
  groups: groups.map(({ name, title, of }) => ({ name, title, of: of.map((type) => type.name) })),
  views: [
    { name: 'grid', previewImageUrl: (typeName) => `/studio/sections/${typeName}.png` },
    { name: 'list' },
  ],
}

export const sectionsField = defineField({
  name: 'sections',
  title: 'Sections',
  type: 'array',
  description: 'The building blocks of the page, top to bottom. Drag to reorder.',
  of: sectionTypes.map((type) => defineArrayMember({ type: type.name })),
  options: { insertMenu },
  validation: (rule) =>
    rule.custom((sections: Parameters<typeof sectionProblems>[0], { document }) =>
      sectionProblems(sections, { requireOne: !document?.pageKey }),
    ),
})
