import { CommentIcon } from '@sanity/icons/Comment'
import { defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  description:
    'Patient reviews are medical advertising: the clinic confirms each one follows the professional ethics rules before publishing.',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'internationalizedArrayText',
      description: "In the patient's own words. Max 400 characters.",
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the quote.', max: 400 })),
    }),
    defineField({
      name: 'authorName',
      title: 'Author',
      type: 'string',
      description:
        'First name or initials only, e.g. "Maria, mother of Niki (5)". Never a full name.',
      validation: (rule) => rule.required().error('Add the first name or initials of the author.'),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Optional, 1 to 5 stars.',
      options: { list: [1, 2, 3, 4, 5], layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.integer().min(1).max(5).error('Choose 1 to 5 stars.'),
    }),
    defineField({ name: 'date', title: 'Date', type: 'date' }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      // `google` is reserved for the Google reviews integration (CONTENT-MODEL §6).
      options: { list: [{ title: 'Received by the clinic', value: 'manual' }] },
      initialValue: 'manual',
      readOnly: true,
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Link to the original',
      type: 'url',
      description: 'Optional.',
      validation: (rule) => rule.uri({ scheme: ['https'] }).error('Use a full https:// address.'),
    }),
    defineField({
      name: 'consentOnFile',
      title: 'Consent is on file',
      type: 'boolean',
      description: 'The author agreed in writing that the clinic may publish this quote.',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as { source?: string } | undefined)?.source !== 'google' &&
          value !== true
            ? "A testimonial can only be published with the author's written consent. Confirm the consent is stored at the clinic."
            : true,
        ),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: "Shown when a testimonials section doesn't pick specific ones.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { quote: 'quote', author: 'authorName', featured: 'featured' },
    prepare: ({ quote, author, featured }) => ({
      title: i18nValue(quote as I18nRow<string>[]) ?? 'Testimonial',
      subtitle: [author, featured ? 'featured' : undefined].filter(Boolean).join(' · '),
    }),
  },
})
