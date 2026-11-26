import { ContentImage } from '@/components/primitives/ContentImage'
import { emphasize } from '@/components/primitives/Emphasis'
import { Heading } from '@/components/primitives/Heading'
import { RichText, type TextImageSection } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

/** Decorative typographic quote mark (not content). */
const OPEN_QUOTE = '\u201C'

/** Editorial band: a large serif statement beside a photo framed in the logo's arch. */
export async function TextImageSection({
  section: raw,
  index,
  sections,
  site,
  imagePriority,
}: SectionComponentProps) {
  const section = raw as TextImageSection
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const imageFirst = section.imagePosition === 'left'
  const dark = section.tone === 'brand' || section.tone === 'inverse'

  return (
    <SectionShell
      section={section}
      labelledBy={section.heading ? titleId : undefined}
      className="relative overflow-hidden"
    >
      <div
        className={cn(
          'grid items-center gap-x-16 gap-y-12',
          section.image ? 'lg:grid-cols-12' : 'max-w-(--container-prose)',
        )}
      >
        <div className={cn('relative flex flex-col gap-8', section.image && 'lg:col-span-7')}>
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none -mb-6 block h-[0.42em] font-display text-[clamp(7rem,5rem+6vw,11rem)] leading-[0.8] select-none',
              dark ? 'text-accent-300/60' : 'text-accent-300',
            )}
          >
            {OPEN_QUOTE}
          </span>
          {section.heading ? (
            <Heading as={level} size="step-4" id={titleId} className="text-balance">
              {emphasize(section.heading)}
            </Heading>
          ) : null}
          <div className="max-w-[38rem] prose-theme text-step-1 leading-relaxed text-fg-muted [&_p]:text-pretty [&_p+p]:mt-4">
            <RichText value={section.body} />
          </div>
          {section.cta ? <SectionCtas ctas={[section.cta]} site={site} onDark={dark} /> : null}
        </div>

        {section.image ? (
          <figure
            className={cn(
              'relative mx-auto w-full max-w-[30rem] lg:col-span-5',
              imageFirst && 'lg:order-first',
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                'absolute -top-8 size-32 rounded-pill bg-accent-300',
                imageFirst ? '-right-6' : '-left-8',
              )}
            />
            <div
              aria-hidden="true"
              className="shape-arch absolute inset-0 translate-x-4 translate-y-4 border border-current opacity-20"
            />
            <div className="shape-arch relative aspect-[4/5] overflow-hidden bg-brand-100 shadow-xl">
              <ContentImage
                image={section.image}
                sizes="(min-width: 1024px) 30rem, 92vw"
                fill
                preload={imagePriority}
                className="object-cover"
              />
            </div>
          </figure>
        ) : null}
      </div>
    </SectionShell>
  )
}
