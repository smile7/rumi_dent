import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { headingsSkippingLevels } from '../../lib/validation'

const lists = [
  { title: 'Bullet list', value: 'bullet' },
  { title: 'Numbered list', value: 'number' },
]

const marks = {
  decorators: [
    { title: 'Bold', value: 'strong' },
    { title: 'Italic', value: 'em' },
  ],
  annotations: [defineArrayMember({ name: 'link', type: 'link', title: 'Link' })],
}

/** Full rich text for articles, legal pages and text sections. No H1: the page title is the H1. */
export const richTextType = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'array',
  icon: BlockContentIcon,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists,
      marks,
    }),
    defineArrayMember({ type: 'imageWithAlt' }),
    defineArrayMember({ type: 'callout' }),
    defineArrayMember({ type: 'ctaInline' }),
    defineArrayMember({ type: 'cookieTable' }),
    defineArrayMember({ type: 'processorsList' }),
  ],
  validation: (rule) =>
    rule
      .custom((blocks: { _type: string; _key: string; style?: string }[] | undefined) => {
        const offenders = headingsSkippingLevels(blocks)
        if (offenders.length === 0) return true
        return offenders.map((key) => ({
          message:
            'Headings should go in order: start with Heading 2, then Heading 3 under it. Skipping a level confuses screen readers.',
          path: [{ _key: key }],
        }))
      })
      .warning(),
})

/** Short rich text for tiles, bios, FAQ answers: paragraphs, lists, bold/italic and links. */
export const richTextSimpleType = defineType({
  name: 'richTextSimple',
  title: 'Text',
  type: 'array',
  icon: BlockContentIcon,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Paragraph', value: 'normal' }],
      lists,
      marks,
    }),
  ],
})

export const calloutType = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: InfoOutlineIcon,
  description: 'A highlighted box for a tip, a note or a warning.',
  fields: [
    defineField({
      name: 'tone',
      title: 'Type',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Tip', value: 'tip' },
          { title: 'Warning', value: 'warning' },
        ],
      },
      initialValue: 'info',
      validation: (rule) => rule.required().error('Choose the callout type.'),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().error('Add the callout text.'),
    }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'tone' },
  },
})
