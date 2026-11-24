import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  parseCustomProperties,
  parseOklch,
  ratioFromLuminance,
  relativeLuminance,
  relativeLuminanceFromSrgb8,
  resolveValue,
} from './contrast'

const white = { l: 1, c: 0, h: 0 }
const black = { l: 0, c: 0, h: 0 }

describe('contrast math', () => {
  it('gives 21:1 for black on white', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 1)
  })

  it('matches the sRGB luminance of pure red (#ff0000 ≈ 0.2126)', () => {
    expect(relativeLuminance({ l: 0.62796, c: 0.25768, h: 29.2339 })).toBeCloseTo(0.2126, 2)
  })

  it('computes luminance from 8-bit sRGB like the OKLCH path', () => {
    expect(relativeLuminanceFromSrgb8([255, 255, 255])).toBeCloseTo(1, 5)
    expect(relativeLuminanceFromSrgb8([255, 0, 0])).toBeCloseTo(0.2126, 4)
    expect(relativeLuminanceFromSrgb8([0, 0, 0])).toBe(0)
    expect(ratioFromLuminance(1, 0)).toBeCloseTo(21, 5)
  })

  it('parses oklch with a percentage lightness', () => {
    expect(parseOklch('oklch(50% 0.1 200)')).toEqual({ l: 0.5, c: 0.1, h: 200 })
  })

  it('rejects colors with alpha or other formats', () => {
    expect(() => parseOklch('oklch(0.5 0.1 200 / 0.5)')).toThrow()
    expect(() => parseOklch('#fff')).toThrow()
  })
})

describe('token resolution', () => {
  const css = `
    /* --ignored: red; */
    @theme { --a: oklch(0.5 0.1 200); --b: var(--a); --c: var(--b); --loop: var(--loop); }
  `
  const props = parseCustomProperties(css)

  it('follows var() chains', () => {
    expect(resolveValue(props, 'c')).toBe('oklch(0.5 0.1 200)')
  })

  it('ignores comments and reports unknown or circular tokens', () => {
    expect(props.has('ignored')).toBe(false)
    expect(() => resolveValue(props, 'missing')).toThrow(/not defined/)
    expect(() => resolveValue(props, 'loop')).toThrow(/Circular/)
  })
})
