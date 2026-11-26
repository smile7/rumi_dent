'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useState } from 'react'

import { Heading } from '@/components/primitives/Heading'
import { ContentIcon } from '@/components/primitives/ContentIcon'
import NextLink from 'next/link'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/config/i18n'
import type { TileItem, TilesSection } from '@/lib/content/types'
import { cn } from '@/lib/utils'

/** Hidden while an ancestor's `data-audience-filter` (services index chips) excludes the tile. */
const audienceFilterClass: Record<NonNullable<TileItem['audience']>, string> = {
  children: 'in-data-[audience-filter=adults]:hidden',
  adults: 'in-data-[audience-filter=children]:hidden',
  everyone: '',
}

type TilesGridProps = {
  items: Omit<TileItem, 'body'>[]
  bodies: Record<string, ReactNode>
  allowMultiple: TilesSection['allowMultiple']
  source: TilesSection['source']
  density: TilesSection['density']
  locale: Locale
  tileHeadingLevel: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function TilesGrid({
  items,
  bodies,
  allowMultiple,
  source,
  density,
  locale,
  tileHeadingLevel,
}: TilesGridProps) {
  const t = useTranslations('Sections')
  const listId = useId()
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set())

  const toggle = useCallback(
    (item: Omit<TileItem, 'body'>) => {
      setOpenKeys((prev) => {
        const next = new Set(allowMultiple ? prev : [])
        const isOpen = prev.has(item.key)
        if (isOpen) {
          next.delete(item.key)
        } else {
          next.add(item.key)
          if (item.slug) {
            history.replaceState(null, '', `#${item.slug}`)
          }
        }
        return next
      })
    },
    [allowMultiple],
  )

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const match = items.find((item) => item.slug === hash)
    if (!match) return
    // Hash is client-only; opening after mount avoids SSR/client open-state mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link on load (T06.4)
    setOpenKeys(new Set([match.key]))
  }, [items])

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const match = items.find((item) => item.slug === hash)
    if (!match || !openKeys.has(match.key)) return
    requestAnimationFrame(() => {
      document.getElementById(`tile-${match.key}`)?.scrollIntoView({ block: 'nearest' })
    })
  }, [openKeys, items])

  const cols =
    density === 'compact'
      ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'min-[30rem]:grid-cols-2 lg:grid-cols-3'

  return (
    <ul className={cn('grid grid-flow-dense gap-4', cols)} id={listId}>
      {items.map((item) => {
        const isOpen = openKeys.has(item.key)
        const panelId = `tile-panel-${item.key}`
        const buttonId = `tile-${item.key}`
        const body = bodies[item.key]
        return (
          <li key={item.key} className={cn('contents', audienceFilterClass[item.audience ?? 'everyone'])}>
            <Heading as={tileHeadingLevel} size="step-0" className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  toggle(item)
                }}
                className={cn(
                  'flex min-h-32 w-full flex-col items-start gap-3 rounded-tile bg-surface p-6 text-left',
                  'shadow-sm ring-1 ring-border/60 transition-[box-shadow,ring-color] duration-(--duration-base) ease-standard',
                  'hover:shadow-md hover:ring-brand-200',
                  isOpen && 'shadow-md ring-brand-300',
                )}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="flex flex-col gap-2">
                    {item.icon ? (
                      <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-primary">
                        <ContentIcon name={item.icon} />
                      </span>
                    ) : null}
                    <span className="font-display text-step-1 font-bold leading-snug">{item.title}</span>
                    {item.teaser ? (
                      <span className="text-step--1 leading-snug text-fg-muted">{item.teaser}</span>
                    ) : null}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={cn(
                      'size-5 shrink-0 text-fg-muted transition-transform duration-(--duration-base)',
                      isOpen && 'rotate-180 text-primary',
                    )}
                  />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-tile-panel=""
              data-open={isOpen ? 'true' : 'false'}
              // @ts-expect-error React 19.3: until-found for find-in-page
              hidden={isOpen ? undefined : 'until-found'}
              className="col-span-full rounded-card border border-border bg-surface-muted p-6"
              onBeforeMatch={() => setOpenKeys((prev) => new Set(prev).add(item.key))}
            >
              {body}
              {item.cta?.link ? (
                <NextLink
                  href={item.cta.link.href}
                  className="mt-6 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {item.cta.label}
                </NextLink>
              ) : source === 'services' && item.slug && item.hasDetailPage ? (
                <Link
                  href={{ pathname: '/services/[slug]', params: { slug: item.slug } }}
                  locale={locale}
                  className="mt-6 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {t('readMore')}
                </Link>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
