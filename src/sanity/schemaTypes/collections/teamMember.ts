import { UserIcon } from '@sanity/icons/User'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  icon: UserIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Shown as written, e.g. «Мария Иванова».',
      validation: (rule) => rule.required().error('Add the name.'),
    }),
    defineField({
      name: 'nameLatin',
      title: 'Name in Latin letters',
      type: 'string',
      description: 'Optional. Used on English pages, e.g. "Maria Ivanova".',
    }),
    defineField({
      name: 'honorific',
      title: 'Title',
      type: 'internationalizedArrayString',
      description: 'Optional, e.g. «д-р» / "Dr.".',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'internationalizedArrayString',
      description: 'e.g. «Детски зъболекар» / "Pediatric dentist".',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the role.', max: 60 })),
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      description: 'Optional short tags, e.g. "Orthodontics".',
      of: [
        defineArrayMember({
          name: 'specialty',
          title: 'Specialty',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Specialty',
              type: 'internationalizedArrayString',
              validation: (rule) =>
                rule.custom(validateI18n({ required: 'Add the specialty.', max: 40 })),
            }),
          ],
          preview: {
            select: { label: 'label' },
            prepare: ({ label }) => ({
              title: i18nValue(label as I18nRow<string>[]) ?? 'Specialty',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'bioShort',
      title: 'Short bio',
      type: 'internationalizedArrayText',
      description: 'Two or three sentences for the team cards. Max 300 characters.',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add a short bio.', max: 300 })),
    }),
    defineField({
      name: 'bio',
      title: 'Full bio',
      type: 'internationalizedArrayRichTextSimple',
      description: 'Optional longer text.',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'imageWithAlt',
      description: 'A real, recent photo. Portrait orientation works best.',
      validation: (rule) => rule.required().error('Add a photo.'),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Shown first and larger in the team section. Usually one person.',
      initialValue: false,
    }),
    defineField({
      name: 'yearsExperience',
      title: 'Years of experience',
      type: 'number',
      description: 'Shown on team cards, e.g. 12.',
      validation: (rule) => rule.min(0).max(60).integer(),
    }),
    defineField({
      name: 'categories',
      title: 'Works in',
      type: 'array',
      description: "Links the person to children's and/or adult services.",
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'serviceCategory' }] })],
      validation: (rule) => rule.unique().error('Each category only once.'),
    }),
    defineField({
      name: 'credentials',
      title: 'Education and memberships',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'credential',
          title: 'Credential',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Description',
              type: 'internationalizedArrayString',
              validation: (rule) => rule.custom(validateI18n({ required: 'Add the description.' })),
            }),
            defineField({
              name: 'year',
              title: 'Year',
              type: 'number',
              validation: (rule) =>
                rule.integer().min(1950).max(2100).error('Use a four-digit year, e.g. 2012.'),
            }),
          ],
          preview: {
            select: { label: 'label', year: 'year' },
            prepare: ({ label, year }) => ({
              title: i18nValue(label as I18nRow<string>[]) ?? 'Credential',
              subtitle: year ? String(year) : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'sameAs',
      title: 'Professional profiles',
      type: 'array',
      description: 'Optional links to profiles elsewhere (e.g. the dental association register).',
      of: [defineArrayMember({ type: 'url' })],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Reserved for future profile pages.',
      hidden: true,
    }),
    orderRankField({ type: 'teamMember' }),
  ],
  preview: {
    select: { title: 'name', role: 'role', media: 'photo', featured: 'featured' },
    prepare: ({ title, role, media, featured }) => ({
      title,
      subtitle: [i18nValue(role as I18nRow<string>[]), featured ? 'featured' : undefined]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
