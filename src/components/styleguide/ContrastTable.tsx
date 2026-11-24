'use client'

import { useSyncExternalStore } from 'react'

import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { Badge } from '@/components/ui/badge'
import { CONTRAST_PAIRS } from '@/lib/design/contrast-pairs'
import { ratioFromLuminance, relativeLuminanceFromSrgb8 } from '@/lib/design/contrast'

const tokenNames = [...new Set(CONTRAST_PAIRS.flatMap((pair) => [pair.fg, pair.bg]))]

function subscribe() {
  return () => {}
}

let canvasContext: CanvasRenderingContext2D | null = null

/**
 * The build rewrites token colors (e.g. oklch → lab), so let the browser convert: paint one
 * pixel with the computed value and read back 8-bit sRGB.
 */
function toSrgb8(color: string): string {
  canvasContext ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!canvasContext || !color) return ''
  canvasContext.clearRect(0, 0, 1, 1)
  canvasContext.fillStyle = color
  canvasContext.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = canvasContext.getImageData(0, 0, 1, 1).data
  return `${r},${g},${b}`
}

/** One `r,g,b` line per token; a string so the snapshot is stable between reads. */
function readTokens(): string {
  const style = getComputedStyle(document.documentElement)
  return tokenNames.map((name) => toSrgb8(style.getPropertyValue(`--${name}`).trim())).join('\n')
}

function luminanceOf(rgb: string | undefined): number | null {
  const channels = rgb?.split(',').map(Number)
  if (channels?.length !== 3 || channels.some(Number.isNaN)) return null
  const [r = 0, g = 0, b = 0] = channels
  return relativeLuminanceFromSrgb8([r, g, b])
}

function ratioFor(values: Map<string, string>, fg: string, bg: string): number | null {
  const fgLuminance = luminanceOf(values.get(fg))
  const bgLuminance = luminanceOf(values.get(bg))
  if (fgLuminance === null || bgLuminance === null) return null
  return ratioFromLuminance(fgLuminance, bgLuminance)
}

/** Live WCAG ratios for the pairs `pnpm contrast` enforces, measured from the rendered tokens. */
export function ContrastTable() {
  const snapshot = useSyncExternalStore(subscribe, readTokens, () => '')
  const snapshotValues = snapshot.split('\n')
  const values = new Map(tokenNames.map((name, index) => [name, snapshotValues[index] ?? '']))

  return (
    <div>
      <Heading as="h3" size="step-1" className="mb-2">
        Contrast pairs (WCAG 2.2 AA)
      </Heading>
      <Text tone="muted" size="small" className="mb-4">
        Text needs 4.5:1, large text and UI boundaries 3:1. The same pairs fail `pnpm check`.
      </Text>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTRAST_PAIRS.map((pair) => {
          const ratio = ratioFor(values, pair.fg, pair.bg)
          const pass = ratio !== null && ratio >= pair.min
          return (
            <li
              key={`${pair.fg}/${pair.bg}`}
              className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface p-3"
            >
              <span
                className="grid size-12 shrink-0 place-items-center rounded-sm border border-border font-display text-step-1 font-bold"
                style={{ color: `var(--${pair.fg})`, background: `var(--${pair.bg})` }}
                aria-hidden
              >
                Aa
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-step--1 font-semibold">{pair.use}</span>
                <code className="text-step--1 break-all text-fg-muted">
                  {`${pair.fg.replace('color-', '')} / ${pair.bg.replace('color-', '')}`}
                </code>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-step--1 font-semibold tabular-nums">
                  {ratio === null ? '…' : `${ratio.toFixed(2)}:1`}
                </span>
                {ratio !== null && (
                  <Badge variant={pass ? 'success' : 'danger'}>
                    {pass ? `≥ ${pair.min}` : `< ${pair.min}`}
                  </Badge>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
