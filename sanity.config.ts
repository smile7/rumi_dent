'use client'

import { defineConfig } from 'sanity'

import { dataset, projectId, studioBasePath } from './src/sanity/env'
import { isRoutableType } from './src/sanity/i18n'
import { plugins } from './src/sanity/plugins'
import { schemaTypes, singletonTypes } from './src/sanity/schemaTypes'

/** Singletons can only be edited and published: no delete, unpublish or duplicate. */
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Site Studio',
  basePath: studioBasePath,
  projectId,
  dataset,
  plugins,
  schema: {
    types: schemaTypes,
    // Routable documents are created only through the per-language templates
    // ("Български Page", "English Page"), so `language` is always set.
    templates: (prev) => prev.filter((template) => !isRoutableType(template.id)),
  },
  document: {
    singletons: singletonTypes,
    actions: (prev, context) => {
      if (context.singleton) {
        return prev.filter(({ action }) => action && singletonActions.has(action))
      }
      // Legal pages are required in every language: they can be unpublished, never deleted.
      if (context.schemaType === 'legalPage')
        return prev.filter(({ action }) => action !== 'delete')
      return prev
    },
  },
})
