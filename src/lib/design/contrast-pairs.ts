/**
 * Semantic fg/bg pairs the components use, with their WCAG 2.2 AA minimum.
 * Checked by `pnpm contrast` and displayed with live ratios in /styleguide.
 */
export type ContrastPair = { fg: string; bg: string; min: number; use: string }

const TEXT = 4.5
const LARGE_OR_UI = 3

export const CONTRAST_PAIRS: ContrastPair[] = [
  { fg: 'color-fg', bg: 'color-bg', min: TEXT, use: 'body text' },
  { fg: 'color-fg', bg: 'color-surface', min: TEXT, use: 'text on cards' },
  { fg: 'color-fg', bg: 'color-surface-muted', min: TEXT, use: 'text on muted surfaces' },
  { fg: 'color-fg-muted', bg: 'color-bg', min: TEXT, use: 'secondary text' },
  { fg: 'color-fg-muted', bg: 'color-surface', min: TEXT, use: 'secondary text on cards' },
  { fg: 'color-fg-muted', bg: 'color-tone-soft-bg', min: TEXT, use: 'secondary text, soft tone' },
  { fg: 'color-link', bg: 'color-bg', min: TEXT, use: 'links' },
  { fg: 'color-link', bg: 'color-tone-soft-bg', min: TEXT, use: 'links, soft tone' },
  { fg: 'color-primary-fg', bg: 'color-primary', min: TEXT, use: 'primary button' },
  { fg: 'color-primary-fg', bg: 'color-primary-hover', min: TEXT, use: 'primary button hover' },
  { fg: 'color-accent-fg', bg: 'color-accent', min: TEXT, use: 'accent button / tile' },
  { fg: 'color-accent-fg', bg: 'color-accent-hover', min: TEXT, use: 'accent hover' },
  { fg: 'color-success-fg', bg: 'color-success', min: TEXT, use: 'success badge' },
  { fg: 'color-warning-fg', bg: 'color-warning', min: TEXT, use: 'warning badge' },
  { fg: 'color-danger-fg', bg: 'color-danger', min: TEXT, use: 'danger badge' },
  { fg: 'color-danger', bg: 'color-bg', min: TEXT, use: 'form error text' },
  { fg: 'color-danger', bg: 'color-surface', min: TEXT, use: 'form error text on cards' },
  { fg: 'color-success', bg: 'color-bg', min: TEXT, use: 'success text' },
  { fg: 'color-tone-base-fg', bg: 'color-tone-base-bg', min: TEXT, use: 'section tone base' },
  { fg: 'color-tone-soft-fg', bg: 'color-tone-soft-bg', min: TEXT, use: 'section tone soft' },
  { fg: 'color-tone-brand-fg', bg: 'color-tone-brand-bg', min: TEXT, use: 'section tone brand' },
  { fg: 'color-tone-accent-fg', bg: 'color-tone-accent-bg', min: TEXT, use: 'section tone accent' },
  {
    fg: 'color-tone-inverse-fg',
    bg: 'color-tone-inverse-bg',
    min: TEXT,
    use: 'section tone inverse',
  },
  { fg: 'color-focus', bg: 'color-bg', min: LARGE_OR_UI, use: 'focus ring' },
  { fg: 'color-focus', bg: 'color-surface', min: LARGE_OR_UI, use: 'focus ring on cards' },
  { fg: 'color-focus', bg: 'color-tone-soft-bg', min: LARGE_OR_UI, use: 'focus ring, soft tone' },
  {
    fg: 'color-focus-on-dark',
    bg: 'color-tone-brand-bg',
    min: LARGE_OR_UI,
    use: 'focus ring, brand tone',
  },
  {
    fg: 'color-focus-on-dark',
    bg: 'color-tone-inverse-bg',
    min: LARGE_OR_UI,
    use: 'focus ring, inverse tone',
  },
  { fg: 'color-border-strong', bg: 'color-surface', min: LARGE_OR_UI, use: 'input border' },
  { fg: 'color-border-strong', bg: 'color-bg', min: LARGE_OR_UI, use: 'input border on page' },
]
