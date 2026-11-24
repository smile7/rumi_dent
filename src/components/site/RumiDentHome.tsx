import Image from 'next/image'

import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { SectionCtas } from '@/components/sections/SectionCtas'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { PageJsonLd } from '@/components/seo/JsonLd'
import { ContentImage } from '@/components/primitives/ContentImage'
import { RichText } from '@/lib/content'
import type {
  FaqSection,
  HeroSection,
  Page,
  ProcessStepsSection,
  Section,
  SiteSettings,
  TeamSection,
  TestimonialsSection,
  TilesSection,
} from '@/lib/content'
import type { Locale } from '@/config/i18n'
import { cn } from '@/lib/utils'

import { SetPageTranslations } from './PageTranslations'

type RumiDentHomeProps = {
  page: Page
  locale: Locale
  site: SiteSettings
}

const getSection = <T extends Section,>(sections: Page['sections'], type: T['type']) =>
  sections.find((section): section is T => section.type === type)

function WaveBackdrop() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1000 640"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-[84%] w-full overflow-visible"
    >
      <path
        d="M0 250C138 184 250 195 366 250s224 65 354 14c107-42 194-47 280-12v388H0Z"
        className="fill-hero-wave-soft"
      />
      <path
        d="M0 340c120-50 230-38 343 2 129 46 254 47 387-6 91-36 181-49 270-22v326H0Z"
        className="fill-hero-wave"
      />
      <path
        d="M0 448c138-42 263-38 385 16 99 44 211 38 326-13 109-48 204-61 289-35v224H0Z"
        className="fill-hero-wave-apricot"
      />
      <path
        d="M0 504c134-34 256-27 366 19 124 52 245 48 365-2 103-43 193-54 269-32v151H0Z"
        className="fill-hero-wave-light"
      />
    </svg>
  )
}

