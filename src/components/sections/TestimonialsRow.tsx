'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/primitives/Text'
import type { Testimonial } from '@/lib/content'

type TestimonialsRowProps = {
  items: Testimonial[]
  showRating: boolean
}

/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- T06.6 keyboard-scrollable snap row */
export function TestimonialsRow({ items, showRating }: TestimonialsRowProps) {
  const t = useTranslations('Sections')
  const scroller = useRef<HTMLUListElement>(null)

  const scroll = (direction: -1 | 1) => {
    const node = scroller.current
    if (!node) return
    const card = node.querySelector<HTMLElement>('li')
    const delta = card ? card.offsetWidth + 16 : node.clientWidth
    node.scrollBy({ left: direction * delta, behavior: 'smooth' })
  }

  return (
    <div className="relative mt-8">
      <div className="mb-4 flex justify-end gap-2 md:absolute md:-top-14 md:right-0 md:mb-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t('testimonialsPrev')}
          onClick={() => scroll(-1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t('testimonialsNext')}
          onClick={() => scroll(1)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
      <ul
        ref={scroller}
        tabIndex={0}
        aria-label={t('testimonialsList')}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            scroll(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scroll(-1)
          }
        }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="w-[min(100%,22rem)] shrink-0 snap-start rounded-card border-2 border-border/80 bg-surface p-6 shadow-sm"
          >
            <blockquote className="flex h-full flex-col gap-4">
              <Text className="text-pretty">
                {['\u201e', item.quote, '\u201c'].join('')}
              </Text>
              <footer className="mt-auto">
                <cite className="not-italic font-semibold">{item.authorName}</cite>
                {showRating && item.rating ? (
                  <span className="mt-1 block text-step--1 text-fg-muted">
                    <span className="sr-only">{t('ratingStars', { rating: item.rating })}</span>
                    <span aria-hidden="true">{'★'.repeat(item.rating)}</span>
                  </span>
                ) : null}
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */