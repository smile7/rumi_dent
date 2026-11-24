export type SkipLinkProps = {
  /** `id` of the element to jump to (the `<main>` landmark). */
  targetId: string
  label: string
}

/** First focusable element on every page; hidden until focused (WCAG 2.4.1). */
export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-button bg-primary font-semibold text-primary-fg focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:px-4 focus:py-3"
    >
      {label}
    </a>
  )
}
