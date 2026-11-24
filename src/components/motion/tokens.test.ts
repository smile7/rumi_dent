import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { duration, ease } from './tokens'

const css = readFileSync(resolve(__dirname, '../../styles/tokens.css'), 'utf8')

function cssValue(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css)
  if (!match?.[1]) throw new Error(`--${name} not found in tokens.css`)
  return match[1].trim()
}

describe('motion tokens mirror tokens.css', () => {
  it.each(Object.entries(duration))('--duration-%s', (name, seconds) => {
    expect(cssValue(`duration-${name}`)).toBe(`${Math.round(seconds * 1000)}ms`)
  })

  it.each(Object.entries(ease))('--ease-%s', (name, curve) => {
    expect(cssValue(`ease-${name}`)).toBe(`cubic-bezier(${curve.join(', ')})`)
  })
})
