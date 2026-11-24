import type { ComponentType } from 'react'
import { defineField, defineType, type FieldDefinition } from 'sanity'

import { SLUG_LIKE } from '../../lib/validation'

const LAYOUT = 'layout'

const baseFields = [
  defineField({
    name: 'tone',
    title: 'Background',
    type: 'string',
    fieldset: LAYOUT,
    options: {
      layout: 'radio',
      direction: 'horizontal',
      list: [
        { title: 'Base', value: 'base' },
        { title: 'Soft', value: 'soft' },
        { title: 'Brand', value: 'brand' },
        { title: 'Accent', value: 'accent' },
        { title: 'Dark', value: 'inverse' },
      ],
    },
    initialValue: 'base',
  }),
  defineField({
    name: 'spacing',
    title: 'Spacing',
    type: 'string',
    fieldset: LAYOUT,
    options: {
      layout: 'radio',
      direction: 'horizontal',
      list: [
        { title: 'Default', value: 'default' },
        { title: 'Compact', value: 'compact' },
        { title: 'None', value: 'none' },
      ],
    },
    initialValue: 'default',
  }),
  defineField({
    name: 'anchorId',
    title: 'Anchor ID',
    type: 'string',
    fieldset: LAYOUT,
    description:
      'Optional. Lets links jump to this section, e.g. "first-visit" for …/#first-visit. Unique on the page.',
    validation: (rule) =>
      rule.custom((value: string | undefined) =>
        !value || SLUG_LIKE.test(value)
          ? true
          : 'Use lowercase Latin letters, numbers and hyphens only, e.g. "first-visit".',
      ),
  }),
  defineField({
    name: 'hidden',
    title: 'Hide this section',
    type: 'boolean',
    fieldset: LAYOUT,
    description: 'Hides the section on the site without deleting it.',
    initialValue: false,
  }),
]

type SectionOptions = {
  /** Without the `section.` prefix. */
  name: string
  title: string
  icon: ComponentType
  fields: FieldDefinition[]
}

/** A page-builder section: its own fields, then the shared layout fields. */
export const defineSection = ({ name, title, icon, fields }: SectionOptions) =>
  defineType({
    name: `section.${name}`,
    title,
    type: 'object',
    icon,
    fieldsets: [
      {
        name: LAYOUT,
        title: 'Layout and visibility',
        options: { collapsible: true, collapsed: true },
      },
    ],
    fields: [...fields, ...baseFields],
    preview: {
      select: { heading: 'heading', hidden: 'hidden' },
      prepare: ({ heading, hidden }) => ({
        title: heading || title,
        subtitle: hidden ? `${title} · hidden` : title,
        media: icon,
      }),
    },
  })

/** Optional section heading (H2). */
export const headingField = (max = 80) =>
  defineField({
    name: 'heading',
    title: 'Heading',
    type: 'string',
    validation: (rule) => rule.max(max).error(`Keep the heading under ${max} characters.`),
  })

export const introField = defineField({
  name: 'intro',
  title: 'Introduction',
  type: 'text',
  rows: 3,
  validation: (rule) => rule.max(300).warning('Keep the introduction under 300 characters.'),
})
