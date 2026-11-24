import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { readPublicEnv } from './env'
import { createEnvReader } from './lib/env/reader'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('createEnvReader', () => {
  const read = createEnvReader(
    'test',
    { A: z.string().min(1), B: z.url(), C: z.stringbool().default(false) },
    () => ({ A: undefined, B: 'not-a-url', C: undefined }),
  )

  it('lists every missing or invalid key in one readable error', () => {
    expect(() => read('A', 'B')).toThrowError(
      /Invalid test environment variables:\n {2}- A: missing\n {2}- B: .+\nSee \.env\.example/,
    )
  })

  it('validates only the requested keys and applies defaults', () => {
    expect(read('C')).toEqual({ C: false })
  })
})

describe('readPublicEnv', () => {
  it('fails with the key name when a required public var is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    expect(() => readPublicEnv('NEXT_PUBLIC_SITE_URL')).toThrowError(
      /NEXT_PUBLIC_SITE_URL: missing/,
    )
  })

  it('parses and coerces valid values', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.example.bg')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_STYLEGUIDE', 'true')
    expect(
      readPublicEnv('NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_ENV', 'NEXT_PUBLIC_ENABLE_STYLEGUIDE'),
    ).toEqual({
      NEXT_PUBLIC_SITE_URL: 'https://www.example.bg',
      NEXT_PUBLIC_ENV: 'development',
      NEXT_PUBLIC_ENABLE_STYLEGUIDE: true,
    })
  })

  it('rejects a non-http site URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'ftp://example.bg')
    expect(() => readPublicEnv('NEXT_PUBLIC_SITE_URL')).toThrowError(/NEXT_PUBLIC_SITE_URL: /)
  })
})
