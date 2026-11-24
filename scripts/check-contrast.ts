/**
 * Asserts WCAG 2.2 AA contrast for every semantic fg/bg pair the components use.
 * Run: `pnpm contrast` (part of `pnpm check`). A failing pair is a blocker (DESIGN-SYSTEM §2).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { CONTRAST_PAIRS, type ContrastPair } from '../src/lib/design/contrast-pairs'
import {
  contrastRatio,
  parseCustomProperties,
  parseOklch,
  resolveValue,
} from '../src/lib/design/contrast'

export type PairResult = ContrastPair & { ratio: number; pass: boolean }

export function checkPairs(css: string, pairs: ContrastPair[] = CONTRAST_PAIRS): PairResult[] {
  const props = parseCustomProperties(css)
  return pairs.map((pair) => {
    const ratio = contrastRatio(
      parseOklch(resolveValue(props, pair.fg)),
      parseOklch(resolveValue(props, pair.bg)),
    )
    return { ...pair, ratio, pass: ratio >= pair.min }
  })
}

function main() {
  const tokensPath = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
  const results = checkPairs(readFileSync(tokensPath, 'utf8'))
  for (const r of results) {
    const mark = r.pass ? 'ok  ' : 'FAIL'
    console.log(
      `${mark} ${r.ratio.toFixed(2).padStart(5)}:1 (min ${r.min}) ${r.fg} on ${r.bg} — ${r.use}`,
    )
  }
  const failures = results.filter((r) => !r.pass)
  if (failures.length > 0) {
    console.error(
      `\n${failures.length} contrast pair(s) below WCAG AA. Adjust src/styles/tokens.css.`,
    )
    process.exit(1)
  }
  console.log(`\nAll ${results.length} pairs meet WCAG AA.`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
