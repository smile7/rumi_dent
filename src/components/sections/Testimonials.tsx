import { StarIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import type { Testimonial, TestimonialsSection as TestimonialsModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionHeading } from './SectionHeading'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

/** Decorative typographic quote mark (not content). */
const CLOSE_QUOTE = '\u201D'

/** The first letter of the name: "Мария, майка на Ники" → "М". */
const initial = (name: string) => name.trim().charAt(0).toUpperCase()

const avatarTints = ['bg-accent-200', 'bg-brand-200', 'bg-blush-200', 'bg-sky-300'] as const

async function Rating({ rating }: { rating: number }) {
  const t = await getTranslations('Sections')
  return (
    <p className="flex gap-0.5 text-accent-600" aria-label={t('ratingStars', { rating })}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          aria-hidden="true"
          className={cn('size-4', i < rating ? 'fill-current' : 'opacity-30')}
        />
      ))}
    </p>
  )
}

function Author({ item, index }: { item: Testimonial; index: number }) {
  return (
    <footer className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-pill font-display text-step-0 text-ink-900',
          avatarTints[index % avatarTints.length],
        )}
      >
        {initial(item.authorName)}
      </span>
      <cite className="text-step--1 font-bold not-italic">{item.authorName}</cite>
    </footer>
  )
}

export function TestimonialsSection({ section: raw, index, sections }: SectionComponentProps) {
  const section = raw as TestimonialsModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const [lead, ...rest] = section.items
  if (!lead) return null

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <SectionHeading id={titleId} level={level} heading={section.heading} size="step-3" />
      <div className="mt-[clamp(2.5rem,1.5rem+3vw,4.5rem)] grid gap-6 lg:grid-cols-12">
        {/* The first voice as a large pull quote. */}
        <blockquote className="relative flex flex-col justify-between gap-10 overflow-hidden rounded-xl bg-ink-900 p-8 text-neutral-0 md:p-12 lg:col-span-7 lg:row-span-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 right-6 font-display text-[12rem] leading-none text-accent-300/30 select-none"
          >
            {CLOSE_QUOTE}
          </span>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-pill border border-neutral-0/10"
          />
          {section.showRating && lead.rating ? (
            <div className="relative [&_p]:text-accent-300">
              <Rating rating={lead.rating} />
            </div>
          ) : null}
          <p className="relative font-display text-step-3 leading-[1.2] font-light text-balance">
            {lead.quote}
          </p>
          <div className="relative [&_span]:bg-accent-300">
            <Author item={lead} index={0} />
          </div>
        </blockquote>

        {rest.map((item, i) => (
          <blockquote
            key={item.id}
            className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-7 shadow-sm md:p-9 lg:col-span-5"
          >
            {section.showRating && item.rating ? <Rating rating={item.rating} /> : null}
            <p className="grow font-display text-step-1 leading-snug text-pretty">{item.quote}</p>
            <Author item={item} index={i + 1} />
          </blockquote>
        ))}
      </div>
    </SectionShell>
  )
}
