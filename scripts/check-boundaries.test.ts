import { describe, expect, it } from 'vitest'

import { findViolations, importSpecifiers } from './check-boundaries'

const patterns = [
  { regex: '^(next-sanity|sanity|groq)(/.*)?$', message: 'boundary' },
  { regex: '^@(sanity|portabletext)/', message: 'boundary' },
  { regex: '(^|/)lib/content/sanity(/|$)', message: 'boundary' },
  { regex: '(^|/)sanity\\.types(\\.ts)?$', message: 'boundary' },
]

describe('check-boundaries', () => {
  it('finds static, type-only, re-export, side-effect and dynamic imports', () => {
    const source = [
      "import { a } from 'x'",
      "import type { B } from '@/lib/content/types'",
      "export { c } from './c'",
      "import 'server-only'",
      "const d = await import('next-sanity/hooks')",
    ].join('\n')
    expect(importSpecifiers(source)).toEqual([
      'x',
      '@/lib/content/types',
      './c',
      'server-only',
      'next-sanity/hooks',
    ])
  })

  it('flags CMS imports and allows the content API', () => {
    const source = [
      "import { getTeam } from '@/lib/content'",
      "import { stegaClean } from 'next-sanity'",
      "import { client } from '@/lib/content/sanity/client'",
      "import type { Page } from '../../sanity.types'",
      "import { toPlainText } from '@portabletext/react'",
      "import { cn } from '@/lib/utils'",
    ].join('\n')
    expect(findViolations(source, patterns).map((v) => v.specifier)).toEqual([
      'next-sanity',
      '@/lib/content/sanity/client',
      '../../sanity.types',
      '@portabletext/react',
    ])
  })
})
