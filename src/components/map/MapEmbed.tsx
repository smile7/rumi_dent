'use client'

import { useId, useState, type ReactNode } from 'react'

import { useConsent } from '@/components/consent/ConsentProvider'
import { Button } from '@/components/ui/button'

type MapEmbedProps = {
  /** Google Maps embed address from Site settings. */
  embedUrl: string
  /** Accessible name of the iframe. */
  title: string
  loadLabel: string
  notice: string
  /** Label of the checkbox that grants the `embeds` consent category. */
  alwaysAllowLabel: string
  /** The placeholder shown until the click: the editor's preview image or the styled fallback. */
  children: ReactNode
}

function focusOnMount(node: HTMLIFrameElement | null) {
  node?.focus()
}

/**
 * Click-to-load Google map: nothing is requested from Google until the visitor asks for it, or
 * until they allowed external content (consent category `embeds`).
 */
export function MapEmbed({
  embedUrl,
  title,
  loadLabel,
  notice,
  alwaysAllowLabel,
  children,
}: MapEmbedProps) {
  const consent = useConsent()
  const [clicked, setClicked] = useState(false)
  const [alwaysAllow, setAlwaysAllow] = useState(false)
  const checkboxId = useId()

  if (clicked || consent.has('embeds')) {
    return (
      <iframe
        // Focus follows a click only; a map loaded from stored consent must not steal focus.
        ref={clicked ? focusOnMount : undefined}
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="aspect-square w-full rounded-card border border-border sm:aspect-video"
      />
    )
  }

  function load() {
    if (alwaysAllow) consent.save([...(consent.consent?.categories ?? []), 'embeds'])
    setClicked(true)
  }

  return (
    <div className="relative isolate flex aspect-square w-full flex-col items-center justify-end overflow-hidden rounded-card border border-border bg-surface-muted p-4 sm:aspect-video sm:p-6">
      <div className="absolute inset-0 -z-10">{children}</div>
      <div className="flex max-w-sm flex-col items-center gap-2 rounded-card bg-surface p-4 text-center shadow-sm">
        <Button type="button" onClick={load}>
          {loadLabel}
        </Button>
        <p className="text-step--1 text-fg-muted">{notice}</p>
        <label htmlFor={checkboxId} className="flex min-h-6 items-center gap-2 text-step--1">
          <input
            id={checkboxId}
            type="checkbox"
            checked={alwaysAllow}
            onChange={(event) => setAlwaysAllow(event.target.checked)}
            className="size-5 accent-primary"
          />
          {alwaysAllowLabel}
        </label>
      </div>
    </div>
  )
}
