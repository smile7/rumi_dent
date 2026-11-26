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

/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- keyboard-scrollable snap row */
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
      {/* Nav arrows */}
      <div className="mb-4 flex justify-end gap-2 md:absolute md:-top-16 md:right-0 md:mb-0">
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

      {/* Scrollable row */}
      <ul
        ref={scroller}
        tabIndex={0}
        aria-label={t('testimonialsList')}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); scroll(1) }
          if (event.key === 'ArrowLeft') { event.preventDefault(); scroll(-1) }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="w-[min(100%,26rem)] shrink-0 snap-start"
          >
            <blockquote className="flex h-full flex-col gap-5 rounded-card bg-surface p-7 shadow-md ring-1 ring-border/60">
              {/* Stars – use repeat() so it's a computed expression, not a string literal */}
              {showRating && item.rating ? (
                <div aria-hidden="true" className="flex text-accent-400 text-step-1 tracking-wide">
                  {'★'.repeat(item.rating)}
                </div>
              ) : null}

              {/* Opening quote mark – concat forces a computed expression */}
              <span aria-hidden="true" className="font-display text-[3rem] leading-none text-brand-200 -mb-3 -mt-1">
                {'\u201e'.concat('')}
              </span>

              <Text className="flex-1 text-pretty leading-relaxed">
                {item.quote}
              </Text>

              <footer className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                {/* Avatar initials */}
                <div
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-step-0 font-bold text-primary"
                >
                  {item.authorName.charAt(0)}
                </div>
                <div>
                  <cite className="not-italic font-semibold text-step-0">
                    {item.authorName}
                  </cite>
                  {showRating && item.rating ? (
                    <p className="text-step--1 text-fg-muted">
                      <span className="sr-only">{t('ratingStars', { rating: item.rating })}</span>
                    </p>
                  ) : null}
                </div>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
