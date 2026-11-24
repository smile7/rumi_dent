import { MenuIcon } from '@sanity/icons/Menu'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

const labelField = defineField({
  name: 'label',
  title: 'Text',
  type: 'internationalizedArrayString',
  validation: (rule) => rule.custom(validateI18n({ required: 'Add the link text.', max: 40 })),
})

const linkField = defineField({
  name: 'link',
  title: 'Link',
  type: 'link',
  validation: (rule) => rule.required().error('Choose where the link goes.'),
})

const linkPreview = {
  select: { label: 'label', subtitle: 'link.kind' },
  prepare: ({ label, subtitle }: { label?: I18nRow<string>[]; subtitle?: string }) => ({
    title: i18nValue(label) ?? 'Link',
    subtitle,
  }),
}

const navLink = defineArrayMember({
  name: 'navLink',
  title: 'Link',
  type: 'object',
  fields: [labelField, linkField],
  preview: linkPreview,
})

export const navigationType = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'header',
      title: 'Main menu',
      type: 'array',
      description:
        'Up to 6 items. An item can open a dropdown with up to 8 links. Phones show everything.',
      of: [
        defineArrayMember({
          name: 'navItem',
          title: 'Menu item',
          type: 'object',
          fields: [
            labelField,
            linkField,
            defineField({
              name: 'children',
              title: 'Dropdown links',
              type: 'array',
              description: 'Optional. Leave empty for a plain link.',
              of: [navLink],
              validation: (rule) => rule.max(8).error('A dropdown can have up to 8 links.'),
            }),
          ],
          preview: linkPreview,
        }),
      ],
      validation: (rule) =>
        rule.max(6).error('Keep the main menu to 6 items so it fits on one line.'),
    }),
    defineField({
      name: 'headerCta',
      title: 'Header button',
      type: 'ctaI18n',
      description: 'Usually "Book an appointment" or "Call".',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer columns',
      type: 'array',
      description: 'Up to 4 columns of links.',
      of: [
        defineArrayMember({
          name: 'footerColumn',
          title: 'Column',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Column title',
              type: 'internationalizedArrayString',
              validation: (rule) =>
                rule.custom(validateI18n({ required: 'Add the column title.' })),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [navLink],
              validation: (rule) => rule.min(1).error('Add at least one link.'),
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: i18nValue(title as I18nRow<string>[]) ?? 'Column' }),
          },
        }),
      ],
      validation: (rule) => rule.max(4).error('Use up to 4 footer columns.'),
    }),
    defineField({
      name: 'mobileActionBar',
      title: 'Phone call bar',
      type: 'object',
      description: 'The bar at the bottom of the screen on phones. "Call" is always shown.',
      fields: [
        defineField({
          name: 'showDirections',
          title: 'Show "Directions"',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'secondaryAction',
          title: 'Extra button',
          type: 'string',
          options: {
            list: [
              { title: 'None', value: 'none' },
              { title: 'Book an appointment', value: 'booking' },
              { title: 'Viber', value: 'viber' },
              { title: 'WhatsApp', value: 'whatsapp' },
              { title: 'Email', value: 'email' },
            ],
          },
          initialValue: 'none',
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Navigation' }),
  },
})
