import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { Link } from '@/i18n/navigation'
import type { TeamMember, TeamSection as TeamModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

type TeamCardProps = {
  member: TeamMember
  /** Reverse the layout (image right) on alternating cards. */
  flip?: boolean
  linked?: boolean
}

function TeamCard({ member, flip = false, linked = false }: TeamCardProps) {
  const inner = (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card bg-surface shadow-md transition-shadow duration-(--duration-base) hover:shadow-lg',
        'md:flex-row md:min-h-[22rem]',
        flip && 'md:flex-row-reverse',
      )}
    >
      {/* Photo */}
      {member.photo ? (
        <div className="relative shrink-0 overflow-hidden md:w-2/5">
          <ContentImage
            image={member.photo}
            sizes="(min-width: 768px) 22vw, 100vw"
            className="h-56 w-full object-cover object-top md:h-full"
          />
          {/* Gradient overlay for desktop */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 hidden md:block',
              flip
                ? 'bg-gradient-to-l from-transparent to-surface/10'
                : 'bg-gradient-to-r from-transparent to-surface/10',
            )}
          />
        </div>
      ) : null}

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center gap-4 p-7 lg:p-9">
        {/* Accent line */}
        <div className="h-1 w-10 rounded-full bg-accent" aria-hidden="true" />

        <div>
          <Heading as="h3" size="step-2" className="font-extrabold">
            {member.name}
          </Heading>
          <Text tone="muted" className="mt-1 font-medium">
            {member.role}
          </Text>
        </div>

        <Text className="leading-relaxed text-fg-muted">{member.bioShort}</Text>

        {member.specialties.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Специализации">
            {member.specialties.map((s) => (
              <li
                key={s}
                className="rounded-pill border border-brand-200 bg-brand-50 px-3 py-1 text-step--1 text-primary"
              >
                {s}
              </li>
            ))}
          </ul>
        ) : null}

        {member.credentials.length > 0 ? (
          <ul className="flex flex-col gap-1 border-t border-border pt-4">
            {member.credentials.map((c) => (
              <li key={c.label} className="flex items-baseline gap-2 text-step--1 text-fg-muted">
                <span className="size-1.5 shrink-0 translate-y-[-1px] rounded-full bg-accent" aria-hidden="true" />
                {c.label}
                {c.year ? <span className="text-fg-muted opacity-60">{c.year}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )

  if (linked) {
    return (
      <Link
        href={{ pathname: '/about', hash: member.id }}
        className="block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
        tabIndex={0}
      >
        {inner}
      </Link>
    )
  }
  return inner
}

export function TeamSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as TeamModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const linked = section.layout === 'grid'

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      {section.intro ? (
        <Text tone="muted" className="mt-4 max-w-(--container-prose)">
          {section.intro}
        </Text>
      ) : null}

      {section.members.length <= 2 ? (
        /* Intentional 2-person layout: stacked, full-width editorial cards */
        <ul className="mt-10 flex flex-col gap-6">
          {section.members.map((member, i) => (
            <li key={member.id}>
              <TeamCard member={member} flip={i % 2 === 1} linked={linked} />
            </li>
          ))}
        </ul>
      ) : (
        /* 3+ people: grid */
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.members.map((member) => (
            <li key={member.id}>
              {linked ? (
                <Link
                  href={{ pathname: '/about', hash: member.id }}
                  className="block h-full"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface">
                    {member.photo ? (
                      <ContentImage
                        image={member.photo}
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="h-auto w-full object-cover"
                      />
                    ) : null}
                    <div className="flex flex-col gap-3 p-6">
                      <Heading as="h3" size="step-2">{member.name}</Heading>
                      <Text tone="muted">{member.role}</Text>
                      <Text>{member.bioShort}</Text>
                    </div>
                  </article>
                </Link>
              ) : (
                <article className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface">
                  {member.photo ? (
                    <ContentImage
                      image={member.photo}
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="h-auto w-full object-cover"
                    />
                  ) : null}
                  <div className="flex flex-col gap-3 p-6">
                    <Heading as="h3" size="step-2">{member.name}</Heading>
                    <Text tone="muted">{member.role}</Text>
                    <Text>{member.bioShort}</Text>
                  </div>
                </article>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}
