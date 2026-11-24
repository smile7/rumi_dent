import { Heading } from '@/components/primitives/Heading'
import type { GalleryAlbum, GallerySection as GalleryModel } from '@/lib/content'

import { GalleryLightbox } from './GalleryLightbox'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export function GallerySection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as GalleryModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const albums = [...new Set(section.items.map((item) => item.album))] as GalleryAlbum[]

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined} width="wide">
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      <GalleryLightbox items={section.items} albums={albums} />
    </SectionShell>
  )
}