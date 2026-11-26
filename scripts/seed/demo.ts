import type {
  Article,
  Cta,
  FaqItem,
  GalleryItem,
  LegalPage,
  Link,
  Navigation,
  Page,
  Service,
  ServiceCategory,
  SiteSettings,
  TeamMember,
  Testimonial,
} from '../../sanity.types'
import { type Locale } from '../../src/config/i18n'
import { slugify } from '../../src/lib/slug'
import {
  i18nRichTextSimple,
  i18nString,
  i18nText,
  image,
  keyed,
  type Localized,
  rank,
  ref,
  refs,
  richText,
  routable,
  routableId,
  type SeedDoc,
  type SeedImages,
  seedPrefix,
  simpleText,
  slugOf,
} from './helpers'
import { fillPlaceholders, type LegalDetails, type LegalKind, legalTemplates } from './legal'
import { rumiDentServices } from './rumident-services'

/** Fixed dates keep every run identical (idempotent seed). */
export const SEED_DATE = '2026-11-21'

type PageSection = NonNullable<Page['sections']>[number]
type SectionType = PageSection['_type']
type SectionFields<K extends SectionType> = Omit<
  Extract<PageSection, { _type: K }>,
  '_key' | '_type'
>

export const section = <K extends SectionType>(type: K, fields: SectionFields<K>) => ({
  _type: type,
  ...fields,
})

const systemLink = (systemRoute: NonNullable<Link['systemRoute']>): Link => ({
  _type: 'link',
  kind: 'internal',
  systemRoute,
})

const cta = (
  label: string,
  action: NonNullable<Cta['action']>,
  options: { link?: Link; style?: Cta['style'] } = {},
): Cta => ({ _type: 'cta', label, action, style: options.style ?? 'primary', link: options.link })

const id = (type: string, key: string) => `${seedPrefix}${type}-${key}`

const demoDetails: LegalDetails = {
  legalName: { bg: 'Руми Дент', en: 'Rumi Dent' },
  uic: { bg: '000000000', en: '000000000' },
  address: {
    bg: 'ж.к. Възраждане, ул. „Плиска“ 54, 7004 Русе',
    en: '54 Pliska St, Vazrazhdane, 7004 Ruse',
  },
  email: { bg: 'privacy@example.com', en: 'privacy@example.com' },
  phone: { bg: '082 841 190', en: '+359 82 841 190' },
  dpo: { bg: 'не е определено', en: 'not appointed' },
  retention: { bg: '12 месеца', en: '12 months' },
}

/** Legal pages for every kind and language. `details` fills the placeholders (demo only). */
export const legalPages = (details?: LegalDetails) =>
  (Object.keys(legalTemplates) as LegalKind[]).flatMap((kind) =>
    routable<LegalPage>('legalPage', kind, (locale) => {
      const template = legalTemplates[kind]
      const values = details
        ? Object.fromEntries(Object.entries(details).map(([key, value]) => [key, value[locale]]))
        : {}
      return {
        kind,
        title: template.title[locale],
        slug: slugOf(slugify(template.title[locale])),
        body: richText(...template.lines[locale].map((line) => fillPlaceholders(line, values))),
        lastUpdated: SEED_DATE,
      }
    }),
  )

/**
 * Rumi Dent's starting content. Services, the philosophy and the first-visit wording are the
 * client's own text; team photos, years of practice and the parents' quotes are placeholders
 * until the clinic sends the real ones (see seed/images/CREDITS.md).
 */
