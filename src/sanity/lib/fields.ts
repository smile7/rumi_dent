import {
  type ConditionalPropertyCallbackContext,
  defineField,
  getPublishedId,
  type ReferenceFilterSearchOptions,
  type SanityDocument,
  type SlugIsUniqueValidator,
  type ValidationContext,
} from 'sanity'

import { reservedSlugs, SLUG_MAX_LENGTH, slugify } from '../../lib/slug'
import { apiVersion } from '../env'
import { SLUG_LIKE } from './validation'

const languageOf = (document: SanityDocument | undefined) =>
  typeof document?.language === 'string' ? document.language : null

/**
 * True when no other document of the same type and language has `field == value`.
 * Drafts and release versions of the document itself don't count.
 */
export const isUniqueInLanguage = async (
  field: string,
  value: string,
  { document, getClient }: Pick<ValidationContext, 'document' | 'getClient'>,
): Promise<boolean> => {
  if (!document) return true
  return getClient({ apiVersion }).fetch<boolean>(
    `!defined(*[_type == $type && language == $language && ${field} == $value && !sanity::versionOf($id)][0]._id)`,
    {
      type: document._type,
      language: languageOf(document),
      value,
      id: getPublishedId(document._id),
    },
  )
}

const slugIsUnique: SlugIsUniqueValidator = (slug, context) =>
  isUniqueInLanguage('slug.current', slug, context)

type SlugFieldOptions = {
  /** The slug may stay empty (e.g. system pages, whose URL comes from code). */
  optionalWhen?: (document: SanityDocument | undefined) => boolean
  hidden?: (context: ConditionalPropertyCallbackContext) => boolean
}

/** URL slug of a routable document: generated from the title, Latin, unique per type + language. */
export const slugField = ({ optionalWhen, hidden }: SlugFieldOptions = {}) =>
  defineField({
    name: 'slug',
    title: 'URL slug',
    type: 'slug',
    description:
      'The last part of the web address. Click "Generate" to create it from the title. Changing it after publishing breaks links, so ask the developer to add a redirect.',
    hidden,
    options: {
      source: 'title',
      maxLength: SLUG_MAX_LENGTH,
      slugify,
      isUnique: slugIsUnique,
    },
    validation: (rule) =>
      rule.custom((value: { current?: string } | undefined, { document }) => {
        const current = value?.current
        if (!current) return optionalWhen?.(document) ? true : 'Generate or type the URL slug.'
        if (!SLUG_LIKE.test(current))
          return 'Use lowercase Latin letters, numbers and hyphens only. "Generate" does this for you.'
        if (reservedSlugs.has(current))
          return `"${current}" is used by a built-in page of the site. Choose another slug.`
        return true
      }),
  })

/** Reference picker limited to documents in the same language as the edited one. */
export const sameLanguageFilter = ({
  document,
}: {
  document: SanityDocument
}): ReferenceFilterSearchOptions => ({
  filter: 'language == $language && !sanity::versionOf($id)',
  params: { language: languageOf(document), id: getPublishedId(document._id) },
})
