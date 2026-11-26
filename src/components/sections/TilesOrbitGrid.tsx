'use client'

import { ChevronDownIcon } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useState } from 'react'

import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Heading } from '@/components/primitives/Heading'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/config/i18n'
import toothMascotCelebrate from '@/assets/brand/tooth-mascot-celebrate.png'
import type { TileItem, TilesSection } from '@/lib/content/types'
import { cn } from '@/lib/utils'

import { TilePanel } from './TilesGrid'

const TILE_PANEL_ID_PREFIX = 'tile-panel-'

type TilesOrbitGridProps = {
  items: Omit<TileItem, 'body'>[]
  bodies: Record<string, ReactNode>
  allowMultiple: TilesSection['allowMultiple']
  source: TilesSection['source']
  locale: Locale
  tileHeadingLevel: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

function OrbitTileList({
  items,
  bodies,
  allowMultiple,
  source,
  locale,
  tileHeadingLevel,
  openKeys,
  setOpenKeys,
  openFromFind,
  align,
}: Omit<TilesOrbitGridProps, 'items'> & {
  items: Omit<TileItem, 'body'>[]
  openKeys: Set<string>
  setOpenKeys: React.Dispatch<React.SetStateAction<Set<string>>>
  openFromFind: (key: string) => void
  align: 'start' | 'end'
}) {
  const t = useTranslations('Sections')

  const toggle = useCallback(
    (item: Omit<TileItem, 'body'>) => {
      setOpenKeys((prev) => {
        const next = new Set(allowMultiple ? prev : [])
        if (prev.has(item.key)) next.delete(item.key)
        else {
          next.add(item.key)
          if (item.slug) history.replaceState(null, '', `#${item.slug}`)
        }
        return next
      })
    },
    [allowMultiple, setOpenKeys],
  )

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openKeys.has(item.key)
        const panelId = `${TILE_PANEL_ID_PREFIX}${item.key}`
        const buttonId = `tile-${item.key}`
        const body = bodies[item.key]
        return (
          <li key={item.key} className="flex flex-col gap-3">
            <Heading as={tileHeadingLevel} size="step-0" className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item)}
                className={cn(
                  'group/tile flex w-full min-h-11 items-start gap-3 rounded-xl border border-border/70 bg-surface/90 p-4 text-left shadow-sm backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md',
                  isOpen && 'border-primary/40 shadow-md ring-2 ring-primary/15',
                  align === 'end' && 'md:flex-row-reverse md:text-end',
                )}
              >
                <span
                  className={cn(
                    'flex min-w-0 flex-1 flex-col gap-1',
                    align === 'end' && 'md:items-end',
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.icon ? (
                      <ContentIcon
                        name={item.icon}
                        className="size-5 shrink-0 text-primary transition-transform duration-(--duration-base) group-hover/tile:scale-110"
                      />
                    ) : null}
                    <span className="font-display text-step-0 font-bold text-balance">{item.title}</span>
                  </span>
                  {item.teaser && !isOpen ? (
                    <span className="line-clamp-2 text-step--1 text-fg-muted">{item.teaser}</span>
                  ) : null}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className={cn(
                    'size-5 shrink-0 text-primary transition-transform duration-(--duration-base)',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </Heading>
            <TilePanel
              panelId={panelId}
              buttonId={buttonId}
              itemKey={item.key}
              isOpen={isOpen}
              onBeforeMatch={openFromFind}
              className="rounded-xl border border-border/80 bg-surface-muted/95 p-5 shadow-sm backdrop-blur-sm"
            >
              {body}
              {item.cta?.link ? (
                <NextLink
                  href={item.cta.link.href}
                  className="mt-4 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {item.cta.label}
                </NextLink>
              ) : source === 'services' && item.slug && item.hasDetailPage ? (
                <Link
                  href={{ pathname: '/services/[slug]', params: { slug: item.slug } }}
                  locale={locale}
                  className="mt-4 inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {t('readMore')}
                </Link>
              ) : null}
            </TilePanel>
          </li>
        )
      })}
    </ul>
  )
}

export function TilesOrbitGrid({
  items,
  bodies,
  allowMultiple,
  source,
  locale,
  tileHeadingLevel,
}: TilesOrbitGridProps) {
  const listId = useId()
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set())
  const split = Math.ceil(items.length / 2)
  const left = items.slice(0, split)
  const right = items.slice(split)

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const match = items.find((item) => item.slug === hash)
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link on load
      setOpenKeys(new Set([match.key]))
    }
  }, [items])

  const openFromFind = useCallback((key: string) => {
    setOpenKeys((prev) => (prev.has(key) ? prev : new Set(prev).add(key)))
  }, [])

  const shared = {
    bodies,
    allowMultiple,
    source,
    locale,
    tileHeadingLevel,
    openKeys,
    setOpenKeys,
    openFromFind,
  }

  return (
    <div id={listId} className="relative mt-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl md:size-96"
      />
      <div className="relative grid gap-10 lg:grid-cols-[1fr_minmax(11rem,14rem)_1fr] lg:items-start lg:gap-8">
        <div className="order-2 lg:order-1">
          <OrbitTileList items={left} {...shared} align="end" />
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:sticky lg:top-28">
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute inset-0 scale-90 rounded-full bg-accent/25 blur-2xl"
            />
            <Image
              src={toothMascotCelebrate}
              alt=""
              width={280}
              height={280}
              className="relative z-10 w-40 drop-shadow-lg motion-safe:animate-[hero-drift_10s_ease-in-out_infinite] md:w-52"
            />
          </div>
        </div>

        <div className="order-3">
          <OrbitTileList items={right} {...shared} align="start" />
        </div>
      </div>
    </div>
  )
}