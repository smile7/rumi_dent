import { LaunchIcon } from '@sanity/icons/Launch'
import { defineField, defineType } from 'sanity'

import { buttonStyles } from '../../lib/options'
import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

type CtaValue = { action?: string }

const LABEL_MAX = 32

const actionField = defineField({
  name: 'action',
  title: 'What the button does',
  type: 'string',
  description:
    '"Call", "Book" and "Directions" use the phone, booking and address from Site settings.',
  options: {
    layout: 'radio',
    list: [
      { title: 'Open a link', value: 'link' },
      { title: 'Call', value: 'call' },
      { title: 'Book an appointment', value: 'booking' },
      { title: 'Directions', value: 'directions' },
    ],
  },
  initialValue: 'link',
  validation: (rule) => rule.required().error('Choose what the button does.'),
})

const linkField = defineField({
  name: 'link',
  title: 'Link',
  type: 'link',
  hidden: ({ parent }) => (parent as CtaValue | undefined)?.action !== 'link',
  validation: (rule) =>
    rule.custom((value, context) =>
      (context.parent as CtaValue | undefined)?.action === 'link' && !value
        ? 'Choose where the button links to.'
        : true,
    ),
})

const styleField = defineField({
  name: 'style',
  title: 'Style',
  type: 'string',
  options: { list: [...buttonStyles], layout: 'radio', direction: 'horizontal' },
  initialValue: 'primary',
})

const actionTitles: Record<string, string> = {
  link: 'Link',
  call: 'Call',
  booking: 'Booking',
  directions: 'Directions',
}

/** Button inside language-specific documents (pages, services, articles): plain-text label. */
export const ctaFields = [
  defineField({
    name: 'label',
    title: 'Button text',
    type: 'string',
    description: `Short and active, e.g. "Book a visit". Max ${LABEL_MAX} characters.`,
    validation: (rule) => [
      rule.required().error('Add the button text.'),
      rule.max(LABEL_MAX).error(`Keep the button text under ${LABEL_MAX} characters.`),
    ],
  }),
  actionField,
  linkField,
  styleField,
]

export const ctaType = defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  icon: LaunchIcon,
  fields: ctaFields,
  preview: {
    select: { title: 'label', action: 'action' },
    prepare: ({ title, action }) => ({ title: title ?? 'Button', subtitle: actionTitles[action] }),
  },
})

/** A button between paragraphs of rich text. */
export const ctaInlineType = defineType({
  name: 'ctaInline',
  title: 'Button',
  type: 'object',
  icon: LaunchIcon,
  fields: ctaFields,
  preview: ctaType.preview,
})

/** Button inside shared documents (navigation, announcements): one label per language. */
export const ctaI18nType = defineType({
  name: 'ctaI18n',
  title: 'Button',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Button text',
      type: 'internationalizedArrayString',
      description: `Short and active, e.g. "Book a visit". Max ${LABEL_MAX} characters.`,
      validation: (rule) =>
        rule.custom(validateI18n({ required: 'Add the button text.', max: LABEL_MAX })),
    }),
    actionField,
    linkField,
    styleField,
  ],
  preview: {
    select: { label: 'label', action: 'action' },
    prepare: ({ label, action }) => ({
      title: i18nValue(label as I18nRow<string>[]) ?? 'Button',
      subtitle: actionTitles[action],
    }),
  },
})
