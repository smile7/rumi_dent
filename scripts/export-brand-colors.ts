/**
 * Writes the hex values of a few semantic tokens to `src/config/brand-colors.json`, for code that
 * can't read CSS variables (web manifest, build-time OG images).
 * Run: `pnpm tokens:export` after editing `src/styles/tokens.css` (a unit test fails until you do).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  oklchToHex,
  parseCustomProperties,
  parseOklch,
  resolveValue,
} from '../src/lib/design/contrast'

const TOKENS = {
  primary: 'color-primary',
  primaryFg: 'color-primary-fg',
  bg: 'color-bg',
  fg: 'color-fg',
  accent: 'color-accent',
} as const

export type BrandColors = Record<keyof typeof TOKENS, string>

export function brandColors(css: string): BrandColors {
  const props = parseCustomProperties(css)
  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [
      key,
      oklchToHex(parseOklch(resolveValue(props, token))),
    ]),
  ) as BrandColors
}

export function serializeBrandColors(colors: BrandColors): string {
  return `${JSON.stringify(colors, null, 2)}\n`
}

function main() {
  const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
  const out = fileURLToPath(new URL('../src/config/brand-colors.json', import.meta.url))
  writeFileSync(out, serializeBrandColors(brandColors(css)))
  console.log(`Wrote ${out}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
