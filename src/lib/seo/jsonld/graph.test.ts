import { describe, expect, it } from 'vitest'

import type {
  Article,
  FaqSection,
  RichTextValue,
  Service,
  SiteSettings,
  TeamMember,
} from '@/lib/content/types'
import { inAllLocales } from '@/lib/i18n/translations'

import { blogPosting } from './blogPosting'
import { faqPage } from './faqPage'
import { pageGraph } from './graph'
import type { JsonLdContext } from './ids'
import { organization, website } from './organization'
import { person } from './person'
import { service } from './service'
import { breadcrumbList, webPage } from './webPage'

const image = (name: string) => ({
  src: `https://cdn.sanity.io/images/p/d/${name}-1600x900.jpg`,
  width: 1600,
  height: 900,
  alt: name,
})
const text = (value: string) =>
  [{ _type: 'block', children: [{ _type: 'span', text: value }] }] as unknown as RichTextValue

const settings: SiteSettings = {
  brandName: 'Demo Dental',
  tagline: 'Family dentistry in Ruse',
  logo: image('logo'),
  businessType: 'Dentist',
  areaServed: 'Ruse and the region',
  address: { street: '1 Main St', city: 'Ruse', postalCode: '7000', countryCode: 'BG' },
  geo: { lat: 43.85, lng: 25.97 },
  phones: [{ key: 'primary', e164: '+35982000000', display: '082 000 000' }],
  email: 'hello@example.com',
  googleBusinessUrl: 'https://maps.google.com/?cid=1',
  openingHours: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:00' }],
  specialHours: [
    { label: 'New Year', date: '2027-01-01', closed: true },
    { date: '2026-12-24', closed: false, opens: '09:00', closes: '13:00' },
  ],
  timeZone: 'Europe/Sofia',
  socials: [
    { platform: 'facebook', url: 'https://facebook.com/demo' },
    { platform: 'viber', url: 'viber://chat?number=%2B35982000000' },
  ],
  booking: { mode: 'phone' },
  contactForm: {},
  legal: { legalName: 'Demo Dental Ltd' },
  legalLinks: [],
  seoDefaults: { ogImage: image('default') },
}

const ctx: JsonLdContext = { siteUrl: 'https://example.com', locale: 'en', settings }

const doctor: TeamMember = {
  id: 'team-1',
  name: 'Dr. Maria Ivanova',
  honorific: 'Dr.',
  role: 'Pediatric dentist',
  specialties: ['Pediatric dentistry'],
  bioShort: 'Works with children.',
  photo: image('maria'),
  featured: true,
  credentials: [],
  sameAs: ['https://example.org/maria'],
}

const faq: FaqSection = {
  type: 'faq',
  key: 'faq',
  tone: 'base',
  spacing: 'default',
  layout: 'accordion',
  emitSchema: true,
  items: [{ id: 'q1', question: 'From what age?', answer: text('From age 1.') }],
}

const checkUp: Service = {
  id: 'service-1',
  title: "Children's check-up",
  slug: 'children-s-check-up',
  href: '/en/services/children-s-check-up',
  teaser: 'A calm first visit.',
  summary: text('Summary'),
  hasDetailPage: true,
  category: {
    id: 'cat-1',
    title: "Children's dentistry",
    audience: 'children',
    tone: 'soft',
  },
  faq: [],
  doctors: [],
  seo: { noIndex: false },
  translations: {
    en: { pathname: '/services/[slug]', params: { slug: 'children-s-check-up' } },
  },
}

const article: Article = {
  id: 'article-1',
  title: 'When to see the dentist first',
  slug: 'first-visit',
  href: '/en/blog/first-visit',
  excerpt: 'Earlier than most parents think.',
  cover: image('cover'),
  publishedAt: '2026-11-01',
  updatedAt: '2026-11-10',
  body: text('Body'),
  readingTimeMinutes: 3,
  author: doctor,
  reviewedBy: doctor,
  related: [],
  seo: { noIndex: false },
  translations: { en: { pathname: '/blog/[slug]', params: { slug: 'first-visit' } } },
}

