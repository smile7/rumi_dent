import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { submitContact } from '@/actions/contact'
import { LazyContactForm } from '@/components/forms/LazyContactForm'
import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { SectionCtas } from '@/components/sections/SectionCtas'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { PageJsonLd } from '@/components/seo/JsonLd'
import type {
  BlogTeaserSection,
  FaqSection,
  HeroSection,
  Page,
  ProcessStepsSection,
  Section,
  SiteSettings,
  TeamSection,
  TilesSection,
} from '@/lib/content'
import { primaryPhone } from '@/lib/site/actions'
import type { Locale } from '@/config/i18n'

import { SetPageTranslations } from './PageTranslations'

type DentokidoHomeProps = { page: Page; locale: Locale; site: SiteSettings }

const sectionOf = <T extends Section,>(sections: Page['sections'], type: T['type']) =>
  sections.find((section): section is T => section.type === type)

const kidImages = Array.from({ length: 6 }, (_, index) => index)

export async function DentokidoHome({ page, locale, site }: DentokidoHomeProps) {
  const t = await getTranslations('DentokidoHome')
  const hero = sectionOf<HeroSection>(page.sections, 'hero')
  const services = sectionOf<TilesSection>(page.sections, 'tiles')
  const process = sectionOf<ProcessStepsSection>(page.sections, 'processSteps')
  const team = sectionOf<TeamSection>(page.sections, 'team')
  const blog = sectionOf<BlogTeaserSection>(page.sections, 'blogTeaser')
  const faq = sectionOf<FaqSection>(page.sections, 'faq')
  const remaining = page.sections.filter((section) => !['hero', 'tiles', 'processSteps', 'team', 'blogTeaser', 'faq'].includes(section.type))

  return (
    <>
      <SetPageTranslations translations={page.translations} fallback="/" />

      {hero ? (
        <section className="overflow-hidden bg-hero-bg py-12 sm:py-16 lg:py-20" aria-labelledby="home-hero">
          <Container width="wide" className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Heading as="h1" id="home-hero" size="step-5" className="max-w-[11ch] text-fg">
                {hero.heading}
              </Heading>
              {hero.subheading ? <Text size="lead" className="mt-6 max-w-xl text-fg-muted">{hero.subheading}</Text> : null}
              {await SectionCtas({ ctas: hero.ctas, site, className: 'mt-8' })}
              <ul className="mt-9 flex flex-wrap gap-3">
                {hero.trustItems.map((item) => (
                  <li key={item.key} className="rounded-pill bg-surface px-4 py-2 text-step--1 font-bold text-primary shadow-sm">{item.text}</li>
                ))}
              </ul>
            </div>
            <div className="relative grid grid-cols-3 gap-3 sm:gap-5">
              <div aria-hidden="true" className="absolute inset-[11%] rounded-full bg-brand-100" />
              {kidImages.map((item) => (
                <div key={item} className="relative aspect-square overflow-hidden rounded-media bg-surface">
                  <Image
                    src="/images/hero-kid.png"
                    alt=""
                    fill
                    priority={item < 2}
                    sizes="(min-width: 1024px) 17vw, 31vw"
                    className="object-contain object-bottom p-1"
                  />
                </div>
              ))}
              <Image
                src="/images/tooth-wave.png"
                alt=""
                width={1197}
                height={1315}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-14 -right-8 z-10 w-40 rotate-[-9deg] sm:w-52"
              />
            </div>
          </Container>
        </section>
      ) : null}

      {services ? (
        <section className="py-(--space-section)" aria-labelledby="services-title">
          <Container width="wide">
            <div className="max-w-2xl">
              <Heading as="h2" id="services-title" size="step-4">{services.heading}</Heading>
              {services.intro ? <Text size="lead" tone="muted" className="mt-4">{services.intro}</Text> : null}
            </div>
            <ul className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.items.slice(0, 6).map((service, index) => (
                <li key={service.key} className="group overflow-hidden rounded-media bg-brand-50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src="/images/clinic-chair.jpg" alt="" fill sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 94vw" className="object-cover transition-transform duration-(--duration-slow) group-hover:scale-105" />
                    <span className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-accent font-display text-step-1 font-extrabold text-accent-fg">{index + 1}</span>
                  </div>
                  <article className="p-6">
                    <Heading as="h3" size="step-1">{service.title}</Heading>
                    {service.teaser ? <Text className="mt-3 text-fg-muted">{service.teaser}</Text> : null}
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {process ? (
        <section className="overflow-hidden bg-primary py-(--space-section)" aria-labelledby="visit-title">
          <Container width="wide" className="relative">
            <Image src="/images/tooth-celebrate.png" alt="" width={1197} height={1314} aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 hidden w-72 opacity-25 lg:block" />
            <Heading as="h2" id="visit-title" size="step-4" className="max-w-xl text-primary-fg">{process.heading}</Heading>
            {process.intro ? <Text size="lead" className="mt-4 max-w-xl text-primary-fg/75">{process.intro}</Text> : null}
            <ol className="relative mt-10 grid gap-6 md:grid-cols-3">
              {process.steps.map((step, index) => (
                <li key={step.key} className="relative border-t-2 border-primary-fg/35 pt-5">
                  <span className="font-display text-step-4 font-extrabold text-accent">{index + 1}</span>
                  <Heading as="h3" size="step-1" className="mt-3 text-primary-fg">{step.title}</Heading>
                  {step.text ? <Text className="mt-2 max-w-sm text-primary-fg/75">{step.text}</Text> : null}
                </li>
              ))}
            </ol>
            {process.cta ? await SectionCtas({ ctas: [process.cta], site, className: 'mt-10 [&>a]:bg-primary-fg [&>a]:text-primary' }) : null}
          </Container>
        </section>
      ) : null}

      <section className="bg-hero-bg py-(--space-section)" aria-labelledby="why-title">
        <Container width="wide" className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <Heading as="h2" id="why-title" size="step-4">{t('whyTitle')}</Heading>
            <Text size="lead" tone="muted" className="mt-5">{t('whyText')}</Text>
            <Image src="/images/tooth-shield.png" alt="" width={1188} height={1324} aria-hidden="true" className="mt-8 w-44 -rotate-6" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(hero?.trustItems ?? []).map((item, index) => (
              <article key={item.key} className="min-h-44 rounded-media bg-surface p-6 shadow-sm">
                <span className="font-display text-step-3 font-extrabold text-accent">{index + 1}</span>
                <Heading as="h3" size="step-1" className="mt-5">{item.text}</Heading>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {team ? (
        <section className="py-(--space-section)" aria-labelledby="team-title">
          <Container width="wide">
            <Heading as="h2" id="team-title" size="step-4">{team.heading}</Heading>
            {team.intro ? <Text size="lead" tone="muted" className="mt-4 max-w-2xl">{team.intro}</Text> : null}
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {team.members.slice(0, 2).map((member) => (
                <li key={member.id} className="overflow-hidden rounded-media bg-brand-50">
                  <div className="aspect-[16/9] bg-brand-100" />
                  <article className="p-7">
                    <Text size="small" className="font-bold text-primary">{member.role}</Text>
                    <Heading as="h3" size="step-2" className="mt-2">{member.name}</Heading>
                    <Text className="mt-4 text-fg-muted">{member.bioShort}</Text>
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {blog ? (
        <section className="bg-hero-bg py-(--space-section)" aria-labelledby="blog-title">
          <Container width="wide">
            <Heading as="h2" id="blog-title" size="step-4">{blog.heading}</Heading>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {blog.articles.map((article) => (
                <li key={article.id} className="overflow-hidden rounded-media bg-surface shadow-sm">
                  <div className="relative aspect-[16/10] bg-brand-100">
                    <Image src="/images/clinic-chair.jpg" alt="" fill sizes="(min-width: 768px) 30vw, 94vw" className="object-cover" />
                  </div>
                  <article className="p-6">
                    <Text size="small" className="font-bold text-primary">{article.publishedAt}</Text>
                    <Heading as="h3" size="step-1" className="mt-3">{article.title}</Heading>
                    <Text className="mt-3 text-fg-muted">{article.excerpt}</Text>
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {faq ? <SectionRenderer sections={[faq, ...remaining]} locale={locale} site={site} /> : null}

      <section className="bg-primary py-(--space-section)" aria-labelledby="contact-title">
        <Container width="wide" className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <Heading as="h2" id="contact-title" size="step-4" className="text-primary-fg">{t('contactTitle')}</Heading>
            <Text size="lead" className="mt-5 text-primary-fg/75">{t('contactText')}</Text>
            <Image src="/images/tooth-wave.png" alt="" width={1197} height={1315} aria-hidden="true" className="mt-8 w-44" />
          </div>
          <div className="rounded-media bg-surface p-6 sm:p-8">
            <LazyContactForm action={submitContact.bind(null, locale)} phone={primaryPhone(site)} privacyHref={site.privacyHref} successMessage={site.contactForm.successMessage} />
          </div>
        </Container>
      </section>

      <PageJsonLd locale={locale} settings={site} home name={page.title} description={page.seo.description || page.intro} translations={page.translations} faq={faq} people={team?.members ?? []} />
    </>
  )
}
