import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { TeamMember } from '@/lib/content'

export type AuthorCardProps = {
  heading: string
  author: TeamMember
  /** e.g. "Medically reviewed by …" (health E-E-A-T). */
  reviewNote?: string
}

export function AuthorCard({ heading, author, reviewNote }: AuthorCardProps) {
  const name = [author.honorific, author.name].filter(Boolean).join(' ')
  return (
    <aside
      aria-labelledby="author-heading"
      className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-start"
    >
      {author.photo ? (
        <ContentImage
          image={author.photo}
          sizes="96px"
          className="size-24 shrink-0 rounded-full object-cover"
        />
      ) : null}
      <div>
        <Heading as="h2" size="step-0" id="author-heading" className="text-fg-muted">
          {heading}
        </Heading>
        <p className="mt-1 font-display text-step-1 font-bold">{name}</p>
        <Text size="small" tone="muted">
          {author.role}
        </Text>
        {author.bioShort ? <Text className="mt-3 text-pretty">{author.bioShort}</Text> : null}
        {reviewNote ? (
          <Text size="small" tone="muted" className="mt-3">
            {reviewNote}
          </Text>
        ) : null}
      </div>
    </aside>
  )
}
