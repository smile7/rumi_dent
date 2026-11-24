'use client'

import { useState, type ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { cn } from '@/lib/utils'

type Audience = 'all' | 'children' | 'adults'

export type ServiceAudienceFilterProps = {
  labels: { group: string } & Record<Audience, string>
  children: ReactNode
}

const audiences: Audience[] = ['all', 'children', 'adults']

/**
 * Audience chips over prerendered service tiles: the wrapper's `data-audience-filter` hides
 * non-matching tiles with CSS (see `TilesGrid`). Without JS every tile stays visible.
 */
export function ServiceAudienceFilter({ labels, children }: ServiceAudienceFilterProps) {
  const [audience, setAudience] = useState<Audience>('all')

  return (
    <div data-audience-filter={audience}>
      {/* `html.js` is set by the inline script in the `[locale]` layout `<head>`; without JS the chips would be inert. */}
      <Container className="[html:not(.js)_&]:hidden">
        <div role="group" aria-label={labels.group}>
          <ul className="flex flex-wrap gap-2 pt-6">
            {audiences.map((value) => (
              <li key={value}>
                <button
                  type="button"
                  aria-pressed={audience === value}
                  onClick={() => setAudience(value)}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-pill border px-4 text-step--1 font-semibold transition-colors duration-(--duration-fast) ease-standard',
                    audience === value
                      ? 'border-primary bg-primary text-primary-fg'
                      : 'border-border-strong bg-surface text-fg hover:bg-muted',
                  )}
                >
                  {labels[value]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      {children}
    </div>
  )
}
