import { BellIcon } from '@sanity/icons/Bell'
import { defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

export const announcementType = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  icon: BellIcon,
  description:
    'A short banner at the top of the site. It appears and disappears on its own between the start and end time.',
  fields: [
    defineField({
      name: 'message',
      title: 'Message',
      type: 'internationalizedArrayString',
      description: 'One short sentence. Max 140 characters.',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the message.', max: 140 })),
    }),
    defineField({
      name: 'link',
      title: 'Button',
      type: 'ctaI18n',
      description: 'Optional, e.g. "Read more".',
    }),
    defineField({
      name: 'tone',
      title: 'Type',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Promotion', value: 'promo' },
          { title: 'Warning', value: 'warning' },
        ],
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'startsAt',
      title: 'Show from',
      type: 'datetime',
      validation: (rule) => rule.required().error('Choose when the banner starts.'),
    }),
    defineField({
      name: 'endsAt',
      title: 'Show until',
      type: 'datetime',
      description: 'Optional. Leave empty to show it until you remove it.',
      validation: (rule) =>
        rule.custom((endsAt: string | undefined, context) => {
          const startsAt = (context.document as { startsAt?: string } | undefined)?.startsAt
          return !endsAt || !startsAt || Date.parse(endsAt) > Date.parse(startsAt)
            ? true
            : 'The end must be after the start.'
        }),
    }),
    defineField({
      name: 'dismissible',
      title: 'Visitors can close it',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'pages',
      title: 'Show on',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'All pages', value: 'all' },
          { title: 'Home page only', value: 'home' },
        ],
      },
      initialValue: 'all',
    }),
  ],
  preview: {
    select: { message: 'message', startsAt: 'startsAt', endsAt: 'endsAt' },
    prepare: ({ message, startsAt, endsAt }) => ({
      title: i18nValue(message as I18nRow<string>[]) ?? 'Announcement',
      subtitle: [startsAt?.slice(0, 10), endsAt?.slice(0, 10)].filter(Boolean).join(' → '),
    }),
  },
})
