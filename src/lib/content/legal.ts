import type { LegalPage } from './types'

type AppEnv = 'production' | 'preview' | 'development'

/** Production must never ship a legal text with unreplaced `[[placeholders]]`: fail the build. */
export function assertLegalPagePublishable(page: LegalPage, env: AppEnv): LegalPage {
  if (env === 'production' && page.placeholders.length > 0) {
    throw new Error(
      `Legal page "${page.slug}" still has placeholders: ${page.placeholders.join(', ')}. ` +
        'Replace them in the Studio before deploying to production.',
    )
  }
  return page
}
