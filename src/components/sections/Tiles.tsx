import { ArrowUpRightIcon, PlusIcon } from 'lucide-react'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'

import { Mascot } from '@/components/brand/Mascot'
import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Heading } from '@/components/primitives/Heading'
import type { Locale } from '@/config/i18n'
import { Link } from '@/i18n/navigation'
import { RichText } from '@/lib/content'
import type { TileItem, TilesSection as TilesModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionHeading } from './SectionHeading'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel, subsectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

type Level = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/** Hidden while an ancestor's `data-audience-filter` (services index chips) excludes the tile. */
const audienceFilterClass: Record<NonNullable<TileItem['audience']>, string> = {
  children: 'in-data-[audience-filter=adults]:hidden',
  adults: 'in-data-[audience-filter=children]:hidden',
  everyone: '',
}

/** The playful tints cycle across the children's cards (decorative only, never text). */
const tints = ['bg-brand-100', 'bg-accent-100', 'bg-sky-100', 'bg-blush-200'] as const

const twoDigits = (n: number) => String(n).padStart(2, '0')

function tileHref(item: TileItem, source: TilesModel['source']) {
  if (item.cta?.link?.href) return { kind: 'external' as const, href: item.cta.link.href }
  if (source === 'services' && item.slug && item.hasDetailPage) {
    return { kind: 'service' as const, slug: item.slug }
  }
  return null
}

function TileLink({
  item,
  source,
  locale,
  className,
  children,
}: {
  item: TileItem
  source: TilesModel['source']
  locale: Locale
  className?: string
  children: React.ReactNode
}) {
  const target = tileHref(item, source)
  if (!target) return <span className={className}>{children}</span>
  if (target.kind === 'external') {
    return (
      <NextLink href={target.href} className={className}>
        {children}
      </NextLink>
    )
  }
  return (
    <Link
      href={{ pathname: '/services/[slug]', params: { slug: target.slug } }}
      locale={locale}
      className={className}
    >
      {children}
    </Link>
  )
}

/** Optional long text: a native disclosure, so it works without JS and in find-in-page. */
async function TileBody({ item }: { item: TileItem }) {
  if (!item.body) return null
  const t = await getTranslations('Sections')
  return (
    <details className="group/details mt-4 border-t border-border pt-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
        <span className="group-open/details:hidden">{t('tileExpand')}</span>
        <span className="hidden group-open/details:inline">{t('tileCollapse')}</span>
        <PlusIcon
          aria-hidden="true"
          className="size-5 text-primary transition-transform duration-(--duration-base) group-open/details:rotate-45"
        />
      </summary>
      <div className="pt-2 pb-1 prose-theme text-step--1">
        <RichText value={item.body} />
      </div>
    </details>
  )
}

/** Large illustrated card: an arch window with the icon, a serif index, the title and teaser. */
async function FeatureCard({
  item,
  index,
  source,
  locale,
  level,
}: {
  item: TileItem
  index: number
  source: TilesModel['source']
  locale: Locale
  level: Level
}) {
  const linked = tileHref(item, source) !== null
  return (
    <li
      id={item.slug}
      className={cn(
        'group/tile relative flex flex-row rounded-xl border border-border bg-surface p-2 shadow-sm transition-[box-shadow,transform] duration-(--duration-base) ease-standard hover:-translate-y-1 hover:shadow-lg sm:flex-col sm:p-2.5',
        index % 3 === 1 && 'lg:translate-y-10 lg:hover:translate-y-9',
        item.audience && audienceFilterClass[item.audience],
      )}
    >
      <div
        className={cn(
          'relative w-24 shrink-0 overflow-hidden rounded-[calc(var(--radius-xl)-0.5rem)] sm:h-44 sm:w-auto sm:rounded-[calc(var(--radius-xl)-0.625rem)]',
          tints[index % tints.length],
        )}
      >
        <span className="absolute top-4 left-5 hidden font-display text-step-1 italic opacity-70 sm:block">
          {twoDigits(index + 1)}
        </span>
        <div
          aria-hidden="true"
          className="absolute -right-8 -bottom-10 hidden size-36 rounded-pill border border-ink-900/10 sm:block"
        />
        <div className="shape-arch absolute bottom-0 left-1/2 grid h-[72%] w-16 -translate-x-1/2 place-items-center bg-neutral-0/70 transition-[height] duration-(--duration-slow) ease-emphasized sm:h-32 sm:w-28 sm:group-hover/tile:h-36">
          {item.icon ? (
            <ContentIcon
              name={item.icon}
              className="size-7 stroke-[1.25] text-ink-900 transition-transform duration-(--duration-slow) ease-emphasized group-hover/tile:-rotate-6 sm:size-11"
            />
          ) : null}
        </div>
      </div>
      <div className="flex grow flex-col gap-1.5 px-4 py-3 sm:gap-2 sm:px-3.5 sm:pt-5 sm:pb-3">
        <Heading as={level} size="step-2" className="text-step-1 text-pretty sm:text-step-2">
          <TileLink
            item={item}
            source={source}
            locale={locale}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
          >
            {item.title}
          </TileLink>
        </Heading>
        {item.teaser ? (
          <p className="text-step--1 leading-relaxed text-fg-muted">{item.teaser}</p>
        ) : null}
        {linked ? (
          <span
            aria-hidden="true"
            className="mt-auto hidden size-10 place-items-center self-end rounded-pill border border-border transition-colors duration-(--duration-base) group-hover/tile:border-primary group-hover/tile:bg-primary group-hover/tile:text-primary-fg sm:grid"
          >
            <ArrowUpRightIcon className="size-4" />
          </span>
        ) : null}
        {linked ? null : <TileBody item={item} />}
      </div>
    </li>
  )
}