export async function RumiDentHome({ page, locale, site }: RumiDentHomeProps) {
  const hero = getSection<HeroSection>(page.sections, 'hero')
  const services = getSection<TilesSection>(page.sections, 'tiles')
  const firstVisit = getSection<ProcessStepsSection>(page.sections, 'processSteps')
  const team = getSection<TeamSection>(page.sections, 'team')
  const testimonials = getSection<TestimonialsSection>(page.sections, 'testimonials')
  const faq = getSection<FaqSection>(page.sections, 'faq')
  const remaining = page.sections.filter(
    (section) => !['hero', 'tiles', 'processSteps', 'team', 'testimonials', 'faq'].includes(section.type),
  )

  return (
    <>
      <SetPageTranslations translations={page.translations} fallback="/" />

      {hero ? (
        <section
          aria-labelledby="rumi-hero-heading"
          className="relative isolate overflow-hidden bg-hero-bg pb-12 pt-10 sm:pb-16 lg:pb-0 lg:pt-16"
        >
          <div aria-hidden="true" className="pointer-events-none absolute left-[34%] top-[17%] h-[83%] w-[92%] opacity-65">
            <WaveBackdrop />
          </div>
          <Container width="wide" className="relative z-10 grid items-center gap-8 lg:min-h-[38rem] lg:grid-cols-[minmax(0,0.93fr)_minmax(28rem,1.07fr)] lg:gap-0">
            <div className="max-w-2xl py-4 lg:py-12">
              <p className="mb-5 font-display text-step-0 font-bold tracking-[0.08em] text-primary uppercase">
                {site.tagline}
              </p>
              <Heading
                as="h1"
                id="rumi-hero-heading"
                size="step-5"
                className="max-w-[12ch] text-balance font-extrabold tracking-[-0.045em] text-fg"
              >
                {hero.heading}
              </Heading>
              {hero.subheading ? (
                <Text size="lead" className="mt-6 max-w-xl text-pretty text-fg-muted">
                  {hero.subheading}
                </Text>
              ) : null}
              {await SectionCtas({ ctas: hero.ctas, site, className: 'mt-8' })}
              {hero.trustItems.length ? (
                <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                  {hero.trustItems.map((item) => (
                    <li key={item.key} className="inline-flex items-center gap-2 text-step--1 font-bold text-fg">
                      {item.icon ? <ContentIcon name={item.icon} className="size-5 text-primary" /> : null}
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="relative isolate min-h-[19rem] sm:min-h-[27rem] lg:min-h-[38rem]">
              <div
                aria-hidden="true"
                className="absolute inset-x-[12%] bottom-[8%] top-[18%] rounded-full bg-hero-wave-soft/60 blur-3xl"
              />
              <div className="absolute inset-x-[5%] bottom-0 top-0 z-10">
                <Image
                  src="/images/hero-kid.png"
                  alt={hero.image?.alt ?? ''}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 96vw"
                  className="rumi-hero-kid object-contain object-bottom"
                />
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {services ? (
        <section className="bg-surface py-(--space-section)" aria-labelledby="rumi-services-heading">
          <Container width="wide">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
              <Heading as="h2" id="rumi-services-heading" size="step-4" className="max-w-[11ch] text-balance">
                {services.heading}
              </Heading>
              {services.intro ? <Text size="lead" tone="muted" className="max-w-2xl">{services.intro}</Text> : null}
            </div>
            <ul className="mt-12 border-t border-border">
              {services.items.map((service, index) => (
                <li key={service.key} className="border-b border-border">
                  <details className="group py-1" open={index === 0}>
                    <summary className="grid cursor-pointer list-none grid-cols-[auto_1fr_auto] items-center gap-4 py-5 marker:content-none sm:gap-8 sm:py-6">
                      <span aria-hidden="true" className="font-display text-step-2 font-extrabold leading-none text-hero-wave">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Heading as="h3" size="step-1" className="text-fg">{service.title}</Heading>
                      <span
                        aria-hidden="true"
                        className="grid size-9 place-items-center rounded-full border border-border text-step-2 leading-none text-primary transition-transform duration-(--duration-base) group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 pb-6 pl-[calc(var(--spacing)*14)] sm:pl-[calc(var(--spacing)*20)]">
                      <span aria-hidden="true" className="w-px bg-hero-wave" />
                      <div className="max-w-2xl">
                        {service.teaser ? <Text size="lead" className="text-fg-muted">{service.teaser}</Text> : null}
                        {service.body ? <div className="prose-theme mt-4 text-fg-muted"><RichText value={service.body} /></div> : null}
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {firstVisit ? (
        <section className="relative overflow-hidden bg-primary py-(--space-section)" aria-labelledby="rumi-first-visit-heading">
          <Container width="wide" className="relative">
            <div className="max-w-xl">
              <Heading as="h2" id="rumi-first-visit-heading" size="step-4" className="text-primary-fg">
                {firstVisit.heading}
              </Heading>
              {firstVisit.intro ? <Text size="lead" className="mt-4 text-primary-fg/75">{firstVisit.intro}</Text> : null}
            </div>
            <ol className="relative mt-10 flex flex-col gap-0 md:flex-row md:items-start">
              {firstVisit.steps.map((step, index) => (
                <li key={step.key} className="relative grid grid-cols-[3rem_1fr] gap-x-4 py-5 md:flex-1 md:grid-cols-none md:py-0 md:pr-8">
                  <span className="relative z-10 grid size-12 place-items-center rounded-full bg-accent font-display text-step-1 font-extrabold text-accent-fg">
                    {index + 1}
                  </span>
                  <div className="md:mt-5">
                    <Heading as="h3" size="step-1" className="text-primary-fg">{step.title}</Heading>
                    {step.text ? <Text size="small" className="mt-1 max-w-xs text-primary-fg/75">{step.text}</Text> : null}
                  </div>
                  {index < firstVisit.steps.length - 1 ? (
                    <span aria-hidden="true" className="absolute left-6 top-14 h-[calc(100%-1.5rem)] w-px bg-primary-fg/30 md:left-12 md:top-6 md:h-px md:w-[calc(100%-3rem)]" />
                  ) : null}
                </li>
              ))}
            </ol>
            <Image
              src="/images/tooth-mascot.png"
              alt=""
              width={682}
              height={1024}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 right-0 hidden w-44 rotate-[-8deg] opacity-20 xl:block"
            />
            {firstVisit.cta ? await SectionCtas({ ctas: [firstVisit.cta], site, className: 'mt-10' }) : null}
          </Container>
        </section>
      ) : null}

      {team ? (
        <section className="bg-hero-bg py-(--space-section)" aria-labelledby="rumi-team-heading">
          <Container width="wide">
            <div className="max-w-2xl">
              <Heading as="h2" id="rumi-team-heading" size="step-4">{team.heading}</Heading>
              {team.intro ? <Text size="lead" tone="muted" className="mt-4">{team.intro}</Text> : null}
            </div>
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {team.members.slice(0, 2).map((member, index) => (
                <li key={member.id}>
                  <article className={cn('grid overflow-hidden rounded-media', member.photo ? 'sm:grid-cols-2' : 'min-h-72', index % 2 === 0 ? 'bg-hero-wave-soft' : 'bg-accent-100')}>
                    {member.photo ? (
                      <ContentImage
                        image={member.photo}
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="h-full min-h-64 w-full object-cover"
                      />
                    ) : null}
                    <div className="flex min-h-72 flex-col justify-end p-8">
                      <p className="text-step--1 font-bold tracking-[0.08em] text-primary uppercase">{member.role}</p>
                      <Heading as="h3" size="step-3" className="mt-2">{member.name}</Heading>
                      <Text className="mt-4 max-w-md text-fg-muted">{member.bioShort}</Text>
                      {member.specialties.length ? <Text size="small" className="mt-5 font-bold text-fg">{member.specialties.join(' · ')}</Text> : null}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <SectionRenderer
        sections={[...(testimonials ? [testimonials] : []), ...remaining]}
        locale={locale}
        site={site}
      />

      {faq ? (
        <section className="relative overflow-hidden bg-hero-bg py-(--space-section)" aria-labelledby="rumi-faq-heading">
          <Container width="wide" className="grid gap-10 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
            <div className="relative">
              <Heading as="h2" id="rumi-faq-heading" size="step-4" className="max-w-[9ch]">{faq.heading}</Heading>
              {faq.intro ? <Text size="lead" tone="muted" className="mt-5 max-w-sm">{faq.intro}</Text> : null}
              <Image
                src="/images/tooth-mascot.png"
                alt=""
                width={682}
                height={1024}
                aria-hidden="true"
                className="pointer-events-none mt-8 w-24 rotate-[-7deg] opacity-85 lg:mt-12 lg:w-32"
              />
            </div>
            <ul className="border-t border-border">
              {faq.items.map((item, index) => (
                <li key={item.id} className="border-b border-border">
                  <details className="group" open={index === 0}>
                    <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-5 py-6 marker:content-none">
                      <Heading as="h3" size="step-1" className="text-left">{item.question}</Heading>
                      <span aria-hidden="true" className="text-step-2 leading-none text-primary transition-transform duration-(--duration-base) group-open:rotate-45">+</span>
                    </summary>
                    <div className="prose-theme max-w-2xl pb-7 text-fg-muted">
                      <RichText value={item.answer} />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <PageJsonLd
        locale={locale}
        settings={site}
        home
        name={page.title}
        description={page.seo.description || page.intro}
        translations={page.translations}
        faq={faq}
        people={team?.members ?? []}
      />
    </>
  )
}
