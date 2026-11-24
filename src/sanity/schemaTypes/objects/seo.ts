import { SearchIcon } from '@sanity/icons/Search'
import { defineField, defineType } from 'sanity'

/** Search and sharing settings of one language-specific document. Every field has a fallback. */
export const seoType = defineType({
  name: 'seo',
  title: 'SEO and sharing',
  type: 'object',
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Title in Google',
      type: 'string',
      description: 'Leave empty to use the document title. Best between 30 and 60 characters.',
      validation: (rule) => [
        rule
          .min(30)
          .warning('Short titles waste space in Google results. Aim for 30–60 characters.'),
        rule.max(60).warning('Google cuts titles after about 60 characters.'),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description in Google',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences that make people click. Leave empty to use the summary. Best between 70 and 160 characters.',
      validation: (rule) => [
        rule.min(70).warning('Aim for 70–160 characters so Google shows a full snippet.'),
        rule.max(160).warning('Google cuts descriptions after about 160 characters.'),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Sharing image',
      type: 'imageWithAlt',
      description:
        'Shown when the page is shared on Facebook, Viber etc. Cropped to 1200×630, so set the hotspot. Leave empty to use the main image.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'Only for pages that should not appear in Google (e.g. a thank-you page).',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalOverride',
      title: 'Canonical address',
      type: 'url',
      description: 'Rarely needed. Only if this content is published first at another address.',
      validation: (rule) => rule.uri({ scheme: ['https'] }).error('Use a full https:// address.'),
    }),
  ],
})
