import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { defaultLanguage } from '../../i18n'
import { type I18nRow, isTimeZone, validateI18n } from '../../lib/validation'

const businessTypes = [
  { title: 'Dentist', value: 'Dentist' },
  { title: 'Medical clinic', value: 'MedicalClinic' },
  { title: 'Physician', value: 'Physician' },
  { title: 'Local business', value: 'LocalBusiness' },
  { title: 'Professional service', value: 'ProfessionalService' },
  { title: 'Health and beauty', value: 'HealthAndBeautyBusiness' },
  { title: 'Store', value: 'Store' },
]

type PhoneValue = { _key: string; key?: string }

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'brand', title: 'Brand', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'hours', title: 'Hours' },
    { name: 'social', title: 'Social' },
    { name: 'booking', title: 'Booking & form' },
    { name: 'legal', title: 'Legal' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Brand
    defineField({
      name: 'brandName',
      title: 'Brand name',
      type: 'internationalizedArrayString',
      group: 'brand',
      description: 'As visitors know it, e.g. «Руми Дент» / "Rumi Dent".',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the brand name.', max: 60 })),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'internationalizedArrayString',
      group: 'brand',
      description: 'Optional short line next to the name. Max 80 characters.',
      validation: (rule) => rule.custom(validateI18n({ max: 80 })),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'brand',
      description: 'SVG preferred. Leave empty to show the brand name as text.',
    }),
    defineField({
      name: 'logoCompact',
      title: 'Compact logo',
      type: 'image',
      group: 'brand',
      description: 'Optional mark or initials for the small header on scroll.',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon source',
      type: 'image',
      group: 'brand',
      description: 'For reference only: the developer generates the browser icons from it.',
    }),
    defineField({
      name: 'businessType',
      title: 'Type of business',
      type: 'string',
      group: 'brand',
      description: 'Tells Google what kind of business this is.',
      options: { list: businessTypes },
      initialValue: 'LocalBusiness',
      validation: (rule) => rule.required().error('Choose the type of business.'),
    }),
    defineField({
      name: 'areaServed',
      title: 'Area served',
      type: 'internationalizedArrayString',
      group: 'brand',
      description: 'Optional, e.g. «Русе и региона».',
    }),
    defineField({
      name: 'priceRange',
      title: 'Price range',
      type: 'string',
      group: 'brand',
      description: 'Optional, for Google, e.g. €€.',
    }),

    // Contact
    defineField({
      name: 'address',
      title: 'Address',
      type: 'address',
      group: 'contact',
      validation: (rule) => rule.required().error('Add the address.'),
    }),
    defineField({
      name: 'geo',
      title: 'Map position',
      type: 'geo',
      group: 'contact',
      description: 'Needed for the directions link, the map pin and Google.',
      validation: (rule) => rule.required().error('Add the map position.'),
    }),
    defineField({
      name: 'phones',
      title: 'Phone numbers',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({ type: 'phone' })],
      validation: (rule) => [
        rule.required().min(1).error('Add at least one phone number.'),
        rule.max(2).error('Add up to two numbers: primary and secondary.'),
        rule.custom((phones: PhoneValue[] | undefined) => {
          if (!phones?.length) return true
          if (!phones.some((phone) => phone.key === 'primary')) return 'Mark one number as primary.'
          const keys = phones.map((phone) => phone.key)
          return new Set(keys).size === keys.length
            ? true
            : 'Use "primary" and "secondary" only once each.'
        }),
      ],
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      description: 'Shown on the website.',
      validation: (rule) => rule.email().error("This doesn't look like an email address."),
    }),
    defineField({
      name: 'mapEmbedUrl',
      title: 'Google Maps embed address',
      type: 'url',
      group: 'contact',
      description: 'Google Maps → Share → Embed a map → copy only the address inside src="…".',
      validation: (rule) =>
        rule.custom((value: string | undefined) =>
          !value || value.startsWith('https://www.google.com/maps/embed')
            ? true
            : 'Paste the embed address. It starts with https://www.google.com/maps/embed',
        ),
    }),
    defineField({
      name: 'mapPlaceholder',
      title: 'Map preview image',
      type: 'imageWithAlt',
      group: 'contact',
      description: 'Optional picture shown until the visitor clicks to load the map.',
    }),
    defineField({
      name: 'googleBusinessUrl',
      title: 'Google Business Profile address',
      type: 'url',
      group: 'contact',
      description: 'The link to your place on Google Maps (used for reviews and Google).',
      validation: (rule) => rule.uri({ scheme: ['https'] }).error('Use a full https:// address.'),
    }),

    // Hours
    defineField({
      name: 'openingHours',
      title: 'Opening hours',
      type: 'array',
      group: 'hours',
      description:
        'One row per group of days with the same hours. Days not listed are shown as closed.',
      of: [defineArrayMember({ type: 'openingHoursSpec' })],
      validation: (rule) => rule.required().min(1).error('Add the opening hours.'),
    }),
    defineField({
      name: 'specialHours',
      title: 'Holidays and exceptions',
      type: 'array',
      group: 'hours',
      of: [defineArrayMember({ type: 'specialHours' })],
    }),
    defineField({
      name: 'timeZone',
      title: 'Time zone',
      type: 'string',
      group: 'hours',
      description: 'Used for "open now". Change only for a business outside Bulgaria.',
      initialValue: 'Europe/Sofia',
      validation: (rule) =>
        rule
          .required()
          .custom((value: string | undefined) =>
            !value || isTimeZone(value) ? true : 'Use a time zone name like Europe/Sofia.',
          ),
    }),

    // Social
    defineField({
      name: 'socials',
      title: 'Social profiles',
      type: 'array',
      group: 'social',
      of: [defineArrayMember({ type: 'socialLink' })],
    }),

    // Booking & form
    defineField({
      name: 'booking',
      title: 'Booking',
      type: 'bookingConfig',
      group: 'booking',
      validation: (rule) => rule.required().error('Choose how visitors book.'),
    }),
    defineField({
      name: 'contactForm',
      title: 'Contact form',
      type: 'object',
      group: 'booking',
      fields: [
        defineField({
          name: 'recipient',
          title: 'Send messages to',
          type: 'string',
          description:
            'This address is publicly readable via the API. Leave empty if the developer set it privately (CONTACT_TO_EMAIL).',
          validation: (rule) => rule.email().error("This doesn't look like an email address."),
        }),
        defineField({
          name: 'subjectPrefix',
          title: 'Email subject prefix',
          type: 'internationalizedArrayString',
          description: 'Optional, e.g. "[Website]".',
        }),
        defineField({
          name: 'successMessage',
          title: 'Thank-you message',
          type: 'internationalizedArrayText',
          description: 'Optional. Shown after sending; a default text is used if empty.',
        }),
      ],
    }),

    // Legal
    defineField({
      name: 'legal',
      title: 'Company details',
      type: 'legalEntity',
      group: 'legal',
      validation: (rule) => rule.required().warning('Add the company details before launch.'),
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal pages in the footer',
      type: 'array',
      group: 'legal',
      description: 'Choose the Bulgarian versions; each language links to its own translation.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'legalPage' }],
          weak: true,
          options: {
            filter: 'language == $language',
            filterParams: { language: defaultLanguage },
          },
        }),
      ],
      validation: (rule) => rule.unique().error('Each legal page only once.'),
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer note',
      type: 'internationalizedArrayText',
      group: 'legal',
      description: 'Optional small print at the bottom of every page.',
    }),

    // SEO
    defineField({
      name: 'seoDefaults',
      title: 'Search and sharing defaults',
      type: 'object',
      group: 'seo',
      description: 'Used when a page has no SEO settings of its own.',
      validation: (rule) => rule.required().error('Add the default description.'),
      fields: [
        defineField({
          name: 'titleTemplate',
          title: 'Title pattern',
          type: 'internationalizedArrayString',
          description: '%s is replaced by the page title, e.g. "%s · Руми Дент".',
          validation: (rule) =>
            rule.custom((rows: I18nRow[] | undefined) => {
              const missing = rows?.filter(
                (row) => typeof row.value === 'string' && row.value && !row.value.includes('%s'),
              )
              return missing?.length
                ? missing.map((row) => ({
                    message: 'Include %s where the page title should go.',
                    path: [{ _key: row._key }, 'value'],
                  }))
                : true
            }),
        }),
        defineField({
          name: 'description',
          title: 'Default description',
          type: 'internationalizedArrayText',
          description: 'One or two sentences about the business, 70–160 characters.',
          validation: (rule) => [
            rule.custom(validateI18n({ required: 'Add the default description for Google.' })),
            rule
              .custom((rows: I18nRow[] | undefined) => {
                const long = rows?.filter(
                  (row) => typeof row.value === 'string' && row.value.length > 160,
                )
                return long?.length
                  ? long.map((row) => ({
                      message: 'Google cuts descriptions after about 160 characters.',
                      path: [{ _key: row._key }, 'value'],
                    }))
                  : true
              })
              .warning(),
          ],
        }),
        defineField({
          name: 'ogImage',
          title: 'Default sharing image',
          type: 'imageWithAlt',
          description: 'Shown when a page without its own image is shared. Cropped to 1200×630.',
        }),
        defineField({
          name: 'googleVerification',
          title: 'Google Search Console code',
          type: 'string',
          description:
            'Only if the domain is not verified by DNS: the content="…" value of the HTML tag Search Console gives you.',
        }),
        defineField({
          name: 'bingVerification',
          title: 'Bing Webmaster code',
          type: 'string',
          description:
            'Only if the domain is not verified by DNS: the content="…" value of the msvalidate.01 tag.',
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
})
