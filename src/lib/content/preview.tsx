import 'server-only'

import { getTranslations } from 'next-intl/server'

import { PreviewClient } from './preview-client'

/**
 * Draft-mode only (the `[locale]` layout checks `draftMode()`): click-to-edit overlays, refresh on
 * Studio edits, and an "Exit preview" button outside Presentation.
 */
export async function PreviewTools() {
  const t = await getTranslations('Preview')
  return <PreviewClient exitLabel={t('exit')} />
}
