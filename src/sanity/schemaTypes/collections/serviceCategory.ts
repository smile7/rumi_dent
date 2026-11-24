import { TagIcon } from '@sanity/icons/Tag'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

import { type I18nRow, SLUG_LIKE, i18nValue, validateI18n } from '../../lib/validation'

export const serviceCategoryType = defineType({
  name: 'serviceCategory',
  title: 'Service category',
  type: 'document',
  icon: TagIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'internationalizedArrayString',
      description: 'e.g. «Детска стоматология» / "Children\'s dentistry".',
      validation: (rule) =>
        rule.custom(validateI18n({ required: 'Add the category name.', max: 60 })),
    }),
    defineField({
      name: 'slug',
      title: 'Anchor',
      type: 'internationalizedArraySlug',
      description:
        'Optional short ID for links to this group on the services page, e.g. "detska-stomatologiya".',
      validation: (rule) =>
        rule.custom((rows: I18nRow<{ current?: string }>[] | undefined) => {
          const invalid = rows?.filter(
            (row) => row.value?.current && !SLUG_LIKE.test(row.value.current),
          )
          return invalid?.length
            ? invalid.map((row) => ({
                message: 'Use lowercase Latin letters, numbers and hyphens only.',
                path: [{ _key: row._key }, 'value'],
              }))
            : true
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayText',
      description: 'Optional one or two sentences shown above the services of this category.',
    }),
    defineField({
      name: 'audience',
      title: 'For whom',
      type: 'string',
      description: 'Groups the services page. Children are listed first.',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Children', value: 'children' },
          { title: 'Adults', value: 'adults' },
          { title: 'Everyone', value: 'everyone' },
        ],
      },
      initialValue: 'everyone',
      validation: (rule) => rule.required().error('Choose who the category is for.'),
    }),
    defineField({
      name: 'tone',
      title: 'Colour',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Soft', value: 'soft' },
          { title: 'Brand', value: 'brand' },
          { title: 'Accent', value: 'accent' },
        ],
      },
      initialValue: 'soft',
    }),
    orderRankField({ type: 'serviceCategory' }),
  ],
  preview: {
    select: { title: 'title', audience: 'audience' },
    prepare: ({ title, audience }) => ({
      title: i18nValue(title as I18nRow<string>[]) ?? 'Category',
      subtitle: audience,
    }),
  },
})
