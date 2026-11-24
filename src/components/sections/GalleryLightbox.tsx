'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { ContentImage } from '@/components/primitives/ContentImage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { GalleryAlbum, GalleryItem } from '@/lib/content'

type GalleryLightboxProps = {
  items: GalleryItem[]
  albums: GalleryAlbum[]
}

export function GalleryLightbox({ items, albums }: GalleryLightboxProps) {
  const t = useTranslations('Sections')
  const [filter, setFilter] = useState<GalleryAlbum | 'all'>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible =
    filter === 'all' ? items : items.filter((item) => item.album === filter)

  const open = useCallback((index: number) => setOpenIndex(index), [])
  const close = useCallback(() => setOpenIndex(null), [])

  const step = useCallback(
    (delta: number) => {
      if (openIndex === null) return
      setOpenIndex((openIndex + delta + visible.length) % visible.length)
    },
    [openIndex, visible.length],
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, close, step])

  const current = openIndex === null ? null : visible[openIndex]

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
          className="min-h-11 rounded-pill border border-border px-4 text-step--1 font-semibold aria-pressed:border-primary aria-pressed:bg-tone-soft-bg"
        >
          {t('galleryAll')}
        </button>
        {albums.map((album) => (
          <button
            key={album}
            type="button"
            aria-pressed={filter === album}
            onClick={() => setFilter(album)}
            className="min-h-11 rounded-pill border border-border px-4 text-step--1 font-semibold aria-pressed:border-primary aria-pressed:bg-tone-soft-bg"
          >
            {t(`galleryAlbum.${album}`)}
          </button>
        ))}
      </div>
      <ul className="mt-8 columns-2 gap-4 md:columns-3">
        {visible.map((item, index) => (
          <li key={item.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              className="block w-full overflow-hidden rounded-media"
              onClick={() => open(index)}
            >
              <ContentImage
                image={item.image}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="h-auto w-full"
              />
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={current !== null} onOpenChange={(isOpen) => !isOpen && close()}>
        {current ? (
          <DialogContent showCloseButton closeLabel={t('galleryClose')} className="max-w-4xl">
            <DialogTitle className="sr-only">{current.image.alt}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('galleryCounter', { current: (openIndex ?? 0) + 1, total: visible.length })}
            </DialogDescription>
            <figure className="relative">
              <ContentImage
                image={current.image}
                sizes="90vw"
                className="mx-auto h-auto max-h-[70vh] w-auto rounded-media"
              />
              {current.caption ? (
                <figcaption className="mt-4 text-center text-step--1 text-fg-muted">
                  {current.caption}
                </figcaption>
              ) : null}
            </figure>
            <div className="mt-4 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t('galleryPrev')}
                onClick={() => step(-1)}
              >
                <ChevronLeftIcon aria-hidden="true" />
              </Button>
              <p aria-live="polite" className="tabular-nums">
                {t('galleryCounter', { current: (openIndex ?? 0) + 1, total: visible.length })}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t('galleryNext')}
                onClick={() => step(1)}
              >
                <ChevronRightIcon aria-hidden="true" />
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}