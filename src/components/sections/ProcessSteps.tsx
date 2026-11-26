import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Heading } from '@/components/primitives/Heading'
import type { ProcessStepsSection } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionHeading } from './SectionHeading'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel, subsectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

/** Staggered on wide screens so the path reads as a gentle walk, not a table. */
const stagger = ['', 'lg:mt-24', 'lg:mt-12', 'lg:mt-32'] as const
/** The same offsets in px (`mt-24` = 96px …) plus half the 64px icon: the icon centres. */
const staggerPx = [0, 96, 48, 128] as const
const ICON_HALF = 32
const VIEW_W = 1200

/** A soft dashed curve through every step icon (desktop), horizontal tangents at each icon. */
function pathThroughIcons(count: number) {
  const points = Array.from({ length: count }, (_, i) => ({
    x: (i * VIEW_W) / count + ICON_HALF,
    y: (staggerPx[i % staggerPx.length] ?? 0) + ICON_HALF,
  }))
  const last = points[points.length - 1]
  if (!last) return ''
  points.push({ x: VIEW_W - 8, y: last.y - 24 })
  return points
    .map((point, i) => {
      if (i === 0) return `M${point.x} ${point.y}`
      const prev = points[i - 1] ?? point
      const mid = (prev.x + point.x) / 2
      return `C${mid} ${prev.y}, ${mid} ${point.y}, ${point.x} ${point.y}`
    })
    .join(' ')
}

export async function ProcessStepsSection({
  section: raw,
  index,
  sections,
  site,
}: SectionComponentProps) {
  const section = raw as ProcessStepsSection
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const stepLevel = subsectionHeadingLevel(level)
  const dark = section.tone === 'brand' || section.tone === 'inverse'
  const count = section.steps.length

  return (
    <SectionShell
      section={section}
      labelledBy={section.heading ? titleId : undefined}
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -top-40 -right-40 size-[34rem] rounded-pill border',
          dark ? 'border-neutral-0/10' : 'border-primary/10',
        )}
      />
      <SectionHeading id={titleId} level={level} heading={section.heading} intro={section.intro} />

      <div className="relative mt-[clamp(3rem,2rem+4vw,6rem)]">
        {/* The dashed path: a wave across on desktop, a straight line down on mobile. */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${VIEW_W} 200`}
          preserveAspectRatio="none"
          className={cn(
            'absolute inset-x-0 top-0 hidden h-[200px] w-full fill-none lg:block',
            dark ? 'stroke-accent-300/50' : 'stroke-primary/40',
          )}
        >
          <path
            d={pathThroughIcons(count)}
            strokeWidth="1.5"
            strokeDasharray="2 10"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-6 bottom-6 left-[1.6rem] border-l border-dashed lg:hidden',
            dark ? 'border-accent-300/40' : 'border-primary/40',
          )}
        />

        <ol
          className={cn(
            'relative grid gap-12 lg:gap-8',
            count === 4 ? 'lg:grid-cols-4' : count === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3',
          )}
        >
          {section.steps.map((step, i) => (
            <li
              key={step.key}
              className={cn(
                'relative grid grid-cols-[3.25rem_1fr] gap-x-5 lg:block lg:pe-10',
                stagger[i % stagger.length],
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 grid size-13 place-items-center rounded-pill shadow-lg lg:size-16',
                  dark ? 'bg-accent text-accent-fg' : 'bg-primary text-primary-fg',
                )}
              >
                {step.icon ? (
                  <ContentIcon name={step.icon} className="size-6 stroke-[1.5]" />
                ) : (
                  <span className="font-display text-step-1">{i + 1}</span>
                )}
              </span>
              <div className="relative lg:mt-8">
                <span
                  aria-hidden="true"
                  className={cn(
                    'numeral-outline pointer-events-none absolute -top-12 right-0 font-display text-[clamp(6rem,4rem+6vw,10rem)] leading-none font-light select-none lg:-top-36 lg:right-6',
                    dark
                      ? '[--numeral-stroke:oklch(1_0_0/0.22)]'
                      : '[--numeral-stroke:var(--color-brand-300)]',
                  )}
                >
                  {i + 1}
                </span>
                <Heading as={stepLevel} size="step-2" className="relative text-balance">
                  {step.title}
                </Heading>
                {step.text ? (
                  <p className="relative mt-3 max-w-[22rem] leading-relaxed text-pretty text-fg-muted opacity-90">
                    {step.text}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {section.cta ? (
        <SectionCtas ctas={[section.cta]} site={site} onDark={dark} className="mt-16" />
      ) : null}
    </SectionShell>
  )
}
