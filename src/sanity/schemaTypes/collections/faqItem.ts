import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

export const faqCategories = [
  { title: 'General', value: 'general' },
  { title: 'First visit', value: 'firstVisit' },
  { title: 'Children', value: 'children' },
  { title: 'Adults', value: 'adults' },
  { title: 'Prices', value: 'prices' },
  { title: 'Emergencies', value: 'emergencies' },
]

export const faqItemType = defineType({
  name: 'faqItem',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'internationalizedArrayString',
      description: 'Written the way patients ask it. Max 140 characters.',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the question.', max: 140 })),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'internationalizedArrayRichTextSimple',
      description:
        'Start with a one-sentence direct answer, then explain. Google and AI assistants quote the first sentence.',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the answer.' })),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: faqCategories },
      initialValue: 'general',
      validation: (rule) => rule.required().error('Choose a category.'),
    }),
    orderRankField({ type: 'faqItem' }),
  ],
  preview: {
    select: { question: 'question', category: 'category' },
    prepare: ({ question, category }) => ({
      title: i18nValue(question as I18nRow<string>[]) ?? 'Question',
      subtitle: category,
    }),
  },
})
