import { getTranslations } from 'next-intl/server'

import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import type { TeamMember, TeamSection as TeamModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionHeading } from './SectionHeading'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel, subsectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

const portraitTints = ['bg-brand-100', 'bg-accent-100', 'bg-sky-100'] as const

/** Whole years since `since`, at build time (the static site is rebuilt on every publish). */
function yearsSince(since: number) {
  return Math.max(0, new Date().getFullYear() - since)
}

async function TeamCard({
  member,
  index,
  level,
}: {
  member: TeamMember
  index: number
  level: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}) {
  const t = await getTranslations('Sections')
  const years = member.practisingSince ? yearsSince(member.practisingSince) : undefined
  const name = [member.honorific, member.name].filter(Boolean).join(' ')

  return (
    <article id={member.id} className="flex flex-col gap-7">
      <div className="relative">
        <div
          className={cn(
            'shape-arch relative aspect-[4/5] overflow-hidden',
            portraitTints[index % portraitTints.length],
          )}
        >
          {member.photo ? (
            <ContentImage
              image={member.photo}
              sizes="(min-width: 1024px) 34rem, (min-width: 768px) 45vw, 92vw"
              fill
              className="object-cover object-top transition-transform duration-(--duration-slow) ease-emphasized hover:scale-[1.03]"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="shape-arch absolute inset-3 border border-neutral-0/50"
          />
        </div>
        {years ? (
          <p className="absolute right-[-0.5rem] bottom-8 grid size-32 place-content-center rounded-pill bg-accent text-center text-accent-fg shadow-xl md:right-[-1.5rem] md:size-36">
            <span className="font-display text-[3rem] leading-none font-light">{years}</span>
            <span className="mt-1 max-w-[6rem] text-step--2 leading-tight font-bold tracking-wide uppercase">
              {t('teamYears', { count: years })}
            </span>
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 px-1">
        <p className="eyebrow">{member.role}</p>
        <Heading as={level} size="step-3" className="text-balance">
          {name}
        </Heading>
        {member.bioShort ? (
          <p className="max-w-[32rem] leading-relaxed text-pretty text-fg-muted">
            {member.bioShort}
          </p>
        ) : null}
        {member.specialties.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {member.specialties.map((specialty) => (
              <li
                key={specialty}
                className="rounded-pill border border-border px-3.5 py-1.5 text-step--1 font-semibold"
              >
                {specialty}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

export function TeamSection({ section: raw, index, sections }: SectionComponentProps) {
  const section = raw as TeamModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const cardLevel = subsectionHeadingLevel(level)
  const members =
    section.layout === 'featuredFirst'
      ? [...section.members].sort((a, b) => Number(b.featured) - Number(a.featured))
      : section.members
  const pair = members.length <= 2

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <SectionHeading id={titleId} level={level} heading={section.heading} intro={section.intro} />
      <ul
        className={cn(
          'mt-[clamp(3rem,2rem+3vw,5rem)] grid gap-x-[clamp(2rem,1rem+5vw,7rem)] gap-y-16',
          pair ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {members.map((member, i) => (
          <li key={member.id} className={cn(i % 2 === 1 && (pair ? 'md:mt-32' : 'lg:mt-20'))}>
            <TeamCard member={member} index={i} level={cardLevel} />
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
