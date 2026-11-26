import { PhoneIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Mascot } from '@/components/brand/Mascot'
import { emphasize } from '@/components/primitives/Emphasis'
import { Heading } from '@/components/primitives/Heading'
import { RichText } from '@/lib/content'
import type { FaqSection as FaqModel } from '@/lib/content'
import { primaryPhone } from '@/lib/site/actions'

import { FaqAccordion } from './FaqAccordion'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function FaqSection({ section: raw, index, sections, site }: SectionComponentProps) {
  const section = raw as FaqModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const phone = primaryPhone(site)
  const t = await getTranslations('Sections')

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          {section.heading ? (
            <Heading as={level} size="step-4" id={titleId} className="text-balance">
              {emphasize(section.heading)}
            </Heading>
          ) : null}
          {section.intro ? (
            <p className="max-w-[30rem] text-step-1 leading-relaxed text-fg-muted">
              {section.intro}
            </p>
          ) : null}
          {phone ? (
            <div className="relative mt-4 hidden max-w-[24rem] rounded-xl bg-tone-soft-bg p-7 pe-28 lg:block">
              <Mascot
                name="thumbs"
                sizes="7rem"
                className="animate-float-slow absolute -top-8 right-2 w-24 rotate-6 drop-shadow-lg"
              />
              <p className="font-display text-step-2">{t('faqHelpTitle')}</p>
              <p className="mt-2 text-step--1 text-fg-muted">{t('faqHelpText')}</p>
              <a
                href={phone.href}
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary tabular-nums underline decoration-primary/30 underline-offset-[6px] hover:decoration-primary"
              >
                <PhoneIcon aria-hidden="true" className="size-4" />
                {phone.display}
              </a>
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-7">
          <FaqAccordion
            idPrefix={section.key}
            items={section.items.map((item) => ({
              id: item.id,
              question: item.question,
              answer: (
                <div className="prose-theme">
                  <RichText value={item.answer} />
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </SectionShell>
  )
}
