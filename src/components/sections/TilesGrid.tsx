'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

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

const tileSurfaceClass: Record<NonNullable<TileItem['audience']>, string> = {
  children: 'tile-surface-children',
  adults: 'tile-surface-adults',
  everyone: 'tile-surface-everyone',
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
  const listRef = useRef<HTMLUListElement>(null)
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

  // React 19.3 serializes `hidden` as a boolean and has no `onBeforeMatch`, so
  // `until-found` (browser find-in-page) is applied and listened to on the DOM.
  useEffect(() => {
    const panels = listRef.current?.querySelectorAll<HTMLElement>('[data-tile-panel]') ?? []
    for (const panel of panels) {
      const key = panel.dataset.tileKey
      if (key && openKeys.has(key)) panel.removeAttribute('hidden')
      else panel.setAttribute('hidden', 'until-found')
    }
  }, [openKeys])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const onBeforeMatch = (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return
      const key = event.target.dataset.tileKey
      if (!key) return
      setOpenKeys((prev) => new Set(allowMultiple ? prev : []).add(key))
    }
    list.addEventListener('beforematch', onBeforeMatch)
    return () => list.removeEventListener('beforematch', onBeforeMatch)
  }, [allowMultiple])

  const cols =
    density === 'compact'
      ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'min-[30rem]:grid-cols-2 lg:grid-cols-3'

  return (
    <ul ref={listRef} className={cn('grid grid-flow-dense gap-5', cols)} id={listId}>
      {items.map((item, itemIndex) => {
        const isOpen = openKeys.has(item.key)
        const panelId = `tile-panel-${item.key}`
        const buttonId = `tile-${item.key}`
        const body = bodies[item.key]
        return (
          <li
            key={item.key}
            className={cn(
              'contents',
              audienceFilterClass[item.audience ?? 'everyone'],
              itemIndex === 0 && density !== 'compact' && 'tile-bento-feature',
            )}
          >
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
                  'flex min-h-36 w-full flex-col items-start gap-3 rounded-tile border-2 border-border/60 p-6 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-(--duration-base) ease-emphasized hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md motion-reduce:hover:translate-y-0',
                  tileSurfaceClass[item.audience ?? 'everyone'],
                  isOpen && 'border-primary/40 shadow-md',
                  itemIndex === 0 && density !== 'compact' && 'min-h-40 lg:min-h-44',
                )}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="flex flex-col gap-3">
                    {item.icon ? (
                      <span className="tile-icon-well" aria-hidden="true">
                        <ContentIcon name={item.icon} />
                      </span>
                    ) : null}
                    <span className="font-display text-step-1 font-extrabold">{item.title}</span>
                    {item.teaser ? (
                      <span className="text-step--1 text-fg-muted">{item.teaser}</span>
                    ) : null}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={cn(
                      'size-6 shrink-0 text-primary transition-transform duration-(--duration-base)',
                      isOpen && 'rotate-180',
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
              data-tile-key={item.key}
              data-open={isOpen ? 'true' : 'false'}
              className="col-span-full rounded-card border border-border bg-surface-muted p-6"
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