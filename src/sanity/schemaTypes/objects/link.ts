import { LinkIcon } from '@sanity/icons/Link'
import { defineField, defineType } from 'sanity'

import { phoneKeys, routableReferenceTargets, systemPageKeys } from '../../lib/options'
import { SLUG_LIKE } from '../../lib/validation'

type LinkKind = 'internal' | 'external' | 'tel' | 'email' | 'anchor'

type LinkValue = {
  kind?: LinkKind
  internal?: { _ref: string }
  systemRoute?: string
  href?: string
  phoneKey?: string
  anchor?: string
}

const parentOf = (context: { parent?: unknown }) => (context.parent ?? {}) as LinkValue
const unless =
  (kind: LinkKind) =>
  ({ parent }: { parent?: unknown }) =>
    (parent as LinkValue | undefined)?.kind !== kind

export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  description:
    'Where the link goes: a page on this site, another website, a phone call, an email or a section of the same page.',
  fields: [
    defineField({
      name: 'kind',
      title: 'Link to',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Page on this site', value: 'internal' },
          { title: 'Other website', value: 'external' },
          { title: 'Phone call', value: 'tel' },
          { title: 'Email', value: 'email' },
          { title: 'Section on this page', value: 'anchor' },
        ],
      },
      initialValue: 'internal',
      validation: (rule) => rule.required().error('Choose where the link goes.'),
    }),
    defineField({
      name: 'systemRoute',
      title: 'Main page',
      type: 'string',
      description: 'Pick a main page here, or choose a specific document below.',
      options: { list: [...systemPageKeys] },
      hidden: unless('internal'),
    }),
    defineField({
      name: 'internal',
      title: 'Document',
      type: 'reference',
      to: routableReferenceTargets,
      weak: true,
      description: 'A page, service, article or legal page in the same language as this document.',
      hidden: unless('internal'),
      options: {
        filter: ({ document }) =>
          typeof document.language === 'string'
            ? { filter: 'language == $language', params: { language: document.language } }
            : { filter: 'defined(language)' },
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const link = parentOf(context)
          if (link.kind !== 'internal') return true
          if (!value && !link.systemRoute) return 'Choose a main page or a document.'
          if (value && link.systemRoute) return 'Choose either a main page or a document, not both.'
          return true
        }),
    }),
    defineField({
      name: 'href',
      title: 'Web address',
      type: 'url',
      description: 'The full address, starting with https://',
      hidden: unless('external'),
      validation: (rule) => [
        rule
          .uri({ scheme: ['https', 'mailto', 'tel'] })
          .error('Use a full address that starts with https://'),
        rule.custom((value, context) =>
          parentOf(context).kind === 'external' && !value ? 'Add the web address.' : true,
        ),
      ],
    }),
    defineField({
      name: 'phoneKey',
      title: 'Phone number',
      type: 'string',
      description: 'The number comes from Site settings → Contact.',
      options: { list: [...phoneKeys], layout: 'radio' },
      initialValue: 'primary',
      hidden: unless('tel'),
      validation: (rule) =>
        rule.custom((value, context) =>
          parentOf(context).kind === 'tel' && !value ? 'Choose which phone number to call.' : true,
        ),
    }),
    defineField({
      name: 'anchor',
      title: 'Section ID',
      type: 'string',
      description: 'The "Anchor ID" of a section on the same page, e.g. "first-visit".',
      hidden: unless('anchor'),
      validation: (rule) =>
        rule.custom((value: string | undefined, context) => {
          if (parentOf(context).kind !== 'anchor') return true
          if (!value) return 'Add the section ID.'
          return SLUG_LIKE.test(value)
            ? true
            : 'Use lowercase Latin letters, numbers and hyphens only, e.g. "first-visit".'
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
      hidden: unless('external'),
    }),
  ],
  preview: {
    select: {
      kind: 'kind',
      systemRoute: 'systemRoute',
      internalTitle: 'internal.title',
      href: 'href',
      phoneKey: 'phoneKey',
      anchor: 'anchor',
    },
    prepare: ({ kind, systemRoute, internalTitle, href, phoneKey, anchor }) => {
      const target: Record<LinkKind, string | undefined> = {
        internal: internalTitle ?? systemRoute,
        external: href,
        tel: phoneKey && `Call (${phoneKey})`,
        email: 'Email (from Site settings)',
        anchor: anchor && `#${anchor}`,
      }
      return { title: target[kind as LinkKind] ?? 'Link', subtitle: kind }
    },
  },
})
