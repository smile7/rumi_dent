import { Fragment, type ReactNode } from 'react'

const STARRED = /\*([^*]+)\*/g

/**
 * Display headings may mark accent words with stars in the CMS: `Спокойни *усмивки*`. The starred
 * words render in the italic display cut (`.accent-italic`). Text without stars is returned as is.
 */
export function emphasize(text: string): ReactNode {
  const parts = text.split(STARRED)
  if (parts.length === 1) return text
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className="accent-italic">
        {part}
      </em>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

/** The same text without the accent stars (aria labels, metadata). */
export function stripEmphasis(text: string): string {
  return text.replace(STARRED, '$1')
}
