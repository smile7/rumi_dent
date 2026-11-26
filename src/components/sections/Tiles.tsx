import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { RichText } from '@/lib/content'
import type { TilesSection as TilesModel } from '@/lib/content'

import { SectionShell, sectionTitleId } from './SectionShell'
import { TilesGrid } from './TilesGrid'
import { TilesOrbitGrid } from './TilesOrbitGrid'
import { sectionHeadingLevel, subsectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export function TilesSection({
  section: raw,
  index,
  sections,
  locale,
}: SectionComponentProps) {
  const section = raw as TilesModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const tileLevel = subsectionHeadingLevel(level)

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
      <div className="mt-10">
        {section.layout === 'orbit' ? (
          <TilesOrbitGrid
            items={section.items.map((item) => {
              const { body, ...row } = item
              void body
              return row
            })}
            bodies={Object.fromEntries(
              section.items.flatMap((item) =>
                item.body
                  ? [
                      [
                        item.key,
                        <div key={item.key} className="prose-theme max-w-(--container-prose)">
                          <RichText value={item.body} />
                        </div>,
                      ],
                    ]
                  : [],
              ),
            )}
            allowMultiple={section.allowMultiple}
            source={section.source}
            locale={locale}
            tileHeadingLevel={tileLevel}
          />
        ) : (
        <TilesGrid
          items={section.items.map((item) => {
            const { body, ...row } = item
            void body
            return row
          })}
          bodies={Object.fromEntries(
            section.items.flatMap((item) =>
              item.body
                ? [
                    [
                      item.key,
                      <div
                        key={item.key}
                        className="prose-theme max-w-(--container-prose)"
                      >
                        <RichText value={item.body} />
                      </div>,
                    ],
                  ]
                : [],
            ),
          )}
          allowMultiple={section.allowMultiple}
          source={section.source}
          density={section.density}
          locale={locale}
          tileHeadingLevel={tileLevel}
        />
        )}
      </div>
    </SectionShell>
  )
}