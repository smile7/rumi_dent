import { ComposeIcon } from '@sanity/icons/Compose'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'
import { sameLanguageFilter, slugField } from '../../lib/fields'

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: ComposeIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Authors and dates' },
    { name: 'seo', title: 'SEO' },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  fields: [
    languageField,
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => [
        rule.required().error('Add the title.'),
        rule.max(90).error('Keep the title under 90 characters.'),
      ],
    }),
    slugField(),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown on the blog list and in Google. 80–200 characters.',
      validation: (rule) => [
        rule.required().error('Add the excerpt.'),
        rule
          .min(80)
          .error('Write at least 80 characters, so the excerpt says what the article is about.'),
        rule.max(200).error('Keep the excerpt under 200 characters.'),
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'imageWithAlt',
      group: 'content',
      validation: (rule) => rule.required().error('Add a cover image.'),
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'richText',
      group: 'content',
      validation: (rule) => rule.required().error('Write the article.'),
    }),
    defineField({
      name: 'related',
      title: 'Related articles',
      type: 'array',
      group: 'content',
      description: 'Optional, up to 3. Leave empty to show the latest articles.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
          options: { filter: sameLanguageFilter },
        }),
      ],
      validation: (rule) => [
        rule.max(3).error('Choose up to 3 articles.'),
        rule.unique().error('Each article can be added once.'),
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'teamMember' }],
      group: 'meta',
      description: 'Optional. Shows readers (and Google) who wrote it.',
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Medically reviewed by',
      type: 'reference',
      to: [{ type: 'teamMember' }],
      group: 'meta',
      description: 'Optional. The dentist who checked the medical content.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required().error('Add the publishing date.'),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated on',
      type: 'datetime',
      group: 'meta',
      description:
        'Set it after a real content update. Shown when it is at least a day after publishing.',
      validation: (rule) =>
        rule.min(rule.valueOfField('publishedAt')).error('The update must be after publishing.'),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      hidden: true,
    }),
    defineField({ name: 'seo', title: 'SEO and sharing', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', language: 'language', publishedAt: 'publishedAt', media: 'cover' },
    prepare: ({ title, language, publishedAt, media }) => ({
      title: title ?? 'Untitled article',
      subtitle: [language?.toUpperCase(), publishedAt?.slice(0, 10)].filter(Boolean).join(' · '),
      media,
    }),
  },
})
