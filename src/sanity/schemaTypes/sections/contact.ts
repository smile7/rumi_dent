import { LaunchIcon } from '@sanity/icons/Launch'
import { PinIcon } from '@sanity/icons/Pin'
import { defineArrayMember, defineField } from 'sanity'

import { defineSection, headingField } from './base'

export const contactHoursSection = defineSection({
  name: 'contactHours',
  title: 'Contact and hours',
  icon: PinIcon,
  fields: [
    headingField(),
    defineField({
      name: 'showMap',
      title: 'Show the map',
      type: 'boolean',
      description: 'Address, phones and hours come from Site settings.',
      initialValue: true,
    }),
    defineField({
      name: 'showForm',
      title: 'Show the contact form',
      type: 'boolean',
      description: 'Only on the Contact page.',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, { document }) =>
          value && document?.pageKey !== 'contact'
            ? 'The contact form can only be shown on the Contact page.'
            : true,
        ),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'text',
      rows: 2,
      description: 'Optional, e.g. «Паркиране в двора».',
      validation: (rule) => rule.max(200).warning('Keep the note under 200 characters.'),
    }),
  ],
})

export const ctaBandSection = defineSection({
  name: 'ctaBand',
  title: 'Call to action',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => [
        rule.required().error('Add the heading.'),
        rule.max(80).error('Keep the heading under 80 characters.'),
      ],
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(220).warning('Keep the text under 220 characters.'),
    }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (rule) => [
        rule.required().error('Add a button.'),
        rule.min(1).error('Add a button.'),
        rule.max(2).error('Use at most 2 buttons.'),
      ],
    }),
  ],
})
