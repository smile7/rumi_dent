/**
 * Motion tokens for Motion for React (seconds + cubic-bezier arrays).
 * Mirrors `--duration-*` and `--ease-*` in `src/styles/tokens.css`; `tokens.test.ts` keeps them in sync.
 */
export const duration = {
  instant: 0.1,
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
  slower: 0.6,
} as const

export type CubicBezier = readonly [number, number, number, number]

export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1.2],
  exit: [0.3, 0, 1, 1],
} as const satisfies Record<string, CubicBezier>

/** Entrance reveal distance in px (DESIGN-SYSTEM §7: subtle, 8–16 px). */
export const revealOffset = 12
