import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineField, defineType } from 'sanity'

import { languageField } from '../../i18n'
import { isUniqueInLanguage, slugField } from '../../lib/fields'
import { placeholdersIn } from '../../lib/validation'

export const legalPageType = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    languageField,
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Privacy policy', value: 'privacy' },
          { title: 'Cookie policy', value: 'cookies' },
          { title: 'GDPR / patient data', value: 'gdpr' },
          { title: 'Terms of use', value: 'terms' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (rule) => [
        rule.required().error('Choose the kind of legal page.'),
        rule.custom(async (value: string | undefined, context) => {
          if (!value || value === 'other') return true
          return (await isUniqueInLanguage('kind', value, context))
            ? true
            : 'This language already has a legal page of this kind.'
        }),
      ],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => [
        rule.required().error('Add the title.'),
        rule.max(70).error('Keep the title under 70 characters.'),
      ],
    }),
    slugField(),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'richText',
      description:
        "Replace every [[placeholder]] with the clinic's details. The page cannot be published while one is left.",
      validation: (rule) =>
        rule.custom((value: Parameters<typeof placeholdersIn>[0]) => {
          if (!value?.length) return 'Add the text.'
          const left = placeholdersIn(value)
          return left.length === 0
            ? true
            : `Replace these placeholders before publishing: ${left.join(', ')}`
        }),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      description: 'Shown on the page. Change it whenever the content changes.',
      validation: (rule) => rule.required().error('Add the date of the last update.'),
    }),
  ],
  preview: {
    select: { title: 'title', language: 'language', kind: 'kind' },
    prepare: ({ title, language, kind }) => ({
      title: title ?? 'Untitled legal page',
      subtitle: [language?.toUpperCase(), kind].filter(Boolean).join(' · '),
    }),
  },
})
