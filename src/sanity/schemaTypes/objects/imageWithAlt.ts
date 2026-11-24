import { ImageIcon } from '@sanity/icons/Image'
import { defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

type ImageWithAltValue = { asset?: { _ref: string }; decorative?: boolean; alt?: I18nRow[] }

export const imageWithAltType = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  description: 'Use the hotspot (crop icon) to mark the part of the photo that must stay visible.',
  options: { hotspot: true },
  validation: (rule) =>
    rule.custom((value: ImageWithAltValue | undefined) =>
      value && !value.asset ? 'Upload an image, or remove this field.' : true,
    ),
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'internationalizedArrayString',
      description:
        "Describe what is in the photo for people who can't see it (screen readers, Google). Max 140 characters.",
      hidden: ({ parent }) => Boolean((parent as ImageWithAltValue | undefined)?.decorative),
      validation: (rule) =>
        rule.custom((rows: I18nRow[] | undefined, context) => {
          const parent = context.parent as ImageWithAltValue | undefined
          if (!parent?.asset || parent.decorative) return true
          return validateI18n({
            required:
              'Add alternative text: describe the photo for people who can\'t see it, or tick "Decorative".',
            max: 140,
          })(rows)
        }),
    }),
    defineField({
      name: 'decorative',
      title: 'Decorative',
      type: 'boolean',
      description: 'Tick only if the image adds nothing to the content (a pattern, a background).',
      initialValue: false,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'internationalizedArrayString',
      description: 'Optional text shown under the image. Max 160 characters.',
      validation: (rule) => rule.custom(validateI18n({ max: 160 })),
    }),
    defineField({
      name: 'credit',
      title: 'Credit',
      type: 'string',
      description: 'Photographer or stock attribution, if the licence requires it.',
    }),
  ],
  preview: {
    select: { media: 'asset', alt: 'alt', decorative: 'decorative' },
    prepare: ({ media, alt, decorative }) => ({
      title: decorative ? 'Decorative image' : (i18nValue(alt as I18nRow<string>[]) ?? 'Image'),
      media,
    }),
  },
})
