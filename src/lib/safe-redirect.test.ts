import { describe, expect, it } from 'vitest'

import { safeRedirectPath } from './safe-redirect'

describe('safeRedirectPath', () => {
  it('keeps same-origin paths with query and hash', () => {
    expect(safeRedirectPath('/bg/uslugi?x=1#top')).toBe('/bg/uslugi?x=1#top')
  })

  it.each([
    null,
    '',
    'https://evil.example/',
    '//evil.example/path',
    '/\\evil.example',
    'javascript:alert(1)',
    'bg/uslugi',
  ])('falls back for %j', (value) => {
    expect(safeRedirectPath(value, '/bg')).toBe('/bg')
  })
})
