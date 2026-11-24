import { describe, expect, it } from 'vitest'

import { assertLegalPagePublishable } from './legal'
import type { LegalPage } from './types'

const page = (placeholders: string[]): LegalPage => ({
  id: 'l1',
  kind: 'privacy',
  title: 'Privacy',
  slug: 'privacy',
  body: [] as unknown as LegalPage['body'],
  translations: {},
  toc: [],
  placeholders,
})

describe('assertLegalPagePublishable', () => {
  it('throws in production while placeholders remain', () => {
    expect(() => assertLegalPagePublishable(page(['[[DPO_EMAIL]]']), 'production')).toThrow(
      /privacy.*\[\[DPO_EMAIL\]\]/,
    )
  })

  it('passes clean pages, and any page outside production', () => {
    expect(assertLegalPagePublishable(page([]), 'production').slug).toBe('privacy')
    expect(assertLegalPagePublishable(page(['[[X]]']), 'preview').slug).toBe('privacy')
    expect(assertLegalPagePublishable(page(['[[X]]']), 'development').slug).toBe('privacy')
  })
})
