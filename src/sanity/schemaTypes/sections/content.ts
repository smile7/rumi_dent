import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { ComposeIcon } from '@sanity/icons/Compose'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { ImageIcon } from '@sanity/icons/Image'
import { ThLargeIcon } from '@sanity/icons/ThLarge'
import { ThListIcon } from '@sanity/icons/ThList'
import { defineArrayMember, defineField } from 'sanity'

import { contentIcons } from '../../../config/icons'
import { sameLanguageFilter } from '../../lib/fields'
import { duplicateKeys, SLUG_LIKE } from '../../lib/validation'
import { faqCategories } from '../collections/faqItem'
import { defineSection, headingField, introField } from './base'

const sourceIs =
  (source: string) =>
  ({ parent }: { parent?: unknown }) =>
    (parent as { source?: string } | undefined)?.source === source

export const textImageSection = defineSection({
  name: 'textImage',
  title: 'Text and image',
  icon: ImageIcon,
  fields: [
    headingField(),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'richText',
      validation: (rule) => rule.required().error('Add the text.'),
    }),
    defineField({ name: 'image', title: 'Image', type: 'imageWithAlt' }),
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
      },
      initialValue: 'right',
    }),
    defineField({ name: 'cta', title: 'Button', type: 'cta' }),
  ],
})

export const richTextBlockSection = defineSection({
  name: 'richTextBlock',
  title: 'Text',
  icon: BlockContentIcon,
  fields: [
    headingField(),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'richText',
      validation: (rule) => rule.required().error('Add the text.'),
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Reading width', value: 'prose' },
          { title: 'Wide', value: 'wide' },
        ],
      },
      initialValue: 'prose',
    }),
  ],
})

type TileItem = { _key: string; slug?: string }

export const tilesSection = defineSection({
  name: 'tiles',
  title: 'Tiles',
  icon: ThLargeIcon,
  fields: [
    headingField(),
    introField,
    defineField({
      name: 'source',
      title: 'Tiles show',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Services (from the Services list)', value: 'services' },
          { title: 'My own tiles', value: 'manual' },
        ],
      },
      initialValue: 'services',
      validation: (rule) => rule.required().error('Choose what the tiles show.'),
    }),
    defineField({
      name: 'serviceCategory',
      title: 'Only this category',
      type: 'reference',
      to: [{ type: 'serviceCategory' }],
      description: 'Leave empty to show all services, grouped by category.',
      hidden: (context) => !sourceIs('services')(context),
    }),
    defineField({
      name: 'items',
      title: 'Tiles',
      type: 'array',
      hidden: (context) => !sourceIs('manual')(context),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tileItem',
          title: 'Tile',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => [
                rule.required().error('Add the title.'),
                rule.max(60).error('Keep the title under 60 characters.'),
              ],
            }),
            defineField({
              name: 'teaser',
              title: 'Teaser',
              type: 'string',
              validation: (rule) => rule.max(120).error('Keep the teaser under 120 characters.'),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: { list: [...contentIcons] },
            }),
            defineField({ name: 'image', title: 'Image', type: 'imageWithAlt' }),
            defineField({
              name: 'body',
              title: 'Text when opened',
              type: 'richTextSimple',
            }),
            defineField({ name: 'cta', title: 'Button', type: 'cta' }),
            defineField({
              name: 'slug',
              title: 'Link ID',
              type: 'string',
              description:
                'Optional. Opens this tile from a link, e.g. "braces" for …#braces. Unique in the section.',
              validation: (rule) =>
                rule.custom((value: string | undefined) =>
                  !value || SLUG_LIKE.test(value)
                    ? true
                    : 'Use lowercase Latin letters, numbers and hyphens only.',
                ),
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'teaser' } },
        }),
      ],
      validation: (rule) =>
        rule.custom((items: TileItem[] | undefined, context) => {
          if (!sourceIs('manual')(context)) return true
          if (!items || items.length < 2) return 'Add at least 2 tiles.'
          if (items.length > 8) return 'Use at most 8 tiles.'
          const duplicates = duplicateKeys(items, (item) => item.slug)
          return duplicates.length === 0
            ? true
            : duplicates.map(({ _key, value }) => ({
                message: `The link ID "${value}" is already used by another tile.`,
                path: [{ _key }, 'slug'],
              }))
        }),
    }),
    defineField({
      name: 'allowMultiple',
      title: 'Allow several tiles open at once',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'density',
      title: 'Density',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Comfortable', value: 'comfortable' },
          { title: 'Compact', value: 'compact' },
        ],
      },
      initialValue: 'comfortable',
    }),
  ],
})

