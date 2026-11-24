import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { checkPairs } from './check-contrast'

const styles = resolve(__dirname, '../src/styles')
const themes = [
  'tokens.css',
  ...readdirSync(resolve(styles, 'presets')).map((file) => `presets/${file}`),
]

describe.each(themes)('%s contrast pairs', (file) => {
  it('meets WCAG AA for every semantic pair', () => {
    const failures = checkPairs(readFileSync(resolve(styles, file), 'utf8'))
      .filter((r) => !r.pass)
      .map((r) => `${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 (min ${r.min})`)
    expect(failures).toEqual([])
  })
})
