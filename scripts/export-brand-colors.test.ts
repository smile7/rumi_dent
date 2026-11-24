import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { brandColors, serializeBrandColors } from './export-brand-colors'

const read = (path: string) => readFileSync(resolve(__dirname, path), 'utf8')

describe('brand-colors.json', () => {
  it('matches tokens.css (run `pnpm tokens:export` after changing tokens)', () => {
    expect(read('../src/config/brand-colors.json')).toBe(
      serializeBrandColors(brandColors(read('../src/styles/tokens.css'))),
    )
  })

  it('converts OKLCH tokens to hex', () => {
    const css = ':root { --color-x: oklch(1 0 0); --color-primary: var(--color-x); }'
    expect(
      brandColors(
        `${css} --color-primary-fg: oklch(0 0 0); --color-bg: oklch(1 0 0); --color-fg: oklch(0 0 0); --color-accent: oklch(0.628 0.2577 29.23);`,
      ),
    ).toEqual({
      primary: '#ffffff',
      primaryFg: '#000000',
      bg: '#ffffff',
      fg: '#000000',
      accent: '#ff0000',
    })
  })
})