export const processStepsSection = defineSection({
  name: 'processSteps',
  title: 'Steps',
  icon: ThListIcon,
  fields: [
    headingField(),
    introField,
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          title: 'Step',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => [
                rule.required().error('Add the title.'),
                rule.max(50).error('Keep the title under 50 characters.'),
              ],
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(220).error('Keep the text under 220 characters.'),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: { list: [...contentIcons] },
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
      validation: (rule) => [
        rule.required().error('Add the steps.'),
        rule.min(3).error('Add at least 3 steps.'),
        rule.max(6).error('Use at most 6 steps.'),
      ],
    }),
    defineField({ name: 'cta', title: 'Button', type: 'cta' }),
  ],
})

export const faqSection = defineSection({
  name: 'faq',
  title: 'Questions (FAQ)',
  icon: HelpCircleIcon,
  fields: [
    headingField(),
    introField,
    defineField({
      name: 'source',
      title: 'Questions shown',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'All questions', value: 'all' },
          { title: 'One category', value: 'category' },
          { title: 'Hand-picked', value: 'selected' },
        ],
      },
      initialValue: 'all',
      validation: (rule) => rule.required().error('Choose which questions to show.'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: faqCategories },
      hidden: (context) => !sourceIs('category')(context),
      validation: (rule) =>
        rule.custom((value, context) =>
          sourceIs('category')(context) && !value ? 'Choose the category.' : true,
        ),
    }),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faqItem' }] })],
      hidden: (context) => !sourceIs('selected')(context),
      validation: (rule) => [
        rule.unique().error('Each question can be added once.'),
        rule.custom((value: unknown[] | undefined, context) =>
          sourceIs('selected')(context) && !value?.length ? 'Choose the questions.' : true,
        ),
      ],
    }),
    defineField({
      name: 'emitSchema',
      title: 'Mark as FAQ for Google',
      type: 'boolean',
      description:
        'Adds FAQ structured data for search engines. Only one FAQ section per page can have it.',
      initialValue: true,
    }),
  ],
})

export const blogTeaserSection = defineSection({
  name: 'blogTeaser',
  title: 'Blog articles',
  icon: ComposeIcon,
  fields: [
    headingField(),
    defineField({
      name: 'mode',
      title: 'Articles shown',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Latest', value: 'latest' },
          { title: 'Hand-picked', value: 'selected' },
        ],
      },
      initialValue: 'latest',
    }),
    defineField({
      name: 'articles',
      title: 'Articles',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
          options: { filter: sameLanguageFilter },
        }),
      ],
      hidden: ({ parent }) => (parent as { mode?: string } | undefined)?.mode !== 'selected',
      validation: (rule) => [
        rule.max(3).error('Choose up to 3 articles.'),
        rule.unique().error('Each article can be added once.'),
        rule.custom((value: unknown[] | undefined, { parent }) =>
          (parent as { mode?: string } | undefined)?.mode === 'selected' && !value?.length
            ? 'Choose the articles.'
            : true,
        ),
      ],
    }),
    defineField({
      name: 'count',
      title: 'Number of articles',
      type: 'number',
      hidden: ({ parent }) => (parent as { mode?: string } | undefined)?.mode === 'selected',
      initialValue: 3,
      validation: (rule) => rule.min(1).max(6).integer().error('Choose between 1 and 6.'),
    }),
  ],
})
