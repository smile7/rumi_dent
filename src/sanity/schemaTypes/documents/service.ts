import { CaseIcon } from '@sanity/icons/Case'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { contentIcons } from '../../../config/icons'
import { languageField } from '../../i18n'
import { slugField } from '../../lib/fields'

type ServiceDraft = { icon?: string; image?: { asset?: unknown }; hasDetailPage?: boolean }

export const serviceType = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: CaseIcon,
  orderings: [orderRankOrdering],
  groups: [
    { name: 'tile', title: 'Tile', default: true },
    { name: 'detail', title: 'Detail page' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    languageField,
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      group: 'tile',
      description: 'e.g. «Лечение на кариес» / "Cavity treatment".',
      validation: (rule) => [
        rule.required().error('Add the service name.'),
        rule.max(60).error('Keep the name under 60 characters.'),
      ],
    }),
    slugField(),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'serviceCategory' }],
      group: 'tile',
      validation: (rule) => rule.required().error('Choose the category.'),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      group: 'tile',
      description: 'Shown on the tile. Choose an icon or upload an image below.',
      options: { list: [...contentIcons] },
      validation: (rule) =>
        rule.custom((value, { document }) => {
          const service = document as ServiceDraft | undefined
          return value || service?.image?.asset ? true : 'Choose an icon or add an image.'
        }),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
      group: 'tile',
      description: 'Optional. Used instead of the icon when set.',
    }),
    defineField({
      name: 'teaser',
      title: 'Teaser',
      type: 'string',
      group: 'tile',
      description: 'One line on the closed tile.',
      validation: (rule) => [
        rule.required().error('Add the teaser.'),
        rule.max(120).error('Keep the teaser under 120 characters.'),
      ],
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'richTextSimple',
      group: 'tile',
      description: 'What the patient needs to know. Shown when the tile opens.',
      validation: (rule) => rule.required().error('Add the summary.'),
    }),
    defineField({
      name: 'durationNote',
      title: 'Duration',
      type: 'string',
      group: 'tile',
      description: 'Optional free text, e.g. «около 30 минути».',
    }),
    defineField({
      name: 'priceNote',
      title: 'Price',
      type: 'string',
      group: 'tile',
      description: 'Optional free text, e.g. «от 60 €».',
    }),
    defineField({
      name: 'hasDetailPage',
      title: 'Has its own page',
      type: 'boolean',
      group: 'detail',
      description: 'Adds a "Read more" link on the tile and a page with the text below.',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Page text',
      type: 'richText',
      group: 'detail',
      hidden: ({ document }) => !(document as ServiceDraft | undefined)?.hasDetailPage,
      validation: (rule) =>
        rule.custom((value: unknown[] | undefined, { document }) =>
          (document as ServiceDraft | undefined)?.hasDetailPage && !value?.length
            ? 'Add the page text, or untick "Has its own page".'
            : true,
        ),
    }),
    defineField({
      name: 'faq',
      title: 'Questions',
      type: 'array',
      group: 'detail',
      description: 'Optional frequently asked questions about this service.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faqItem' }] })],
      validation: (rule) => rule.unique().error('Each question can be added once.'),
    }),
    defineField({
      name: 'doctors',
      title: 'Doctors',
      type: 'array',
      group: 'detail',
      description: 'Optional. The team members who offer this service.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'teamMember' }] })],
      validation: (rule) => rule.unique().error('Each person can be added once.'),
    }),
    defineField({ name: 'seo', title: 'SEO and sharing', type: 'seo', group: 'seo' }),
    orderRankField({ type: 'service' }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
      teaser: 'teaser',
      media: 'image',
    },
    prepare: ({ title, language, teaser, media }) => ({
      title: title ?? 'Untitled service',
      subtitle: [language?.toUpperCase(), teaser].filter(Boolean).join(' · '),
      media,
    }),
  },
})
