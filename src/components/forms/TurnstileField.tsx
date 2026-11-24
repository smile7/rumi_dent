'use client'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useEffect, useRef, useState } from 'react'

export type TurnstileFieldProps = {
  siteKey: string
  language: string
  /** Changes after every server answer: tokens are single-use, so the widget gets a fresh one. */
  resetSignal: unknown
}

/**
 * Cloudflare Turnstile, loaded only when the form comes near the viewport (LEGAL-GDPR §1).
 * The widget writes its token into the hidden `cf-turnstile-response` input of the form.
 */
export function TurnstileField({ siteKey, language, resetSignal }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TurnstileInstance>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    widgetRef.current?.reset()
  }, [resetSignal])

  return (
    <div ref={containerRef}>
      {near ? (
        <Turnstile
          ref={widgetRef}
          siteKey={siteKey}
          options={{
            appearance: 'interaction-only',
            size: 'flexible',
            language,
            retry: 'auto',
            refreshExpired: 'auto',
            refreshTimeout: 'auto',
          }}
        />
      ) : null}
    </div>
  )
}
