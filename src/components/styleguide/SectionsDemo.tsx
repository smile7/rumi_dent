import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { heroCutoutEn, heroFullBleedBg, heroSplitBg } from '@/components/sections/__fixtures__/hero'
import { fixtureSite } from '@/components/sections/__fixtures__/site'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import type { Section } from '@/lib/content'
import type { Locale } from '@/config/i18n'
import type { RichTextValue } from '@/lib/content'

const rich = (text: string) =>
  [
    {
      _type: 'block',
      children: [{ _type: 'span', text }],
    },
  ] as unknown as RichTextValue

const demoSections = (locale: Locale): Section[] => {
  const book =
    locale === 'bg'
      ? { label: 'Запишете час', action: 'booking' as const, style: 'primary' as const, link: null }
      : { label: 'Book', action: 'booking' as const, style: 'primary' as const, link: null }

  return [
    heroSplitBg,
    heroCutoutEn,
    heroFullBleedBg,
    {
      key: 'text',
      type: 'textImage',
      tone: 'base',
      spacing: 'default',
      heading: locale === 'bg' ? 'Текст и снимка' : 'Text and image',
      body: rich(locale === 'bg' ? 'Кратък текст до изображение.' : 'Short copy beside an image.'),
      image: heroSplitBg.image,
      imagePosition: 'right',
      cta: book,
    },
    {
      key: 'steps',
      type: 'processSteps',
      tone: 'soft',
      spacing: 'default',
      heading: locale === 'bg' ? 'Стъпки' : 'Steps',
      steps: [
        { key: '1', title: locale === 'bg' ? 'Обаждате се' : 'Call', icon: 'phone' },
        { key: '2', title: locale === 'bg' ? 'Посещение' : 'Visit', icon: 'smile' },
        { key: '3', title: locale === 'bg' ? 'План' : 'Plan', icon: 'clipboard-list' },
      ],
      cta: book,
    },
    {
      key: 'rich',
      type: 'richText',
      tone: 'base',
      spacing: 'compact',
      heading: locale === 'bg' ? 'Произволен текст' : 'Rich text',
      body: rich(locale === 'bg' ? 'Параграф в ограничена ширина.' : 'A paragraph within prose width.'),
      width: 'prose',
    },
    {
      key: 'tiles',
      type: 'tiles',
      tone: 'base',
      spacing: 'default',
      heading: locale === 'bg' ? 'Плочки' : 'Tiles',
      source: 'manual',
      allowMultiple: false,
      density: 'comfortable',
      items: [
        {
          key: 't1',
          title: locale === 'bg' ? 'Преглед' : 'Check-up',
          teaser: locale === 'bg' ? 'Веднъж годишно' : 'Once a year',
          slug: 'check-up',
          body: rich(locale === 'bg' ? 'Подробности за прегледа.' : 'Check-up details.'),
          cta: null,
        },
        {
          key: 't2',
          title: locale === 'bg' ? 'Лечение' : 'Treatment',
          teaser: locale === 'bg' ? 'Нежно за деца' : 'Gentle for children',
          slug: 'care',
          body: rich(locale === 'bg' ? 'Какво включва лечението.' : 'What treatment involves.'),
          cta: null,
        },
      ],
    },
    {
      key: 'faq',
      type: 'faq',
      tone: 'soft',
      spacing: 'default',
      heading: 'FAQ',
      items: [
        {
          id: 'f1',
          question: locale === 'bg' ? 'Боли ли?' : 'Does it hurt?',
          answer: rich(locale === 'bg' ? 'Не, работим нежно.' : 'No, we work gently.'),
        },
      ],
      emitSchema: false,
    },
    {
      key: 'team',
      type: 'team',
      tone: 'base',
      spacing: 'default',
      heading: locale === 'bg' ? 'Екип' : 'Team',
      members: [
        {
          id: 'm1',
          name: locale === 'bg' ? 'Д-р Демо' : 'Dr Demo',
          role: locale === 'bg' ? 'Детски дентален лекар' : 'Pediatric dentist',
          bioShort: locale === 'bg' ? 'Работи нежно с деца.' : 'Works gently with children.',
          specialties: [],
          featured: true,
          credentials: [],
          sameAs: [],
        },
      ],
      layout: 'featuredFirst',
    },
    {
      key: 'quotes',
      type: 'testimonials',
      tone: 'soft',
      spacing: 'default',
      heading: locale === 'bg' ? 'Отзиви' : 'Reviews',
      items: [
        {
          id: 'q1',
          quote: locale === 'bg' ? 'Страхотно отношение.' : 'Wonderful care.',
          authorName: 'Maria',
          rating: 5,
          featured: true,
        },
      ],
      showRating: true,
    },
    {
      key: 'gallery',
      type: 'gallery',
      tone: 'base',
      spacing: 'default',
      heading: locale === 'bg' ? 'Галерия' : 'Gallery',
      items: [
        {
          id: 'g1',
          album: 'clinic',
          image: heroSplitBg.image!,
        },
      ],
      showLinkToGallery: false,
    },
    {
      key: 'blog',
      type: 'blogTeaser',
      tone: 'base',
      spacing: 'default',
      heading: locale === 'bg' ? 'Блог' : 'Blog',
      articles: [
        {
          id: 'a1',
          title: locale === 'bg' ? 'Съвет' : 'Tip',
          slug: 'tip',
          href: locale === 'bg' ? '/bg/blog/savet' : '/en/blog/tip',
          excerpt: locale === 'bg' ? 'Кратък съвет.' : 'A short tip.',
          publishedAt: '2026-01-15',
        },
      ],
    },
    {
      key: 'cta',
      type: 'ctaBand',
      tone: 'brand',
      spacing: 'default',
      heading: locale === 'bg' ? 'Обадете се' : 'Get in touch',
      ctas: [book, { label: 'Call', action: 'call', style: 'secondary', link: null }],
    },
    {
      key: 'hours',
      type: 'contactHours',
      tone: 'base',
      spacing: 'default',
      heading: locale === 'bg' ? 'Часове' : 'Hours',
      showMap: true,
      showForm: false,
    },
  ]
}

type SectionsDemoProps = {
  locale: Locale
}

export async function SectionsDemo({ locale }: SectionsDemoProps) {
  return (
  <>
      <Container className="py-12">
        <Heading as="h2" size="step-3" id="sections">
          Sections
        </Heading>
        <Text tone="muted" className="mt-2 max-w-(--container-prose)">
          Page-builder sections (Phase 06). Hero variants first, then content blocks.
        </Text>
      </Container>
      {await SectionRenderer({ sections: demoSections(locale), locale, site: fixtureSite })}
    </>
  )
}