export function demoDocuments(images: SeedImages) {
  const categories: SeedDoc<ServiceCategory>[] = [
    {
      _id: id('serviceCategory', 'children'),
      _type: 'serviceCategory',
      title: i18nString({ bg: 'Детска дентална медицина', en: 'Pediatric dentistry' }),
      slug: [
        {
          _key: 'bg',
          _type: 'internationalizedArraySlugValue',
          language: 'bg',
          value: slugOf('deca'),
        },
        {
          _key: 'en',
          _type: 'internationalizedArraySlugValue',
          language: 'en',
          value: slugOf('children'),
        },
      ],
      description: i18nText({
        bg: 'Грижата за детските зъби започва още с появата на първото зъбче.',
        en: "Caring for children's teeth starts with the very first tooth.",
      }),
      audience: 'children',
      tone: 'soft',
      orderRank: rank(0),
    },
    {
      _id: id('serviceCategory', 'adults'),
      _type: 'serviceCategory',
      title: i18nString({ bg: 'Дентална медицина за възрастни', en: 'Adult dentistry' }),
      slug: [
        {
          _key: 'bg',
          _type: 'internationalizedArraySlugValue',
          language: 'bg',
          value: slugOf('vazrastni'),
        },
        {
          _key: 'en',
          _type: 'internationalizedArraySlugValue',
          language: 'en',
          value: slugOf('adults'),
        },
      ],
      description: i18nText({
        bg: 'При възрастните се стремим към дългосрочно запазване на естествените зъби, възстановяване на тяхната функция и естетика.',
        en: 'For adults, we aim to preserve the natural teeth for the long term, and to restore their function and appearance.',
      }),
      audience: 'adults',
      orderRank: rank(1),
    },
  ]

  const team: SeedDoc<TeamMember>[] = [
    {
      _id: id('teamMember', 'rumyana'),
      _type: 'teamMember',
      name: 'Румяна Купенова',
      nameLatin: 'Rumyana Kupenova',
      honorific: i18nString({ bg: 'Д-р', en: 'Dr' }),
      role: i18nString({ bg: 'Детски дентален лекар', en: 'Pediatric dentist' }),
      practisingSince: 2012,
      specialties: keyed(
        [
          { bg: 'Адаптация', en: 'Adaptation' },
          { bg: 'Профилактика', en: 'Prevention' },
          { bg: 'Кариес на ранното детство', en: 'Early childhood caries' },
        ].map((label) => ({ _type: 'specialty' as const, label: i18nString(label) })),
        'sp',
      ),
      bioShort: i18nText({
        bg: 'Д-р Купенова се грижи за най-малките пациенти с търпение и много внимание. Обяснява всяка стъпка с думи, които детето разбира, и не бърза – доверието идва първо.',
        en: 'Dr Kupenova looks after the youngest patients with patience and care. She explains every step in words a child understands, and never rushes: trust comes first.',
      }),
      bio: i18nRichTextSimple({
        bg: simpleText(
          'Всяко дете има свой характер, свои страхове и свое темпо на адаптация.',
          'Затова първото посещение е запознанство, а не изпитание: по метода „Кажи – Покажи – Направи“ детето първо чува, после вижда и чак тогава опитва.',
        ),
        en: simpleText(
          'Every child has their own character, their own fears and their own pace of adapting.',
          'That is why the first visit is a meeting, not a test: with "Tell – Show – Do", the child first hears, then sees, and only then tries.',
        ),
      }),
      photo: image(images, 'team-rumyana', {
        bg: 'Д-р Румяна Купенова',
        en: 'Dr Rumyana Kupenova',
      }),
      featured: true,
      categories: refs([id('serviceCategory', 'children')]),
      orderRank: rank(0),
    },
    {
      _id: id('teamMember', 'georgi'),
      _type: 'teamMember',
      name: 'Георги Йорданов',
      nameLatin: 'Georgi Yordanov',
      honorific: i18nString({ bg: 'Д-р', en: 'Dr' }),
      role: i18nString({ bg: 'Лекар по дентална медицина', en: 'Dentist for adults' }),
      practisingSince: 2010,
      specialties: keyed(
        [
          { bg: 'Ендодонтия', en: 'Endodontics' },
          { bg: 'Протетика', en: 'Prosthetics' },
          { bg: 'Пародонтология', en: 'Periodontology' },
        ].map((label) => ({ _type: 'specialty' as const, label: i18nString(label) })),
        'sp',
      ),
      bioShort: i18nText({
        bg: 'Д-р Йорданов се грижи за родителите и всички възрастни пациенти – от лечение на кариес и коренови канали до протетика, в същия спокоен кабинет.',
        en: 'Dr Yordanov looks after parents and every adult patient, from fillings and root canals to prosthetics, in the same calm practice.',
      }),
      photo: image(images, 'team-georgi', {
        bg: 'Д-р Георги Йорданов',
        en: 'Dr Georgi Yordanov',
      }),
      featured: false,
      categories: refs([id('serviceCategory', 'adults')]),
      orderRank: rank(1),
    },
  ]

  const faqs: SeedDoc<FaqItem>[] = (
    [
      [
        'age',
        'firstVisit',
        {
          bg: 'От каква възраст да доведа детето на зъболекар?',
          en: 'At what age should my child first see a dentist?',
        },
        {
          bg: 'Препоръчително е първото посещение да бъде до шест месеца след пробива на първото зъбче, но не по-късно от първия рожден ден.',
          en: 'The first visit is best within six months of the first tooth coming through, and no later than the first birthday.',
        },
      ],
      [
        'prepare',
        'firstVisit',
        {
          bg: 'Как да подготвя детето за първото посещение?',
          en: 'How do I prepare my child for the first visit?',
        },
        {
          bg: 'Говорете спокойно и положително, без обещания като „няма да боли“. Първото посещение е запознанство: детето разглежда кабинета, стола и „инструментите“.',
          en: 'Talk about it calmly and positively, without promises like "it won\'t hurt". The first visit is a meeting: your child explores the room, the chair and the "tools".',
        },
      ],
      [
        'stay',
        'children',
        {
          bg: 'Мога ли да остана при детето по време на прегледа?',
          en: 'Can I stay with my child during the check-up?',
        },
        {
          bg: 'Да. Родителят може да е до детето – вашето спокойствие му помага да се почувства в безопасност.',
          en: 'Yes. A parent can stay close; your calm helps your child feel safe.',
        },
      ],
      [
        'length',
        'children',
        {
          bg: 'Колко време продължава един преглед?',
          en: 'How long does a check-up take?',
        },
        {
          bg: 'Колкото е нужно детето да се почувства спокойно. Не бързаме – съобразяваме посещението с възрастта и готовността на детето.',
          en: "As long as your child needs to feel at ease. We never rush, and fit the visit to your child's age and readiness.",
        },
      ],
      [
        'adults',
        'adults',
        { bg: 'Лекувате ли и възрастни?', en: 'Do you treat adults too?' },
        {
          bg: 'Да. Д-р Георги Йорданов се грижи за възрастните: кариесология, ендодонтия, протетика, пародонтология, професионална орална хигиена и орална хирургия.',
          en: 'Yes. Dr Georgi Yordanov looks after adults: cariology, endodontics, prosthetics, periodontology, professional oral hygiene and oral surgery.',
        },
      ],
      [
        'booking',
        'general',
        { bg: 'Как да запиша час?', en: 'How do I book a visit?' },
        {
          bg: 'Записването е по телефона: 082 841 190. Препоръчително е да запазите час предварително.',
          en: 'Visits are booked by phone: +359 82 841 190. It is best to book ahead.',
        },
      ],
    ] as const
  ).map(([key, category, question, answer], index) => ({
    _id: id('faqItem', key),
    _type: 'faqItem',
    question: i18nString(question),
    answer: i18nRichTextSimple({ bg: simpleText(answer.bg), en: simpleText(answer.en) }),
    category,
    orderRank: rank(index),
  }))

  const gallery: SeedDoc<GalleryItem>[] = (
    [
      ['clinic-room', 'clinic', { bg: 'Светъл дентален кабинет', en: 'A bright treatment room' }],
      ['clinic-reception', 'clinic', { bg: 'Цветни четки за зъби', en: 'Colourful toothbrushes' }],
      [
        'clinic-waiting',
        'clinic',
        { bg: 'Паста за зъби във формата на сърце', en: 'A heart of toothpaste' },
      ],
      ['clinic-kids-corner', 'other', { bg: 'Усмихнато момиче', en: 'A smiling girl' }],
    ] as const
  ).map(([name, album, alt], index) => ({
    _id: id('galleryItem', name),
    _type: 'galleryItem',
    image: image(images, name, alt),
    album,
    showsPatient: false,
    orderRank: rank(index),
  }))

  // Placeholder quotes for the layout; replace with real, consented reviews before launch.
  const testimonials: SeedDoc<Testimonial>[] = (
    [
      [
        { bg: 'Мария, майка на Ники (5 г.)', en: 'Maria, mum of Niki (5)' },
        {
          bg: 'Ники влезе в кабинета, стиснал ръката ми, а излезе усмихнат и пита кога пак ще дойдем. Благодарим за търпението и топлото отношение!',
          en: 'Niki walked in holding my hand tight and walked out smiling, asking when we can come back. Thank you for the patience and the warmth!',
        },
        '2026-09-14',
      ],
      [
        { bg: 'Иван, татко на Ема (3 г.)', en: 'Ivan, dad of Ema (3)' },
        {
          bg: 'Първото посещение беше игра – Ема преброи зъбчетата си заедно с докторката. Никакъв страх и никакво бързане.',
          en: 'The first visit was a game: Ema counted her teeth together with the doctor. No fear and no rush.',
        },
        '2026-10-02',
      ],
      [
        { bg: 'Десислава', en: 'Desislava' },
        {
          bg: 'Доведох детето, а после записах и себе си при д-р Йорданов. Спокойно, внимателно и с обяснение на всяка стъпка.',
          en: 'I brought my child, then booked myself in with Dr Yordanov. Calm, careful, and every step explained.',
        },
        '2026-10-28',
      ],
    ] as const
  ).map(([author, quote, date], index) => ({
    _id: id('testimonial', String(index + 1)),
    _type: 'testimonial',
    quote: i18nText(quote),
    authorName: author.bg,
    rating: 5,
    date,
    source: 'manual',
    consentOnFile: true,
    featured: true,
  }))

  const serviceDocs = rumiDentServices.flatMap((service, index) =>
    routable<Service>('service', service.key, (locale) => ({
      title: service.title[locale],
      slug: slugOf(service.slug[locale]),
      category: ref(id('serviceCategory', service.category)),
      icon: service.icon,
      teaser: service.teaser[locale],
      summary: simpleText(...service.summary[locale]),
      hasDetailPage: Boolean(service.body),
      ...(service.body ? { body: richText(...service.body[locale]) } : {}),
      ...(service.category === 'children'
        ? {
            faq: refs([id('faqItem', 'age'), id('faqItem', 'prepare')]),
            doctors: refs([id('teamMember', 'rumyana')]),
          }
        : { doctors: refs([id('teamMember', 'georgi')]) }),
      orderRank: rank(index),
    })),
  )

  const articleDocs = [
    ...routable<Article>('article', 'first-visit', (locale) => {
      const title: Localized = {
        bg: 'Кога да заведем детето на първи преглед при зъболекар',
        en: 'When to take your child to the dentist for the first time',
      }
      return {
        title: title[locale],
        slug: slugOf(slugify(title[locale])),
        excerpt: {
          bg: 'Първото посещение е по-рано, отколкото повечето родители мислят. Ето кога, защо и как да подготвите детето, за да мине леко.',
          en: 'The first visit comes earlier than most parents think. Here is when, why and how to prepare your child so it feels easy.',
        }[locale],
        cover: image(images, 'article-first-visit', {
          bg: 'Дентален лекар показва на момиче как да мие зъбите си',
          en: 'A dentist showing a girl how to brush her teeth',
        }),
        body: richText(
          ...{
            bg: [
              'Препоръчително е първото посещение при дентален лекар да бъде до шест месеца след пробива на първото зъбче, но не по-късно от първия рожден ден.',
              '## Защо толкова рано',
              'Ранният преглед хваща проблемите, докато са малки, и учи детето, че кабинетът е безопасно място.',
              '## Как да подготвите детето',
              '- Играйте на зъболекар у дома',
              '- Четете книжка за зъбите',
              '- Не обещавайте, че „няма да боли“',
            ],
            en: [
              "A child's first dental visit is best within six months of the first tooth, and no later than the first birthday.",
              '## Why so early',
              'An early visit catches problems while they are small and teaches your child that the dental office is a safe place.',
              '## How to prepare your child',
              '- Play dentist at home',
              '- Read a picture book about teeth',
              '- Don\'t promise that "it won\'t hurt"',
            ],
          }[locale],
        ),
        author: ref(id('teamMember', 'rumyana')),
        reviewedBy: ref(id('teamMember', 'rumyana')),
        publishedAt: '2026-10-05T08:00:00Z',
        related: refs([routableId('article', 'brushing', locale)]),
      }
    }),
    ...routable<Article>('article', 'brushing', (locale) => {
      const title: Localized = {
        bg: 'Как да научим детето да мие зъбите си',
        en: 'Teaching your child to brush their teeth',
      }
      return {
        title: title[locale],
        slug: slugOf(slugify(title[locale])),
        excerpt: {
          bg: 'Две минути, два пъти на ден, с помощта на родител до около осемгодишна възраст. Практични съвети, които наистина работят у дома.',
          en: 'Two minutes, twice a day, with a parent helping until about age eight. Practical tips that actually work at home.',
        }[locale],
        cover: image(images, 'article-brushing', {
          bg: 'Татко и две деца мият зъбите си заедно',
          en: 'A dad and two children brushing their teeth together',
        }),
        body: richText(
          ...{
            bg: [
              'Децата имат нужда от помощ при миенето на зъбите, докато не могат сами да завържат връзките на обувките си.',
              '## Колко паста',
              'До три години количество колкото оризово зърно, след това колкото грахово зърно.',
              '## Как да е забавно',
              '- Пуснете любима песен за две минути',
              '- Редувайте се: първо детето, после Вие',
            ],
            en: [
              'Children need help brushing until they can tie their own shoelaces.',
              '## How much toothpaste',
              'A smear the size of a grain of rice until age three, then a pea-sized amount.',
              '## Making it fun',
              '- Play a favourite two-minute song',
              '- Take turns: your child first, then you',
            ],
          }[locale],
        ),
        author: ref(id('teamMember', 'rumyana')),
        publishedAt: '2026-11-02T08:00:00Z',
      }
    }),
    ...routable<Article>('article', 'early-caries', (locale) => {
      const title: Localized = {
        bg: 'Кариес на ранното детство: какво трябва да знаят родителите',
        en: 'Early childhood caries: what parents should know',
      }
      return {
        title: title[locale],
        slug: slugOf(slugify(title[locale])),
        excerpt: {
          bg: 'Млечните зъби са важни – пазят място за постоянните и помагат на детето да се храни и говори. Как да разпознаем кариеса навреме.',
          en: 'Baby teeth matter: they hold space for the permanent ones and help a child eat and speak. How to spot caries early.',
        }[locale],
        cover: image(images, 'article-habits', {
          bg: 'Момиче мие зъбите си пред огледалото',
          en: 'A girl brushing her teeth at the mirror',
        }),
        body: richText(
          ...{
            bg: [
              'Кариесът на ранното детство засяга деца под шестгодишна възраст и може да напредне бързо.',
              '## Ранните признаци',
              '- Бели, матови петна по зъбите до венците',
              '- Кафяви оцветявания',
              '- Чувствителност при хранене',
              '## Какво помага',
              'Редовни профилактични прегледи, правилна хигиена и ограничаване на сладките напитки, особено преди сън.',
            ],
            en: [
              'Early childhood caries affects children under six and can progress quickly.',
              '## The early signs',
              '- White, chalky spots near the gums',
              '- Brown stains',
              '- Sensitivity when eating',
              '## What helps',
              'Regular check-ups, good brushing and fewer sugary drinks, especially before bedtime.',
            ],
          }[locale],
        ),
        author: ref(id('teamMember', 'rumyana')),
        publishedAt: '2026-11-18T08:00:00Z',
      }
    }),
  ]

  const bookCta = (locale: Locale) =>
    cta({ bg: 'Запишете час', en: 'Book a visit' }[locale], 'booking')

  const philosophyBody: Localized<string[]> = {
    bg: [
      'Всяко дете има свой характер, свои страхове и свое темпо на адаптация.',
      'Нашата задача е да намерим подхода, който съчетава качествена дентална грижа, безопасност, разбиране и уважение към малкия пациент. Защото доверието, изградено в детството, може да остане за цял живот.',
    ],
    en: [
      'Every child has their own character, their own fears and their own pace of adapting.',
      'Our job is to find the approach that brings together quality dental care, safety, understanding and respect for the young patient. Because trust built in childhood can last a lifetime.',
    ],
  }

  const pages = [
    ...routable<Page>('page', 'home', (locale) => ({
      pageKey: 'home',
      title: { bg: 'Начало', en: 'Home' }[locale],
      intro: {
        bg: 'Детски дентален център в Русе.',
        en: "A children's dental centre in Ruse.",
      }[locale],
      sections: keyed(
        [
          section('section.hero', {
            heading: {
              bg: 'Спокоен път към *здрави* детски зъбки',
              en: 'A calm path to *healthy* little teeth',
            }[locale],
            subheading: {
              bg: 'Грижим се за зъбите на децата от първото зъбче до тийнейджърските години – търпеливо, нежно и без бързане. Има лекар и за родителите.',
              en: "Gentle, unhurried care for children's teeth, from the very first tooth to the teenage years. And a dentist for parents, too.",
            }[locale],
            ctas: keyed([bookCta(locale)]),
            image: image(images, 'hero-kid', {
              bg: 'Усмихнато момче мие зъбите си и държи голямо хартиено зъбче',
              en: 'A smiling boy brushing his teeth and holding a big paper tooth',
            }),
            variant: 'cutout',
          }),
          section('section.tiles', {
            heading: { bg: 'Нашите *услуги*', en: 'Our *services*' }[locale],
            intro: {
              bg: 'В „Руми Дент“ се грижим за зъбите на деца и възрастни. При децата акцентът е върху профилактиката и спокойното изграждане на доверие.',
              en: 'At Rumi Dent we care for the teeth of children and adults. For children, the focus is on prevention and calmly building trust.',
            }[locale],
            source: 'services',
            allowMultiple: false,
            density: 'comfortable',
            tone: 'soft',
            anchorId: { bg: 'uslugi', en: 'services' }[locale],
          }),
          section('section.processSteps', {
            heading: {
              bg: 'Първото посещение – *запознанство*, а не изпитание',
              en: 'The first visit is a *meeting*, not a test',
            }[locale],
            intro: {
              bg: 'Три спокойни стъпки, съобразени с темпото на детето. Без бързане и без изненади.',
              en: "Three calm steps at your child's pace. No rush and no surprises.",
            }[locale],
            steps: keyed(
              [
                {
                  _type: 'processStep' as const,
                  icon: 'phone' as const,
                  title: { bg: 'Обаждате се', en: 'You call us' }[locale],
                  text: {
                    bg: 'Казвате ни възрастта на детето и какво ви тревожи. Избираме удобен час.',
                    en: "Tell us your child's age and what worries you. We find a time that suits you.",
                  }[locale],
                },
                {
                  _type: 'processStep' as const,
                  icon: 'smile' as const,
                  title: { bg: 'Запознаваме се', en: 'We get to know each other' }[locale],
                  text: {
                    bg: 'Детето разглежда кабинета, стола и „инструментите“ – по метода „Кажи – Покажи – Направи“.',
                    en: 'Your child explores the room, the chair and the "tools", the Tell – Show – Do way.',
                  }[locale],
                },
                {
                  _type: 'processStep' as const,
                  icon: 'heart' as const,
                  title: { bg: 'Преглеждаме и разказваме', en: 'A gentle look, then a chat' }[
                    locale
                  ],
                  text: {
                    bg: 'Нежен преглед без бързане, родителят е до детето. После обясняваме какво видяхме и какво следва.',
                    en: 'A gentle, unhurried check-up with you close by. Then we explain what we saw and what comes next.',
                  }[locale],
                },
              ],
              'p',
            ),
            tone: 'inverse',
          }),
          section('section.textImage', {
            heading: {
              bg: 'Не лекуваме само зъби. Грижим се за *децата*, на които принадлежат.',
              en: 'We do not only treat teeth. We care for the *children* they belong to.',
            }[locale],
            body: richText(...philosophyBody[locale]),
            image: image(images, 'philosophy', {
              bg: 'Майка и дъщеря държат дървени четки за зъби',
              en: 'A mother and daughter holding wooden toothbrushes',
            }),
            imagePosition: 'right',
            tone: 'accent',
          }),
          section('section.team', {
            heading: { bg: 'Запознайте се с *лекарите*', en: 'Meet the *dentists*' }[locale],
            intro: {
              bg: 'Детски дентален лекар за малките и лекар за възрастните – под един покрив, в един спокоен кабинет.',
              en: 'A pediatric dentist for the little ones and a dentist for the grown-ups, under one roof.',
            }[locale],
            layout: 'featuredFirst',
          }),
          section('section.testimonials', {
            heading: { bg: 'Какво казват *родителите*', en: 'What *parents* say' }[locale],
            showRating: false,
            tone: 'soft',
          }),
          section('section.faq', {
            heading: { bg: 'Въпроси на *родителите*', en: 'Questions from *parents*' }[locale],
            intro: {
              bg: 'Кратки отговори на най-честите въпроси преди първото посещение.',
              en: 'Short answers to the questions parents ask most before the first visit.',
            }[locale],
            source: 'all',
            emitSchema: true,
          }),
          section('section.blogTeaser', {
            heading: { bg: 'Съвети за *здрави* усмивки', en: 'Tips for *healthy* smiles' }[locale],
            mode: 'latest',
            count: 3,
            tone: 'accent',
          }),
          section('section.ctaBand', {
            heading: {
              bg: 'Обадете се – ще намерим *удобен* час',
              en: "Call us – we'll find a *time* that suits you",
            }[locale],
            text: {
              bg: 'Записване по телефона. Препоръчително е да запазите час предварително.',
              en: 'Booking is by phone. It is best to book ahead.',
            }[locale],
            ctas: keyed([bookCta(locale)]),
            tone: 'brand',
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'services', (locale) => ({
      pageKey: 'services',
      title: { bg: 'Нашите услуги', en: 'Our services' }[locale],
      intro: {
        bg: 'В детски дентален център „Руми Дент“ предлагаме стоматологична грижа за деца и възрастни, съобразена с индивидуалните потребности на всеки пациент.',
        en: "At the Rumi Dent children's dental centre we offer dental care for children and adults, tailored to the needs of each patient.",
      }[locale],
      sections: keyed(
        [
          section('section.tiles', {
            heading: { bg: 'Всички *услуги*', en: 'All *services*' }[locale],
            source: 'services',
            allowMultiple: true,
            density: 'comfortable',
          }),
          section('section.textImage', {
            heading: { bg: 'Нашият *подход*', en: 'Our *approach*' }[locale],
            body: richText(
              ...{
                bg: [
                  'Вярваме, че добрата дентална грижа се основава на доверие, внимание и индивидуално отношение.',
                  'При възрастните се стремим към дългосрочно запазване на естествените зъби, възстановяване на тяхната функция и естетика. При децата поставяме специален акцент върху профилактиката, спокойната атмосфера и постепенното изграждане на доверие към денталния лекар.',
                  '„Руми Дент“ – грижа за усмивката във всяка възраст.',
                ],
                en: [
                  'We believe good dental care is built on trust, attention and an individual approach.',
                  'For adults, we aim to preserve the natural teeth for the long term and restore their function and appearance. For children, we put a special focus on prevention, a calm atmosphere and gradually building trust in the dentist.',
                  'Rumi Dent: caring for smiles at every age.',
                ],
              }[locale],
            ),
            imagePosition: 'right',
            tone: 'accent',
          }),
          section('section.faq', {
            heading: { bg: 'Често задавани *въпроси*', en: 'Frequently asked *questions*' }[locale],
            source: 'all',
            emitSchema: true,
          }),
          section('section.ctaBand', {
            heading: { bg: 'Имате въпрос? *Обадете се*', en: 'A question? *Call us*' }[locale],
            ctas: keyed([bookCta(locale)]),
            tone: 'brand',
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'about', (locale) => ({
      pageKey: 'about',
      title: { bg: 'За нас', en: 'About us' }[locale],
      intro: {
        bg: 'Детски дентален център „Руми Дент“ в Русе: лекарите, подходът и кабинетът.',
        en: "The Rumi Dent children's dental centre in Ruse: the dentists, the approach and the practice.",
      }[locale],
      sections: keyed(
        [
          section('section.textImage', {
            heading: {
              bg: 'Не лекуваме само зъби. Грижим се за *децата*, на които принадлежат.',
              en: 'We do not only treat teeth. We care for the *children* they belong to.',
            }[locale],
            body: richText(...philosophyBody[locale]),
            image: image(images, 'philosophy', {
              bg: 'Майка и дъщеря държат дървени четки за зъби',
              en: 'A mother and daughter holding wooden toothbrushes',
            }),
            imagePosition: 'right',
          }),
          section('section.team', {
            heading: { bg: 'Лекарите', en: 'The dentists' }[locale],
            layout: 'grid',
            tone: 'soft',
          }),
          section('section.gallery', {
            heading: { bg: 'Кабинетът', en: 'The practice' }[locale],
            album: 'clinic',
            limit: 4,
            showLinkToGallery: true,
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'gallery', (locale) => ({
      pageKey: 'gallery',
      title: { bg: 'Галерия', en: 'Gallery' }[locale],
      intro: {
        bg: 'Поглед към кабинета и малките неща, които правят посещението приятно.',
        en: 'A look at the practice and the small things that make a visit pleasant.',
      }[locale],
      sections: keyed(
        [
          section('section.gallery', {
            limit: 24,
            showLinkToGallery: false,
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'blog', (locale) => ({
      pageKey: 'blog',
      title: { bg: 'Блог', en: 'Blog' }[locale],
      intro: {
        bg: 'Съвети за здрави детски зъби от д-р Купенова.',
        en: "Tips for healthy children's teeth from Dr Kupenova.",
      }[locale],
      sections: [],
    })),
    ...routable<Page>('page', 'contact', (locale) => ({
      pageKey: 'contact',
      title: { bg: 'Контакти', en: 'Contact' }[locale],
      intro: {
        bg: 'Адрес, работно време и как да запишете час.',
        en: 'Address, opening hours and how to book a visit.',
      }[locale],
      sections: keyed(
        [
          section('section.contactHours', {
            heading: {
              bg: 'Обадете се – ще намерим *удобен* час',
              en: "Call us – we'll find a *time* that suits you",
            }[locale],
            showMap: true,
            showForm: true,
            note: {
              bg: 'Записване само по телефона. Препоръчително е да запазите час предварително.',
              en: 'Booking is by phone only. It is best to book ahead.',
            }[locale],
          }),
          section('section.faq', {
            heading: { bg: 'Преди да дойдете', en: 'Before you come' }[locale],
            source: 'category',
            category: 'firstVisit',
            emitSchema: true,
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'first-visit', (locale) => {
      const title: Localized = { bg: 'Първо посещение', en: 'First visit' }
      return {
        title: title[locale],
        slug: slugOf(slugify(title[locale])),
        intro: {
          bg: 'Всичко, което родителите трябва да знаят преди първия преглед на детето.',
          en: "Everything parents need to know before their child's first check-up.",
        }[locale],
        sections: keyed(
          [
            section('section.textImage', {
              heading: {
                bg: 'Първо посещение – *запознанство*, а не изпитание',
                en: 'The first visit is a *meeting*, not a test',
              }[locale],
              body: richText(
                {
                  bg: 'Първото посещение е запознанство. Детето разглежда кабинета, сяда на стола и опознава „инструментите“ с думи, които разбира.',
                  en: 'The first visit is a meeting. Your child explores the room, sits in the chair and gets to know the "tools" in words they understand.',
                }[locale],
              ),
              image: image(images, 'clinic-room', {
                bg: 'Светъл дентален кабинет',
                en: 'A bright treatment room',
              }),
              imagePosition: 'left',
            }),
            section('section.tiles', {
              heading: { bg: 'Какво да вземете', en: 'What to bring' }[locale],
              source: 'manual',
              items: keyed(
                [
                  {
                    _type: 'tileItem' as const,
                    icon: 'clipboard-list' as const,
                    slug: 'documents',
                    title: { bg: 'Документи', en: 'Documents' }[locale],
                    teaser: {
                      bg: 'Лична карта на родителя и здравна книжка.',
                      en: "Parent's ID and the child's health record.",
                    }[locale],
                  },
                  {
                    _type: 'tileItem' as const,
                    icon: 'heart' as const,
                    slug: 'favourite-toy',
                    title: { bg: 'Любима играчка', en: 'A favourite toy' }[locale],
                    teaser: {
                      bg: 'Нещо познато помага на детето да се отпусне.',
                      en: 'Something familiar helps your child relax.',
                    }[locale],
                  },
                  {
                    _type: 'tileItem' as const,
                    icon: 'clock' as const,
                    slug: 'time',
                    title: { bg: 'Малко време', en: 'A little time' }[locale],
                    teaser: {
                      bg: 'Елате 10 минути по-рано, за да разгледате.',
                      en: 'Come 10 minutes early to look around.',
                    }[locale],
                    body: simpleText(
                      {
                        bg: 'Така детето вижда чакалнята, преди да влезе в кабинета.',
                        en: 'That way your child sees the waiting area before going into the room.',
                      }[locale],
                    ),
                  },
                ],
                'i',
              ),
              allowMultiple: false,
              density: 'compact',
              tone: 'soft',
            }),
            section('section.faq', {
              heading: { bg: 'Въпроси на *родителите*', en: 'Questions from *parents*' }[locale],
              source: 'selected',
              items: refs([id('faqItem', 'age'), id('faqItem', 'prepare'), id('faqItem', 'stay')]),
              emitSchema: true,
            }),
            section('section.ctaBand', {
              heading: {
                bg: 'Готови ли сте за *първата* среща?',
                en: 'Ready for the *first* visit?',
              }[locale],
              ctas: keyed([bookCta(locale)]),
              tone: 'brand',
            }),
          ],
          's',
        ),
      }
    }),
  ]

  const settings: SeedDoc<SiteSettings> = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    brandName: i18nString({ bg: 'Руми Дент', en: 'Rumi Dent' }),
    tagline: i18nString({
      bg: 'Детски дентален център · Русе',
      en: "Children's dental centre · Ruse",
    }),
    logo: {
      _type: 'image',
      asset: image(images, 'logo', { bg: 'Руми Дент', en: 'Rumi Dent' }).asset,
    },
    businessType: 'Dentist',
    areaServed: i18nString({ bg: 'Русе и областта', en: 'Ruse and the region' }),
    address: {
      _type: 'address',
      street: i18nString({
        bg: 'ж.к. Възраждане, ул. „Плиска“ 54',
        en: '54 Pliska St, Vazrazhdane',
      }),
      city: i18nString({ bg: 'Русе', en: 'Ruse' }),
      postalCode: '7004',
      countryCode: 'BG',
    },
    geo: { _type: 'geo', lat: 43.8411, lng: 25.9772 },
    phones: keyed(
      [
        {
          _type: 'phone' as const,
          key: 'primary' as const,
          e164: '+35982841190',
          display: '082 841 190',
          label: i18nString({ bg: 'Записване', en: 'Bookings' }),
        },
      ],
      'ph',
    ),
    mapPlaceholder: image(images, 'map-placeholder', {
      bg: 'Карта с местоположението на „Руми Дент“',
      en: 'Map showing where Rumi Dent is',
    }),
    openingHours: keyed(
      [
        {
          _type: 'openingHoursSpec' as const,
          days: ['Mo', 'Tu', 'Th'],
          opens: '09:00',
          closes: '18:00',
        },
        {
          _type: 'openingHoursSpec' as const,
          days: ['We', 'Fr'],
          opens: '09:00',
          closes: '14:00',
        },
      ],
      'h',
    ),
    timeZone: 'Europe/Sofia',
    booking: {
      _type: 'bookingConfig',
      mode: 'phone',
    },
    contactForm: {
      recipient: 'hello@example.com',
      subjectPrefix: i18nString({ bg: 'Запитване от сайта', en: 'Website enquiry' }),
      successMessage: i18nText({
        bg: 'Благодарим! Ще Ви се обадим в рамките на работния ден.',
        en: 'Thank you! We will call you back within the working day.',
      }),
    },
    legal: {
      _type: 'legalEntity',
      legalName: demoDetails.legalName.bg,
      uic: demoDetails.uic.bg,
      representative: 'Румяна Купенова',
      privacyEmail: 'privacy@example.com',
      professionalBody: i18nString({
        bg: 'Български зъболекарски съюз',
        en: 'Bulgarian Dental Association',
      }),
    },
    legalLinks: keyed(
      (Object.keys(legalTemplates) as LegalKind[]).map((kind) =>
        ref(routableId('legalPage', kind, 'bg'), { weak: true }),
      ),
      'l',
    ),
    seoDefaults: {
      titleTemplate: i18nString({ bg: '%s · Руми Дент', en: '%s · Rumi Dent' }),
      description: i18nText({
        bg: 'Детски дентален център „Руми Дент“ в Русе: спокойни прегледи, профилактика и лечение за деца, и лекар за родителите.',
        en: "Rumi Dent, a children's dental centre in Ruse: calm check-ups, prevention and treatment for children, and a dentist for parents too.",
      }),
      ogImage: image(images, 'og-default', {
        bg: 'Руми Дент, детски дентален център',
        en: "Rumi Dent, children's dental centre",
      }),
    },
  }

  return [
    settings,
    navigationDoc(),
    ...categories,
    ...team,
    ...faqs,
    ...gallery,
    ...testimonials,
    ...serviceDocs,
    ...articleDocs,
    ...pages,
    ...legalPages(demoDetails),
  ]
}

const navLabel = (values: Localized) => i18nString(values)

/** Header, footer and call bar. Only system routes, so it also fits `--client` (no references). */
export function navigationDoc(): SeedDoc<Navigation> {
  const item = (label: Localized, route: NonNullable<Link['systemRoute']>) => ({
    _type: 'navItem' as const,
    label: navLabel(label),
    link: systemLink(route),
  })
  const navLink = (label: Localized, route: NonNullable<Link['systemRoute']>) => ({
    _type: 'navLink' as const,
    label: navLabel(label),
    link: systemLink(route),
  })
  return {
    _id: 'navigation',
    _type: 'navigation',
    header: keyed(
      [
        item({ bg: 'Услуги', en: 'Services' }, 'services'),
        item({ bg: 'За нас', en: 'About' }, 'about'),
        item({ bg: 'Блог', en: 'Blog' }, 'blog'),
        item({ bg: 'Контакти', en: 'Contact' }, 'contact'),
      ],
      'n',
    ),
    headerCta: {
      _type: 'ctaI18n',
      label: navLabel({ bg: 'Запишете час', en: 'Book a visit' }),
      action: 'booking',
      style: 'primary',
    },
    footerColumns: keyed(
      [
        {
          _type: 'footerColumn' as const,
          title: navLabel({ bg: 'Руми Дент', en: 'Rumi Dent' }),
          links: keyed(
            [
              navLink({ bg: 'За нас', en: 'About' }, 'about'),
              navLink({ bg: 'Галерия', en: 'Gallery' }, 'gallery'),
              navLink({ bg: 'Блог', en: 'Blog' }, 'blog'),
            ],
            'f',
          ),
        },
        {
          _type: 'footerColumn' as const,
          title: navLabel({ bg: 'Пациенти', en: 'Patients' }),
          links: keyed(
            [
              navLink({ bg: 'Услуги', en: 'Services' }, 'services'),
              navLink({ bg: 'Контакти', en: 'Contact' }, 'contact'),
            ],
            'f',
          ),
        },
      ],
      'c',
    ),
    mobileActionBar: { showDirections: true, secondaryAction: 'none' },
  }
}
