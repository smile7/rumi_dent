import { Heading, type HeadingSize } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { Wordmark } from '@/components/site/Wordmark'
import { cn } from '@/lib/utils'
import { DemoBlock } from './DemoBlock'
import { fontPairings } from './fontAlternatives'

const headingSteps: HeadingSize[] = ['step-5', 'step-4', 'step-3', 'step-2', 'step-1', 'step-0']

const sample = {
  bg: {
    heading: 'Усмивки, които растат с детето',
    body: 'Първото посещение е игра: детето сяда в стола, разглежда огледалцето и брои зъбките заедно с доктора. Родителите остават до него през цялото време.',
  },
  en: {
    heading: 'Smiles that grow with your child',
    body: 'The first visit is a game: your child sits in the chair, explores the little mirror and counts teeth with the dentist. Parents stay close the whole time.',
  },
}

/** Bulgarian localized forms (`locl`) differ from Russian in д, л, ж, ю; check them here. */
const cyrillicSpecimen = 'Щъркел, юначе, ѝ · д л ж ю ц щ'

export function TypeDemo() {
  return (
    <DemoBlock id="type" title="Typography">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          {headingSteps.map((step) => (
            <div key={step} className="flex flex-col gap-1 border-b border-border pb-4">
              <code className="text-step--1 text-fg-muted">{`text-${step} · font-display`}</code>
              <Heading as="h3" size={step}>
                {sample.bg.heading}
              </Heading>
              <Heading as="h3" size={step} className="text-fg-muted">
                {sample.en.heading}
              </Heading>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {(['bg', 'en'] as const).map((lang) => (
            <div key={lang} lang={lang} className="flex flex-col gap-3">
              <code className="text-step--1 text-fg-muted">{`${lang} · lead / body / small`}</code>
              <Text size="lead">{sample[lang].heading}</Text>
              <Text className="max-w-(--container-prose)">{sample[lang].body}</Text>
              <Text size="small" tone="muted">
                {sample[lang].body}
              </Text>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <code className="text-step--1 text-fg-muted">Cyrillic specimen (lang=bg)</code>
          <p className="font-display text-step-4 leading-heading font-extrabold">
            {cyrillicSpecimen}
          </p>
          <p className="text-step-2">{cyrillicSpecimen}</p>
        </div>

        <div className="flex flex-col gap-4">
          <Heading as="h3" size="step-1">
            Font pairings for sign-off
          </Heading>
          <ul className="grid gap-4 lg:grid-cols-3">
            {fontPairings.map((pairing) => (
              <li
                key={pairing.name}
                className="flex flex-col gap-3 rounded-card bg-surface p-6 shadow-sm"
              >
                <code className="text-step--1 text-fg-muted">{pairing.name}</code>
                <p
                  className={cn(
                    'text-step-3 leading-heading font-extrabold',
                    pairing.displayClass ?? 'font-display',
                  )}
                >
                  {sample.bg.heading}
                </p>
                <p className={cn('text-step-0', pairing.bodyClass)}>{sample.bg.body}</p>
                <p className={cn('text-step--1 text-fg-muted', pairing.bodyClass)} lang="en">
                  {sample.en.body}
                </p>
                <p className={cn('text-step-2 font-bold', pairing.displayClass ?? 'font-display')}>
                  {cyrillicSpecimen}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Heading as="h3" size="step-1">
            Wordmark
          </Heading>
          <div className="flex flex-wrap items-center gap-8">
            <Wordmark name="Rumi Dent" />
            <Wordmark name="Rumi Dent" variant="compact" />
            <Wordmark name="Rumi Dent" accent={false} />
            <span className="rounded-md bg-tone-brand-bg px-4 py-3">
              <Wordmark name="Rumi Dent" className="text-tone-brand-fg" />
            </span>
          </div>
        </div>
      </div>
    </DemoBlock>
  )
}
