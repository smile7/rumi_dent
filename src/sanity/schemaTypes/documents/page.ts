import { DocumentIcon } from '@sanity/icons/Document'
import { HomeIcon } from '@sanity/icons/Home'
import { defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'
import { isUniqueInLanguage, slugField } from '../../lib/fields'
import { systemPageKeys } from '../../lib/options'
import { sectionsField } from '../sections'

const isAdministrator = (user: { roles: { name: string }[] } | null) =>
  Boolean(user?.roles.some((role) => role.name === 'administrator'))

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    languageField,
    defineField({
      name: 'pageKey',
      title: 'Main page',
      type: 'string',
      group: 'content',
      description:
        'Only for the main pages of the site, whose address is fixed (home, services, …). Leave empty for any other page. Locked once set; an administrator can change it.',
      options: { list: [...systemPageKeys] },
      readOnly: ({ value, currentUser }) => Boolean(value) && !isAdministrator(currentUser),
      validation: (rule) =>
        rule.custom(async (value: string | undefined, context) => {
          if (!value) return true
          return (await isUniqueInLanguage('pageKey', value, context))
            ? true
            : 'Another page in this language is already this main page.'
        }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'The main heading of the page (H1) and the default title in Google.',
      validation: (rule) => [
        rule.required().error('Add the page title.'),
        rule.max(70).error('Keep the title under 70 characters.'),
      ],
    }),
    slugField({
      optionalWhen: (document) => Boolean(document?.pageKey),
      hidden: ({ document }) => Boolean(document?.pageKey),
    }),
    defineField({
      name: 'intro',
      title: 'Short introduction',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'One or two sentences. Shown on cards that link here, and in Google when the SEO description is empty.',
      validation: (rule) => rule.max(220).warning('Keep the introduction under 220 characters.'),
    }),
    { ...sectionsField, group: 'content' },
    defineField({ name: 'seo', title: 'SEO and sharing', type: 'seo', group: 'seo' }),
    defineField({
      name: 'hideFromNav',
      title: 'Hide from menus',
      type: 'boolean',
      group: 'seo',
      initialValue: false,
    }),
    defineField({
      name: 'hideFromSitemap',
      title: 'Hide from the sitemap',
      type: 'boolean',
      group: 'seo',
      description:
        'The page stays reachable by its address, but search engines are not told about it.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', pageKey: 'pageKey', language: 'language' },
    prepare: ({ title, slug, pageKey, language }) => ({
      title: title ?? 'Untitled page',
      subtitle: [language?.toUpperCase(), pageKey ? `Main page: ${pageKey}` : slug && `/${slug}`]
        .filter(Boolean)
        .join(' · '),
      media: pageKey ? HomeIcon : DocumentIcon,
    }),
  },
})
