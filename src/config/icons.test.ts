import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { contentIcons } from './icons'

const iconsDir = join(
  dirname(createRequire(import.meta.url).resolve('lucide-react')),
  '..',
  'esm',
  'icons',
)

describe('contentIcons', () => {
  it('only lists icons that exist in the installed lucide-react', () => {
    const missing = contentIcons
      .map((icon) => icon.value)
      .filter((name) => !existsSync(join(iconsDir, `${name}.mjs`)))
    expect(missing).toEqual([])
  })

  it('has no duplicates', () => {
    const names = contentIcons.map((icon) => icon.value)
    expect(new Set(names).size).toBe(names.length)
  })
})
