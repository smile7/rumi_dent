import { CommentIcon } from '@sanity/icons/Comment'
import { ImagesIcon } from '@sanity/icons/Images'
import { UsersIcon } from '@sanity/icons/Users'
import { defineArrayMember, defineField } from 'sanity'

import { galleryAlbums } from '../collections/galleryItem'
import { defineSection, headingField, introField } from './base'

export const testimonialsSection = defineSection({
  name: 'testimonials',
  title: 'Testimonials',
  icon: CommentIcon,
  fields: [
    headingField(),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      description: 'Leave empty to show the testimonials marked "Featured".',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'testimonial' }] })],
      validation: (rule) => rule.unique().error('Each testimonial can be added once.'),
    }),
    defineField({
      name: 'showRating',
      title: 'Show star ratings',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

export const teamSection = defineSection({
  name: 'team',
  title: 'Team',
  icon: UsersIcon,
  fields: [
    headingField(),
    introField,
    defineField({
      name: 'members',
      title: 'People',
      type: 'array',
      description: 'Leave empty to show the whole team in its usual order.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'teamMember' }] })],
      validation: (rule) => rule.unique().error('Each person can be added once.'),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Featured people first, larger', value: 'featuredFirst' },
          { title: 'Even grid', value: 'grid' },
          { title: 'Duo (2 people)', value: 'duo' },
        ],
      },
      initialValue: 'featuredFirst',
    }),
  ],
})

export const gallerySection = defineSection({
  name: 'gallery',
  title: 'Gallery',
  icon: ImagesIcon,
  fields: [
    headingField(),
    defineField({
      name: 'album',
      title: 'Album',
      type: 'string',
      description: 'Leave empty to show photos from every album.',
      options: { list: galleryAlbums },
    }),
    defineField({
      name: 'items',
      title: 'Photos',
      type: 'array',
      description: 'Optional. Hand-pick photos instead of using the album.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'galleryItem' }] })],
      validation: (rule) => rule.unique().error('Each photo can be added once.'),
    }),
    defineField({
      name: 'limit',
      title: 'Number of photos',
      type: 'number',
      initialValue: 9,
      validation: (rule) => rule.min(1).max(24).integer().error('Choose between 1 and 24.'),
    }),
    defineField({
      name: 'showLinkToGallery',
      title: 'Link to the full gallery',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
