import { CalendarIcon } from '@sanity/icons/Calendar'
import { ClockIcon } from '@sanity/icons/Clock'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { MobileDeviceIcon } from '@sanity/icons/MobileDevice'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { phoneKeys, weekdays } from '../../lib/options'
import {
  E164,
  type I18nRow,
  TIME,
  closesAfterOpens,
  i18nValue,
  validateI18n,
} from '../../lib/validation'

const timeRule =
  (message: string) =>
  (value: string | undefined): true | string =>
    !value || TIME.test(value) ? true : message

const TIME_FORMAT = 'Use the 24-hour format HH:mm, e.g. 09:00 or 18:30.'

export const phoneType = defineType({
  name: 'phone',
  title: 'Phone number',
  type: 'object',
  icon: MobileDeviceIcon,
  fields: [
    defineField({
      name: 'key',
      title: 'Which number',
      type: 'string',
      description: 'Buttons and the call bar use the primary number.',
      options: { list: [...phoneKeys], layout: 'radio', direction: 'horizontal' },
      initialValue: 'primary',
      validation: (rule) => rule.required().error('Choose primary or secondary.'),
    }),
    defineField({
      name: 'e164',
      title: 'Number for dialling',
      type: 'string',
      description: 'International format without spaces, e.g. +359888123456.',
      validation: (rule) => [
        rule.required().error('Add the phone number.'),
        rule
          .regex(E164)
          .error('Write the number as +359 followed by the digits, without spaces or dashes.'),
      ],
    }),
    defineField({
      name: 'display',
      title: 'Number as shown',
      type: 'string',
      description: 'How visitors read it, e.g. 0888 123 456.',
      validation: (rule) => rule.required().error('Add the number as it should be shown.'),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'internationalizedArrayString',
      description: 'Optional, e.g. "Reception" or "Mobile".',
    }),
  ],
  preview: {
    select: { title: 'display', subtitle: 'key' },
  },
})

export const openingHoursSpecType = defineType({
  name: 'openingHoursSpec',
  title: 'Opening hours',
  type: 'object',
  icon: ClockIcon,
  description: 'Days that are not listed in any row are shown as closed.',
  fields: [
    defineField({
      name: 'days',
      title: 'Days',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...weekdays], layout: 'grid' },
      validation: (rule) => [
        rule.required().min(1).error('Choose at least one day.'),
        rule.unique().error('Each day only once.'),
      ],
    }),
    defineField({
      name: 'opens',
      title: 'Opens',
      type: 'string',
      placeholder: '09:00',
      validation: (rule) => [
        rule.required().error('Add the opening time.'),
        rule.custom(timeRule(TIME_FORMAT)),
      ],
    }),
    defineField({
      name: 'closes',
      title: 'Closes',
      type: 'string',
      placeholder: '18:00',
      validation: (rule) => [
        rule.required().error('Add the closing time.'),
        rule.custom(timeRule(TIME_FORMAT)),
        rule.custom((closes: string | undefined, context) =>
          closesAfterOpens((context.parent as { opens?: string } | undefined)?.opens, closes)
            ? true
            : 'The closing time must be after the opening time.',
        ),
      ],
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'internationalizedArrayString',
      description: 'Optional, e.g. "By appointment only".',
    }),
  ],
  preview: {
    select: { days: 'days', opens: 'opens', closes: 'closes' },
    prepare: ({ days, opens, closes }) => ({
      title: Array.isArray(days) && days.length > 0 ? days.join(', ') : 'Opening hours',
      subtitle: opens && closes ? `${opens}–${closes}` : undefined,
    }),
  },
})

type SpecialHoursValue = { date?: string; endDate?: string; closed?: boolean; opens?: string }

const isClosed = ({ parent }: { parent?: unknown }) =>
  Boolean((parent as SpecialHoursValue | undefined)?.closed)

export const specialHoursType = defineType({
  name: 'specialHours',
  title: 'Holiday or exception',
  type: 'object',
  icon: CalendarIcon,
  description: 'Shown on the website from 14 days before the date.',
  fields: [
    defineField({
      name: 'label',
      title: 'Name',
      type: 'internationalizedArrayString',
      description: 'Optional, e.g. "Christmas".',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (rule) => rule.required().error('Choose the date.'),
    }),
    defineField({
      name: 'endDate',
      title: 'Until (optional)',
      type: 'date',
      description: 'For a period of several days.',
      validation: (rule) =>
        rule.custom((endDate: string | undefined, context) => {
          const date = (context.parent as SpecialHoursValue | undefined)?.date
          return !endDate || !date || endDate >= date
            ? true
            : 'The end date must be on or after the start date.'
        }),
    }),
    defineField({
      name: 'closed',
      title: 'Closed all day',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'opens',
      title: 'Opens',
      type: 'string',
      placeholder: '09:00',
      hidden: isClosed,
      validation: (rule) =>
        rule
          .custom(timeRule(TIME_FORMAT))
          .custom((value, context) =>
            !isClosed(context) && !value ? 'Add the opening time, or tick "Closed all day".' : true,
          ),
    }),
    defineField({
      name: 'closes',
      title: 'Closes',
      type: 'string',
      placeholder: '14:00',
      hidden: isClosed,
      validation: (rule) =>
        rule.custom(timeRule(TIME_FORMAT)).custom((value: string | undefined, context) => {
          if (isClosed(context)) return true
          if (!value) return 'Add the closing time, or tick "Closed all day".'
          return closesAfterOpens((context.parent as SpecialHoursValue).opens, value)
            ? true
            : 'The closing time must be after the opening time.'
        }),
    }),
  ],
  preview: {
    select: {
      label: 'label',
      date: 'date',
      endDate: 'endDate',
      closed: 'closed',
      opens: 'opens',
      closes: 'closes',
    },
    prepare: ({ label, date, endDate, closed, opens, closes }) => ({
      title: i18nValue(label as I18nRow<string>[]) ?? 'Exception',
      subtitle: [endDate ? `${date} – ${endDate}` : date, closed ? 'closed' : `${opens}–${closes}`]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

const socialPlatforms = [
  { title: 'Facebook', value: 'facebook' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'TikTok', value: 'tiktok' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Viber', value: 'viber' },
  { title: 'WhatsApp', value: 'whatsapp' },
  { title: 'Google Business Profile', value: 'googleBusiness' },
  { title: 'Other', value: 'other' },
]

export const socialLinkType = defineType({
  name: 'socialLink',
  title: 'Social profile',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: socialPlatforms },
      validation: (rule) => rule.required().error('Choose the platform.'),
    }),
    defineField({
      name: 'url',
      title: 'Profile address',
      type: 'url',
      description: 'Viber and WhatsApp links may start with viber:// or https://wa.me/.',
      validation: (rule) => [
        rule.required().error('Add the profile address.'),
        rule
          .uri({ scheme: ['https', 'viber'] })
          .error('Use a full address that starts with https://'),
      ],
    }),
    defineField({
      name: 'label',
      title: 'Name',
      type: 'internationalizedArrayString',
      description: 'Shown for "Other" platforms.',
      hidden: ({ parent }) => (parent as { platform?: string } | undefined)?.platform !== 'other',
      validation: (rule) =>
        rule.custom((rows: I18nRow[] | undefined, context) =>
          (context.parent as { platform?: string } | undefined)?.platform === 'other'
            ? validateI18n({ required: 'Add a name for this profile.' })(rows)
            : true,
        ),
    }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'url' },
  },
})
