import { documentInternationalization } from '@sanity/document-internationalization'
import type { PluginOptions } from 'sanity'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

import { apiVersion } from './env'
import { defaultLanguage, routableTypes, studioLanguages } from './i18n'
import { resolve } from './presentation/resolve'
import { structure } from './structure'

// Dynamic import so production builds drop Vision: a static import adds ~13 MiB to the Worker
// even when the plugin is disabled.
const devPlugins: PluginOptions[] =
  process.env.NODE_ENV === 'development'
    ? [(await import('@sanity/vision')).visionTool({ defaultApiVersion: apiVersion })]
    : []

export const plugins: PluginOptions[] = [
  structureTool({ structure }),
  presentationTool({
    resolve,
    previewUrl: {
      // Relative: the Studio is embedded, so the preview is the same deployment (dev, preview, prod).
      initial: `/${defaultLanguage}`,
      previewMode: { enable: '/api/draft-mode/enable' },
    },
  }),
  documentInternationalization({
    supportedLanguages: studioLanguages,
    schemaTypes: [...routableTypes],
    languageField: 'language',
    weakReferences: true,
    apiVersion,
  }),
  internationalizedArray({
    languages: studioLanguages,
    defaultLanguages: [defaultLanguage],
    // Add a type here only when a field needs it (each one adds schema types and attributes).
    fieldTypes: ['string', 'text', 'richTextSimple', 'slug'],
    apiVersion,
  }),
  ...devPlugins,
]
