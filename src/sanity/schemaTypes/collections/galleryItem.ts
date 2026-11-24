import { ImagesIcon } from '@sanity/icons/Images'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue } from '../../lib/validation'

type GalleryValue = { showsPatient?: boolean }

const showsPatient = (context: { parent?: unknown; document?: unknown }) =>
  Boolean(((context.document ?? context.parent) as GalleryValue | undefined)?.showsPatient)

export const galleryAlbums = [
  { title: 'Clinic', value: 'clinic' },
  { title: 'Team', value: 'team' },
  { title: 'Patients', value: 'patients' },
  { title: 'Events', value: 'events' },
  { title: 'Other', value: 'other' },
]

export const galleryItemType = defineType({
  name: 'galleryItem',
  title: 'Gallery photo',
  type: 'document',
  icon: ImagesIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'imageWithAlt',
      validation: (rule) => rule.required().error('Add the photo.'),
    }),
    defineField({
      name: 'album',
      title: 'Album',
      type: 'string',
      options: { list: galleryAlbums, layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.required().error('Choose an album.'),
    }),
    defineField({
      name: 'showsPatient',
      title: 'Shows a patient',
      type: 'boolean',
      description: 'Tick if a patient (or their face, teeth or name) can be recognised.',
      initialValue: false,
    }),
    defineField({
      name: 'consentOnFile',
      title: 'Consent is on file',
      type: 'boolean',
      description:
        'Written consent from the patient (for children: the parent/guardian) is signed and stored at the clinic.',
      hidden: (context) => !showsPatient(context),
      validation: (rule) =>
        rule.custom((value, context) =>
          showsPatient(context) && value !== true
            ? 'Photos of patients can only be published with signed written consent (GDPR). Confirm the consent is stored at the clinic.'
            : true,
        ),
    }),
    defineField({
      name: 'consentReference',
      title: 'Consent reference',
      type: 'string',
      description:
        'The internal number of the signed form, e.g. "C-2026-014". Never a name or other personal data: this field is publicly readable.',
      hidden: (context) => !showsPatient(context),
      validation: (rule) =>
        rule.custom((value, context) =>
          showsPatient(context) && !value
            ? 'Add the internal number of the consent form, so the clinic can find it.'
            : true,
        ),
    }),
    defineField({
      name: 'pairWith',
      title: 'Pair with',
      type: 'reference',
      to: [{ type: 'galleryItem' }],
      description: 'Reserved for before/after pairs.',
      hidden: true,
    }),
    orderRankField({ type: 'galleryItem' }),
  ],
  preview: {
    select: { alt: 'image.alt', album: 'album', media: 'image', showsPatient: 'showsPatient' },
    prepare: ({ alt, album, media, showsPatient: patient }) => ({
      title: i18nValue(alt as I18nRow<string>[]) ?? 'Photo',
      subtitle: [album, patient ? 'patient' : undefined].filter(Boolean).join(' · '),
      media,
    }),
  },
})
