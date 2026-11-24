import { PinIcon } from '@sanity/icons/Pin'
import { defineField, defineType } from 'sanity'

import { type I18nRow, i18nValue, validateI18n } from '../../lib/validation'

export const addressType = defineType({
  name: 'address',
  title: 'Address',
  type: 'object',
  icon: PinIcon,
  description: 'Written the way it should appear on the website and on Google.',
  fields: [
    defineField({
      name: 'street',
      title: 'Street',
      type: 'internationalizedArrayString',
      description: 'e.g. «ж.к. Възраждане, ул. „Плиска" 54»',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the street address.' })),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.custom(validateI18n({ required: 'Add the city.' })),
    }),
    defineField({
      name: 'postalCode',
      title: 'Postal code',
      type: 'string',
      validation: (rule) => rule.required().error('Add the postal code.'),
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'internationalizedArrayString',
      description: 'Optional, e.g. the district.',
    }),
    defineField({
      name: 'countryCode',
      title: 'Country',
      type: 'string',
      description: 'Two-letter country code, e.g. BG.',
      initialValue: 'BG',
      validation: (rule) => [
        rule.required().error('Add the country code, e.g. BG.'),
        rule.regex(/^[A-Z]{2}$/).error('Use the two-letter country code in capitals, e.g. BG.'),
      ],
    }),
  ],
  preview: {
    select: { street: 'street', city: 'city' },
    prepare: ({ street, city }) => ({
      title: i18nValue(street as I18nRow<string>[]) ?? 'Address',
      subtitle: i18nValue(city as I18nRow<string>[]),
    }),
  },
})

export const geoType = defineType({
  name: 'geo',
  title: 'Map position',
  type: 'object',
  icon: PinIcon,
  description:
    'In Google Maps, right-click the entrance and click the numbers at the top of the menu to copy them. The first number is the latitude, the second the longitude.',
  fields: [
    defineField({
      name: 'lat',
      title: 'Latitude',
      type: 'number',
      validation: (rule) => [
        rule.required().error('Add the latitude.'),
        rule.min(-90).max(90).error('Latitude is a number between -90 and 90, e.g. 43.8356.'),
      ],
    }),
    defineField({
      name: 'lng',
      title: 'Longitude',
      type: 'number',
      validation: (rule) => [
        rule.required().error('Add the longitude.'),
        rule.min(-180).max(180).error('Longitude is a number between -180 and 180, e.g. 25.9657.'),
      ],
    }),
  ],
  preview: {
    select: { lat: 'lat', lng: 'lng' },
    prepare: ({ lat, lng }) => ({ title: lat && lng ? `${lat}, ${lng}` : 'Map position' }),
  },
})
