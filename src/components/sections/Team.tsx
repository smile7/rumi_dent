import { getTranslations } from 'next-intl/server'

import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { Link } from '@/i18n/navigation'
import type { TeamMember, TeamSection as TeamModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

function displayName(member: TeamMember) {
  return member.honorific ? `${member.honorific} ${member.name}` : member.name
}

type TeamCardProps = {
  member: TeamMember
  featured?: boolean
  yearsLabel?: string
  duo?: boolean
}

function TeamCard({ member, featured, yearsLabel, duo }: TeamCardProps) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-surface/95 shadow-sm backdrop-blur-sm transition-[box-shadow,transform] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:shadow-md',
        featured && !duo && 'md:grid md:grid-cols-2',
        duo && 'text-center',
      )}
    >
      {member.photo ? (
        <ContentImage
          image={member.photo}
          sizes={
            duo
              ? '(min-width: 768px) 22vw, 100vw'
              : featured
                ? '(min-width: 768px) 40vw, 100vw'
                : '(min-width: 768px) 25vw, 50vw'
          }
          className={cn(
            'h-auto w-full object-cover',
            duo && 'aspect-4/5 max-h-80',
          )}
        />
      ) : null}
      <div className={cn('flex flex-col gap-2 p-6', duo && 'items-center')}>
        <Heading as="h3" size={duo ? 'step-2' : 'step-2'}>
          {displayName(member)}
        </Heading>
        <Text tone="muted" className={cn(duo && 'font-semibold text-primary')}>
          {member.role}
        </Text>
        {yearsLabel ? (
          <span className="inline-flex min-h-6 items-center rounded-pill bg-tone-soft-bg px-3 py-0.5 text-step--1 font-semibold text-fg">
            {yearsLabel}
          </span>
        ) : null}
        {!duo ? (
          <>
            <Text className="text-pretty">{member.bioShort}</Text>
            {member.specialties.length > 0 ? (
              <Text size="small" tone="muted">
                {member.specialties.join(' · ')}
              </Text>
            ) : null}
          </>
        ) : (
          <Text size="small" className="max-w-sm text-fg-muted text-pretty">
            {member.bioShort}
          </Text>
        )}
      </div>
    </article>
  )
}

export async function TeamSection({
  section: raw,
  index,
  sections,
  locale,
}: SectionComponentProps) {
  const section = raw as TeamModel
  const t = await getTranslations({ locale, namespace: 'Sections' })
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const duo = section.layout === 'duo'
  const featured = section.members.find((m) => m.featured) ?? section.members[0]
  const rest = section.members.filter((m) => m.id !== featured?.id)

  const yearsFor = (member: TeamMember) =>
    member.yearsExperience != null
      ? t('teamYears', { years: member.yearsExperience })
      : undefined

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

      {duo ? (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          {section.members.slice(0, 2).map((member) => (
            <li key={member.id}>
              <Link href={{ pathname: '/about', hash: member.id }} className="block h-full">
                <TeamCard member={member} duo yearsLabel={yearsFor(member)} />
              </Link>
            </li>
          ))}
        </ul>
      ) : section.layout === 'featuredFirst' && featured ? (
        <div className="mt-10 space-y-8">
          <TeamCard member={featured} featured yearsLabel={yearsFor(featured)} />
          {rest.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((member) => (
                <li key={member.id}>
                  <TeamCard member={member} yearsLabel={yearsFor(member)} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.members.map((member) => (
            <li key={member.id}>
              <Link href={{ pathname: '/about', hash: member.id }} className="block h-full">
                <TeamCard member={member} yearsLabel={yearsFor(member)} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}