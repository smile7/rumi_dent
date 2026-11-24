import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { Link } from '@/i18n/navigation'
import type { TeamMember, TeamSection as TeamModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

function TeamCard({ member, featured }: { member: TeamMember; featured?: boolean }) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-card border border-border bg-surface',
        featured && 'md:grid md:grid-cols-2',
      )}
    >
      {member.photo ? (
        <ContentImage
          image={member.photo}
          sizes={featured ? '(min-width: 768px) 40vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
          className="h-auto w-full object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-3 p-6">
        <Heading as="h3" size="step-2">
          {member.name}
        </Heading>
        <Text tone="muted">{member.role}</Text>
        <Text>{member.bioShort}</Text>
        {member.specialties.length > 0 ? (
          <Text size="small" tone="muted">
            {member.specialties.join(' · ')}
          </Text>
        ) : null}
      </div>
    </article>
  )
}

export function TeamSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as TeamModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const featured = section.members.find((m) => m.featured) ?? section.members[0]
  const rest = section.members.filter((m) => m.id !== featured?.id)

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
      {section.layout === 'featuredFirst' && featured ? (
        <div className="mt-10 space-y-8">
          <TeamCard member={featured} featured />
          {rest.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((member) => (
                <li key={member.id}>
                  <TeamCard member={member} />
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
                <TeamCard member={member} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}