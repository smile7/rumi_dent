import { StarIcon } from '@sanity/icons/Star'
import { defineArrayMember, defineField } from 'sanity'

import { contentIcons } from '../../../config/icons'
import { defineSection } from './base'

export const heroSection = defineSection({
  name: 'hero',
  title: 'Hero',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The main message of the page (H1).',
      validation: (rule) => [
        rule.required().error('Add the heading.'),
        rule.max(80).error('Keep the heading under 80 characters.'),
      ],
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(220).error('Keep the subheading under 220 characters.'),
    }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (rule) => rule.max(2).error('Use at most 2 buttons.'),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
      validation: (rule) => rule.required().error('Add the image.'),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Text beside photo', value: 'split' },
          { title: 'Cut-out photo', value: 'cutout' },
          { title: 'Full-width photo', value: 'fullBleed' },
        ],
      },
      initialValue: 'split',
    }),
    defineField({
      name: 'trustItems',
      title: 'Trust points',
      type: 'array',
      description: 'Up to 4 short facts under the buttons, e.g. «20 години опит».',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'trustItem',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: { list: [...contentIcons] },
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (rule) => [
                rule.required().error('Add the text.'),
                rule.max(40).error('Keep it under 40 characters.'),
              ],
            }),
          ],
          preview: { select: { title: 'text', subtitle: 'icon' } },
        }),
      ],
      validation: (rule) => rule.max(4).error('Use at most 4 trust points.'),
    }),
  ],
})