const pageUrl = 'https://example.com/en/about'

describe('JSON-LD builders', () => {
  it('organization: business type, NAP, hours incl. special hours, sameAs (web URLs only)', () => {
    const org = organization(ctx)
    expect(org).toMatchSnapshot()
    expect(org).not.toHaveProperty('priceRange')
    expect(organization({ ...ctx, settings: { ...settings, priceRange: '€€' } })).toMatchObject({
      priceRange: '€€',
    })
  })

  it('website', () => {
    expect(website(ctx)).toMatchSnapshot()
  })

  it('webPage and breadcrumbList', () => {
    expect(
      webPage(ctx, {
        url: pageUrl,
        name: 'About us',
        type: 'AboutPage',
        hasBreadcrumb: true,
        audience: 'children',
      }),
    ).toMatchSnapshot()
    expect(
      breadcrumbList(ctx, pageUrl, [
        { name: 'Home', href: '/' },
        { name: 'About us', href: '/about' },
      ]),
    ).toMatchSnapshot()
  })

  it('faqPage: plain-text answers, nothing without emitSchema', () => {
    expect(faqPage(pageUrl, faq)).toMatchSnapshot()
    expect(faqPage(pageUrl, { ...faq, emitSchema: false })).toBeNull()
  })

  it('person, service, blogPosting', () => {
    expect(person(ctx, doctor)).toMatchSnapshot()
    expect(
      service(ctx, 'https://example.com/en/services/children-s-check-up', checkUp),
    ).toMatchSnapshot()
    expect(blogPosting(ctx, 'https://example.com/en/blog/first-visit', article)).toMatchSnapshot()
  })
})

describe('pageGraph', () => {
  const types = (graph: ReturnType<typeof pageGraph>) =>
    graph['@graph'].map((node) => (node as { '@type': string })['@type'])

  it('home: organization, website and the page, no breadcrumb', () => {
    const graph = pageGraph(ctx, { name: 'Home', translations: inAllLocales('/'), breadcrumbs: [] })
    expect(graph['@context']).toBe('https://schema.org')
    expect(types(graph)).toEqual(['Dentist', 'WebSite', 'WebPage'])
    expect(graph['@graph'][2]).toMatchObject({ '@id': 'https://example.com/en#webpage' })
  })

  it('service page: MedicalWebPage about the service, children audience, FAQ', () => {
    const graph = pageGraph(ctx, {
      name: checkUp.title,
      translations: checkUp.translations,
      breadcrumbs: [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: checkUp.title, href: checkUp.translations.en! },
      ],
      service: checkUp,
      faq,
    })
    const url = 'https://example.com/en/services/children-s-check-up'
    expect(types(graph)).toEqual([
      'Dentist',
      'WebSite',
      'MedicalWebPage',
      'BreadcrumbList',
      'Service',
      'FAQPage',
    ])
    expect(graph['@graph'][2]).toMatchObject({
      about: { '@id': `${url}#service` },
      audience: { '@type': 'PeopleAudience', audienceType: 'children' },
      breadcrumb: { '@id': `${url}#breadcrumb` },
    })
  })

  it('article page: BlogPosting with the author once as a Person, reviewedBy on the page', () => {
    const graph = pageGraph(ctx, {
      name: article.title,
      translations: article.translations,
      breadcrumbs: [],
      article,
    })
    expect(types(graph)).toEqual(['Dentist', 'WebSite', 'MedicalWebPage', 'BlogPosting', 'Person'])
    expect(graph['@graph'][2]).toMatchObject({
      reviewedBy: { '@id': 'https://example.com/#person-team-1' },
    })
  })

  it('uses WebPage instead of MedicalWebPage for non-medical businesses', () => {
    const graph = pageGraph(
      { ...ctx, settings: { ...settings, businessType: 'ProfessionalService' } },
      {
        name: checkUp.title,
        translations: checkUp.translations,
        breadcrumbs: [],
        service: checkUp,
      },
    )
    expect(types(graph)[2]).toBe('WebPage')
  })
})