/** Quiet hairline row for the secondary (adult) group. */
async function ListRow({
  item,
  index,
  source,
  locale,
  level,
}: {
  item: TileItem
  index: number
  source: TilesModel['source']
  locale: Locale
  level: Level
}) {
  const linked = tileHref(item, source) !== null
  return (
    <li
      id={item.slug}
      className={cn(
        'group/row relative grid grid-cols-[2.75rem_1fr_auto] items-start gap-x-4 border-t border-border py-6',
        item.audience && audienceFilterClass[item.audience],
      )}
    >
      <span className="pt-1 font-display text-step-0 text-fg-muted italic">
        {twoDigits(index + 1)}
      </span>
      <div className="flex flex-col gap-1.5">
        <Heading as={level} size="step-1" className="text-pretty">
          <TileLink
            item={item}
            source={source}
            locale={locale}
            className="outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-focus"
          >
            {item.title}
          </TileLink>
        </Heading>
        {item.teaser ? (
          <p className="text-step--1 leading-relaxed text-fg-muted">{item.teaser}</p>
        ) : null}
        {linked ? null : <TileBody item={item} />}
      </div>
      {linked ? (
        <ArrowUpRightIcon
          aria-hidden="true"
          className="mt-1 size-5 text-primary transition-transform duration-(--duration-base) group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5"
        />
      ) : (
        <span />
      )}
    </li>
  )
}

type Group = { key: string; label?: string; items: TileItem[]; style: 'feature' | 'list' }

export async function TilesSection({
  section: raw,
  index,
  sections,
  locale,
}: SectionComponentProps) {
  const section = raw as TilesModel
  const t = await getTranslations('Services')
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const groupLevel = subsectionHeadingLevel(level)

  const byAudience = (audience: TileItem['audience']) =>
    section.items.filter((item) => (item.audience ?? 'everyone') === audience)
  const grouped =
    section.source === 'services' &&
    byAudience('children').length > 0 &&
    byAudience('adults').length > 0
  const groups: Group[] = grouped
    ? [
        { key: 'children', label: t('children'), items: byAudience('children'), style: 'feature' },
        { key: 'adults', label: t('adults'), items: byAudience('adults'), style: 'list' },
        { key: 'everyone', items: byAudience('everyone'), style: 'list' },
      ]
    : [
        {
          key: 'all',
          items: section.items,
          style: section.density === 'compact' && section.items.length > 4 ? 'list' : 'feature',
        },
      ]
  const itemLevel = grouped ? subsectionHeadingLevel(groupLevel) : groupLevel

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <SectionHeading
        id={titleId}
        level={level}
        heading={section.heading}
        intro={section.intro}
        size="step-4"
      />
      <div className="mt-[clamp(2.5rem,1.5rem+3vw,4.5rem)] flex flex-col gap-[clamp(3.5rem,2rem+4vw,6rem)]">
        {groups
          .filter((group) => group.items.length > 0)
          .map((group, groupIndex) => (
            <div
              key={group.key}
              className={cn(
                'relative',
                group.key === 'adults' && audienceFilterClass.adults,
                group.key === 'children' && audienceFilterClass.children,
              )}
            >
              {group.label ? (
                <div className="mb-7 flex items-center gap-4">
                  <Heading as={groupLevel} size="step-0" className="eyebrow font-body!">
                    {group.label}
                  </Heading>
                  <span aria-hidden="true" className="h-px grow bg-border" />
                  <span className="text-step--1 text-fg-muted tabular-nums">
                    {twoDigits(group.items.length)}
                  </span>
                </div>
              ) : null}
              {group.style === 'feature' ? (
                <>
                  {groupIndex === 0 ? (
                    <Mascot
                      name="shield"
                      sizes="8rem"
                      className="animate-float-slow pointer-events-none absolute -top-24 right-2 z-10 hidden w-28 rotate-6 drop-shadow-lg md:block"
                    />
                  ) : null}
                  <ul className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', 'lg:pb-10')}>
                    {group.items.map((item, i) => (
                      <FeatureCard
                        key={item.key}
                        item={item}
                        index={i}
                        source={section.source}
                        locale={locale}
                        level={itemLevel}
                      />
                    ))}
                  </ul>
                </>
              ) : (
                <ul className="grid gap-x-12 rounded-xl border border-border bg-surface px-6 pb-2 md:grid-cols-2 md:px-10 [&>li:first-child]:border-t-0 [&>li:nth-child(-n+2)]:md:border-t-0">
                  {group.items.map((item, i) => (
                    <ListRow
                      key={item.key}
                      item={item}
                      index={i}
                      source={section.source}
                      locale={locale}
                      level={itemLevel}
                    />
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>
    </SectionShell>
  )
}
