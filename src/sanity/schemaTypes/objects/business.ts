import { CalendarIcon } from '@sanity/icons/Calendar'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineField, defineType } from 'sanity'

type BookingValue = { mode?: string }

export const legalEntityType = defineType({
  name: 'legalEntity',
  title: 'Company details',
  type: 'object',
  icon: DocumentTextIcon,
  description:
    'Provider information required by the Bulgarian E-Commerce Act, shown in the footer and on legal pages. Confirm with your lawyer.',
  fields: [
    defineField({
      name: 'legalName',
      title: 'Registered company name',
      type: 'string',
      description: 'e.g. «Руми Дент ЕООД».',
      validation: (rule) =>
        rule.required().warning('Add the registered company name before launch.'),
    }),
    defineField({
      name: 'uic',
      title: 'UIC (ЕИК)',
      type: 'string',
      validation: (rule) => [
        rule.required().warning('Add the UIC (ЕИК) before launch.'),
        rule.regex(/^(\d{9}|\d{13})$/).error('The UIC (ЕИК) has 9 or 13 digits, without spaces.'),
      ],
    }),
    defineField({
      name: 'vatNumber',
      title: 'VAT number',
      type: 'string',
      description: 'Only if registered for VAT.',
    }),
    defineField({ name: 'registeredAddress', title: 'Registered address', type: 'address' }),
    defineField({
      name: 'representative',
      title: 'Represented by',
      type: 'string',
      description: 'Optional.',
    }),
    defineField({
      name: 'privacyEmail',
      title: 'Privacy contact email',
      type: 'string',
      description:
        'Where people send data protection requests (access, deletion, …). Shown in the footer. Leave empty to use the main email.',
      validation: (rule) => rule.email().error("This doesn't look like an email address."),
    }),
    defineField({
      name: 'professionalBody',
      title: 'Professional body',
      type: 'internationalizedArrayString',
      description: 'e.g. «Български зъболекарски съюз».',
    }),
    defineField({
      name: 'registration',
      title: 'Registration',
      type: 'internationalizedArrayString',
      description: 'e.g. the registration number at the Regional Health Inspectorate (РЗИ).',
    }),
    defineField({
      name: 'supervisoryAuthority',
      title: 'Supervisory authority',
      type: 'internationalizedArrayString',
      description: 'Optional.',
    }),
  ],
  preview: {
    select: { title: 'legalName', subtitle: 'uic' },
  },
})

export const bookingConfigType = defineType({
  name: 'bookingConfig',
  title: 'Booking',
  type: 'object',
  icon: CalendarIcon,
  description: 'What the "Book an appointment" buttons do across the site.',
  fields: [
    defineField({
      name: 'mode',
      title: 'Booking by',
      type: 'string',
      // `embed` is reserved for a later version (CONTENT-MODEL §1 bookingConfig).
      options: {
        layout: 'radio',
        list: [
          { title: 'Phone call', value: 'phone' },
          { title: 'Online booking page', value: 'externalUrl' },
        ],
      },
      initialValue: 'phone',
      validation: (rule) => rule.required().error('Choose how visitors book.'),
    }),
    defineField({
      name: 'provider',
      title: 'Booking system',
      type: 'string',
      options: {
        list: [
          { title: 'SuperDoc', value: 'superdoc' },
          { title: 'Other', value: 'other' },
        ],
      },
      hidden: ({ parent }) => (parent as BookingValue | undefined)?.mode !== 'externalUrl',
    }),
    defineField({
      name: 'url',
      title: 'Booking page address',
      type: 'url',
      hidden: ({ parent }) => (parent as BookingValue | undefined)?.mode !== 'externalUrl',
      validation: (rule) => [
        rule.uri({ scheme: ['https'] }).error('Use a full address that starts with https://'),
        rule.custom((value, context) =>
          (context.parent as BookingValue | undefined)?.mode === 'externalUrl' && !value
            ? 'Add the address of the booking page.'
            : true,
        ),
      ],
    }),
    defineField({
      name: 'label',
      title: 'Button text',
      type: 'internationalizedArrayString',
      description: 'Optional. Default: "Book an appointment".',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'internationalizedArrayString',
      description: 'Optional, e.g. "Appointments recommended".',
    }),
  ],
})
