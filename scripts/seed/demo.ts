import type {
  Announcement,
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
  legalName: { bg: 'Демо Дентал ЕООД', en: 'Demo Dental EOOD' },
  uic: { bg: '000000000', en: '000000000' },
  address: { bg: 'ул. „Демо“ 1, 7000 Русе', en: '1 Demo St, 7000 Ruse' },
  email: { bg: 'hello@example.com', en: 'hello@example.com' },
  phone: { bg: '082 000 000', en: '+359 82 000 000' },
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

export function demoDocuments(images: SeedImages) {
  const categories: SeedDoc<ServiceCategory>[] = [
    {
      _id: id('serviceCategory', 'children'),
      _type: 'serviceCategory',
      title: i18nString({ bg: 'Детска стоматология', en: "Children's dentistry" }),
      slug: [
        {
          _key: 'bg',
          _type: 'internationalizedArraySlugValue',
          language: 'bg',
          value: slugOf('detska-stomatologiya'),
        },
        {
          _key: 'en',
          _type: 'internationalizedArraySlugValue',
          language: 'en',
          value: slugOf('childrens-dentistry'),
        },
      ],
      description: i18nText({
        bg: 'Спокойни прегледи и лечение за деца от първото зъбче до тийнейджърските години.',
        en: 'Calm check-ups and treatment for children, from the first tooth to the teenage years.',
      }),
      audience: 'children',
      tone: 'accent',
      orderRank: rank(0),
    },
    {
      _id: id('serviceCategory', 'adults'),
      _type: 'serviceCategory',
      title: i18nString({ bg: 'За възрастни', en: 'For adults' }),
      description: i18nText({
        bg: 'Профилактика, лечение и естетика за родители и всички възрастни пациенти.',
        en: 'Prevention, treatment and cosmetic care for parents and every adult patient.',
      }),
      audience: 'adults',
      tone: 'soft',
      orderRank: rank(1),
    },
  ]

  const team: SeedDoc<TeamMember>[] = [
    {
      _id: id('teamMember', 'maria'),
      _type: 'teamMember',
      name: 'Мария Иванова',
      nameLatin: 'Maria Ivanova',
      honorific: i18nString({ bg: 'Д-р', en: 'Dr' }),
      role: i18nString({ bg: 'Детски зъболекар', en: 'Paediatric dentist' }),
      specialties: keyed(
        [
          {
            _type: 'specialty' as const,
            label: i18nString({ bg: 'Първи посещения', en: 'First visits' }),
          },
          {
            _type: 'specialty' as const,
            label: i18nString({ bg: 'Силанти', en: 'Sealants' }),
          },
        ],
        'sp',
      ),
      bioShort: i18nText({
        bg: 'Д-р Иванова работи с деца над 12 години. Вярва, че първото посещение трябва да е игра, а не изпитание.',
        en: 'Dr Ivanova has treated children for over 12 years. She believes a first visit should feel like play, not a test.',
      }),
      bio: i18nRichTextSimple({
        bg: simpleText(
          'Завършила е дентална медицина в Пловдив и има специализация по детска дентална медицина.',
          'Обича да обяснява всяка стъпка на децата с думи, които разбират.',
        ),
        en: simpleText(
          'She studied dental medicine in Plovdiv and specialised in paediatric dentistry.',
          'She likes to explain every step to children in words they understand.',
        ),
      }),
      photo: image(images, 'team-maria', {
        bg: 'Д-р Мария Иванова в кабинета',
        en: 'Dr Maria Ivanova in the treatment room',
      }),
      featured: true,
      categories: refs([id('serviceCategory', 'children')]),
      credentials: keyed(
        [
          {
            _type: 'credential' as const,
            label: i18nString({
              bg: 'Специалност „Детска дентална медицина“',
              en: 'Specialist in paediatric dentistry',
            }),
            year: 2016,
          },
        ],
        'c',
      ),
      orderRank: rank(0),
    },
    {
      _id: id('teamMember', 'georgi'),
      _type: 'teamMember',
      name: 'Георги Петров',
      nameLatin: 'Georgi Petrov',
      honorific: i18nString({ bg: 'Д-р', en: 'Dr' }),
      role: i18nString({ bg: 'Лекар по дентална медицина', en: 'Dentist' }),
      bioShort: i18nText({
        bg: 'Д-р Петров се грижи за родителите: профилактика, лечение и естетика без бързане.',
        en: 'Dr Petrov looks after the parents: prevention, treatment and cosmetic care, never rushed.',
      }),
      photo: image(images, 'team-georgi', {
        bg: 'Д-р Георги Петров',
        en: 'Dr Georgi Petrov',
      }),
      featured: true,
      categories: refs([id('serviceCategory', 'adults')]),
      orderRank: rank(1),
    },
    {
      _id: id('teamMember', 'elena'),
      _type: 'teamMember',
      name: 'Елена Димитрова',
      nameLatin: 'Elena Dimitrova',
      role: i18nString({ bg: 'Дентален асистент', en: 'Dental assistant' }),
      bioShort: i18nText({
        bg: 'Елена посреща пациентите, подготвя кабинета и винаги има стикер за смелите.',
        en: 'Elena welcomes patients, prepares the room and always has a sticker for brave kids.',
      }),
      photo: image(images, 'team-elena', { bg: 'Елена Димитрова', en: 'Elena Dimitrova' }),
      featured: false,
      orderRank: rank(2),
    },
  ]

  const faqs: SeedDoc<FaqItem>[] = (
    [
      [
        'general',
        { bg: 'Работите ли със здравна каса?', en: 'Do you work with the health fund?' },
        {
          bg: 'Да, за прегледите и лечението, които НЗОК покрива. За всичко останало ще получите цена предварително.',
          en: 'Yes, for the check-ups and treatment the national health fund covers. For everything else you get a price up front.',
        },
      ],
      [
        'firstVisit',
        {
          bg: 'Как да подготвя детето за първия преглед?',
          en: 'How do I prepare my child for the first visit?',
        },
        {
          bg: 'Говорете спокойно и без „няма да боли“. Първото посещение е запознанство: разглеждаме, броим зъбчетата и играем.',
          en: 'Talk about it calmly and skip "it won\'t hurt". The first visit is a meet-and-greet: we look around, count teeth and play.',
        },
      ],
      [
        'children',
        { bg: 'От каква възраст приемате деца?', en: 'From what age do you see children?' },
        {
          bg: 'От появата на първото зъбче, обикновено около първата година.',
          en: 'From the first tooth, usually around the first birthday.',
        },
      ],
      [
        'adults',
        {
          bg: 'Колко често да идвам на профилактика?',
          en: 'How often should I come for a check-up?',
        },
        {
          bg: 'На всеки шест месеца, заедно с професионално почистване.',
          en: 'Every six months, together with a professional cleaning.',
        },
      ],
      [
        'prices',
        { bg: 'Мога ли да платя с карта?', en: 'Can I pay by card?' },
        {
          bg: 'Да, приемаме карти и плащане в брой.',
          en: 'Yes, we accept cards and cash.',
        },
      ],
      [
        'emergencies',
        { bg: 'Какво да правя при силна зъбобол?', en: 'What should I do about severe toothache?' },
        {
          bg: 'Обадете ни се. В работно време ще Ви приемем в същия ден.',
          en: 'Call us. During opening hours we will see you the same day.',
        },
      ],
    ] as const
  ).map(([category, question, answer], index) => ({
    _id: id('faqItem', category),
    _type: 'faqItem',
    question: i18nString(question),
    answer: i18nRichTextSimple({ bg: simpleText(answer.bg), en: simpleText(answer.en) }),
    category,
    orderRank: rank(index),
  }))

  const gallery: SeedDoc<GalleryItem>[] = (
    [
      ['clinic-reception', 'clinic', { bg: 'Рецепцията на клиниката', en: 'The clinic reception' }],
      [
        'clinic-room',
        'clinic',
        { bg: 'Светъл кабинет с модерно оборудване', en: 'A bright treatment room' },
      ],
      [
        'clinic-kids-corner',
        'clinic',
        { bg: 'Детският кът с книжки и играчки', en: 'The kids corner with books and toys' },
      ],
      ['clinic-waiting', 'clinic', { bg: 'Чакалнята', en: 'The waiting area' }],
      ['team-maria', 'team', { bg: 'Д-р Мария Иванова', en: 'Dr Maria Ivanova' }],
      ['team-georgi', 'team', { bg: 'Д-р Георги Петров', en: 'Dr Georgi Petrov' }],
    ] as const
  ).map(([name, album, alt], index) => ({
    _id: id('galleryItem', name),
    _type: 'galleryItem',
    image: image(images, name, alt),
    album,
    showsPatient: false,
    orderRank: rank(index),
  }))

  const testimonials: SeedDoc<Testimonial>[] = (
    [
      [
        'Ива, майка на Борис (5 г.)',
        {
          bg: 'Борис се страхуваше от зъболекари. След първото посещение пита кога пак ще ходим „при доктор Мария“.',
          en: 'Boris used to be scared of dentists. After the first visit he keeps asking when we can go back to "Doctor Maria".',
        },
        '2026-09-14',
      ],
      [
        'Николай П.',
        {
          bg: 'Точни часове, без чакане и ясни цени предварително. Цялото семейство вече ходи тук.',
          en: 'On time, no waiting and clear prices up front. The whole family comes here now.',
        },
        '2026-10-02',
      ],
      [
        'Мила',
        {
          bg: 'Много внимателно почистване и обяснения за всичко. Препоръчвам!',
          en: 'A really gentle cleaning, and everything was explained. Recommended!',
        },
        '2026-10-28',
      ],
    ] as const
  ).map(([authorName, quote, date], index) => ({
    _id: id('testimonial', String(index + 1)),
    _type: 'testimonial',
    quote: i18nText(quote),
    authorName,
    rating: 5,
    date,
    source: 'manual',
    consentOnFile: true,
    featured: true,
  }))

  const announcements: SeedDoc<Announcement>[] = [
    {
      _id: id('announcement', 'saturdays'),
      _type: 'announcement',
      message: i18nString({
        bg: 'Вече работим и в събота от 9:00 до 13:00.',
        en: 'We are now open on Saturdays from 9:00 to 13:00.',
      }),
      link: {
        _type: 'ctaI18n',
        label: i18nString({ bg: 'Запишете час', en: 'Book a visit' }),
        action: 'booking',
        style: 'primary',
      },
      tone: 'info',
      startsAt: '2026-01-01T00:00:00Z',
      dismissible: true,
      pages: 'all',
    },
  ]

  const services: {
    key: string
    category: string
    icon: NonNullable<Service['icon']>
    title: Localized
    teaser: Localized
    summary: Localized<string[]>
    priceNote?: Localized
    durationNote?: Localized
    body?: Localized<string[]>
    faq?: string[]
    doctors?: string[]
  }[] = [
    {
      key: 'checkup',
      category: 'children',
      icon: 'smile',
      title: { bg: 'Профилактичен преглед за деца', en: "Children's check-up" },
      teaser: {
        bg: 'Спокоен преглед, съвети за родителите и награда за смелите.',
        en: 'A calm check-up, tips for parents and a reward for brave kids.',
      },
      summary: {
        bg: [
          'Преглеждаме зъбите и венците, показваме как се мият зъбите и отговаряме на всички въпроси.',
        ],
        en: ['We check teeth and gums, show how to brush and answer every question you have.'],
      },
      durationNote: { bg: 'около 30 минути', en: 'about 30 minutes' },
      body: {
        bg: [
          '## Как протича прегледът',
          'Детето разглежда кабинета, сяда на стола и брои зъбчетата заедно с лекаря. Ако е нужно, правим снимка.',
          '## Кога да дойдете',
          '- При появата на първото зъбче',
          '- На всеки шест месеца след това',
        ],
        en: [
          '## What happens',
          'Your child explores the room, sits in the chair and counts teeth with the dentist. We take an X-ray only if needed.',
          '## When to come',
          '- When the first tooth appears',
          '- Every six months after that',
        ],
      },
      faq: [id('faqItem', 'firstVisit'), id('faqItem', 'children')],
      doctors: [id('teamMember', 'maria')],
    },
    {
      key: 'sealants',
      category: 'children',
      icon: 'shield-check',
      title: { bg: 'Силанти', en: 'Fissure sealants' },
      teaser: {
        bg: 'Защитно покритие на дъвкателните зъби, без пробиване.',
        en: 'A protective coating for the back teeth, no drilling.',
      },
      summary: {
        bg: ['Запечатваме браздите на постоянните зъби, където кариесът започва най-често.'],
        en: ['We seal the grooves of the permanent back teeth, where decay most often starts.'],
      },
    },
    {
      key: 'fillings',
      category: 'adults',
      icon: 'toothbrush',
      title: { bg: 'Лечение на кариес', en: 'Cavity treatment' },
      teaser: {
        bg: 'Фотополимерни възстановявания в цвета на зъба.',
        en: 'Tooth-coloured composite fillings.',
      },
      summary: {
        bg: [
          'Почистваме кариеса под местна упойка и възстановяваме зъба с материал в неговия цвят.',
        ],
        en: [
          'We remove the decay under local anaesthetic and restore the tooth in its natural colour.',
        ],
      },
      priceNote: { bg: 'от 60 €', en: 'from €60' },
    },
    {
      key: 'cleaning',
      category: 'adults',
      icon: 'sparkles',
      title: { bg: 'Професионално почистване', en: 'Professional cleaning' },
      teaser: {
        bg: 'Почистване на зъбен камък и полиране.',
        en: 'Scaling and polishing.',
      },
      summary: {
        bg: ['Премахваме зъбния камък и плаката с ултразвук и полираме зъбите.'],
        en: ['We remove tartar and plaque with ultrasound and polish your teeth.'],
      },
      durationNote: { bg: 'около 45 минути', en: 'about 45 minutes' },
    },
    {
      key: 'whitening',
      category: 'adults',
      icon: 'wand-sparkles',
      title: { bg: 'Избелване', en: 'Teeth whitening' },
      teaser: {
        bg: 'По-светла усмивка, безопасно и под контрол на лекар.',
        en: 'A brighter smile, safely and under a dentist’s care.',
      },
      summary: {
        bg: ['Домашно избелване с индивидуални шини или процедура в кабинета.'],
        en: ['At-home whitening with custom trays, or a treatment in the clinic.'],
      },
    },
  ]

  const serviceDocs = services.flatMap((service, index) =>
    routable<Service>('service', service.key, (locale) => ({
      title: service.title[locale],
      slug: slugOf(slugify(service.title[locale])),
      category: ref(id('serviceCategory', service.category)),
      icon: service.icon,
      teaser: service.teaser[locale],
      summary: simpleText(...service.summary[locale]),
      ...(service.durationNote ? { durationNote: service.durationNote[locale] } : {}),
      ...(service.priceNote ? { priceNote: service.priceNote[locale] } : {}),
      hasDetailPage: Boolean(service.body),
      ...(service.body ? { body: richText(...service.body[locale]) } : {}),
      ...(service.faq ? { faq: refs(service.faq) } : {}),
      ...(service.doctors ? { doctors: refs(service.doctors) } : {}),
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
          bg: 'Детски стол в кабинета на клиниката',
          en: "A child's chair in the treatment room",
        }),
        body: richText(
          ...{
            bg: [
              'Препоръката е първият преглед да е до първия рожден ден на детето или до шест месеца след първото зъбче.',
              '## Защо толкова рано',
              'Ранният преглед хваща проблемите, докато са малки, и учи детето, че кабинетът е безопасно място.',
              '## Как да подготвите детето',
              '- Играйте на зъболекар у дома',
              '- Четете книжка за зъбите',
              '- Не обещавайте, че „няма да боли“',
            ],
            en: [
              'The advice is to book the first check-up by the first birthday, or within six months of the first tooth.',
              '## Why so early',
              'An early visit catches problems while they are small and teaches your child that the clinic is a safe place.',
              '## How to prepare your child',
              '- Play dentist at home',
              '- Read a picture book about teeth',
              '- Don\'t promise that "it won\'t hurt"',
            ],
          }[locale],
        ),
        author: ref(id('teamMember', 'maria')),
        reviewedBy: ref(id('teamMember', 'maria')),
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
          bg: 'Детска четка за зъби и паста',
          en: "A child's toothbrush and toothpaste",
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
        author: ref(id('teamMember', 'maria')),
        publishedAt: '2026-11-02T08:00:00Z',
      }
    }),
  ]

  const bookCta = (locale: Locale) =>
    cta({ bg: 'Запишете час', en: 'Book a visit' }[locale], 'booking')
  const callCta = (locale: Locale) =>
    cta({ bg: 'Обадете се', en: 'Call us' }[locale], 'call', { style: 'secondary' })

  const pages = [
    ...routable<Page>('page', 'home', (locale) => ({
      pageKey: 'home',
      title: { bg: 'Начало', en: 'Home' }[locale],
      intro: {
        bg: 'Детска и семейна дентална клиника в Русе.',
        en: 'A children’s and family dental clinic in Ruse.',
      }[locale],
      sections: keyed(
        [
          section('section.hero', {
            heading: {
              bg: 'Усмивки без страх, от първото зъбче',
              en: 'Fear-free smiles, from the very first tooth',
            }[locale],
            subheading: {
              bg: 'Детска и семейна дентална клиника, в която децата влизат с любопитство, а родителите излизат спокойни.',
              en: 'A children’s and family dental clinic where kids walk in curious and parents leave relaxed.',
            }[locale],
            ctas: keyed([
              bookCta(locale),
              cta({ bg: 'Нашите услуги', en: 'Our services' }[locale], 'link', {
                link: systemLink('services'),
                style: 'secondary',
              }),
            ]),
            image: image(images, 'hero-family', {
              bg: 'Майка и дете се усмихват в кабинета',
              en: 'A mother and child smiling in the treatment room',
            }),
            variant: 'cutout',
            tone: 'soft',
            trustItems: keyed(
              [
                {
                  _type: 'trustItem' as const,
                  icon: 'baby' as const,
                  text: { bg: 'Деца от 1 година', en: 'Children from age 1' }[locale],
                },
                {
                  _type: 'trustItem' as const,
                  icon: 'award' as const,
                  text: { bg: '12 години опит', en: '12 years of experience' }[locale],
                },
                {
                  _type: 'trustItem' as const,
                  icon: 'shield-check' as const,
                  text: { bg: 'Работим с НЗОК', en: 'Health fund partner' }[locale],
                },
              ],
              't',
            ),
          }),
          section('section.tiles', {
            heading: { bg: 'Услуги', en: 'Services' }[locale],
            intro: {
              bg: 'Всичко за здравите зъби на цялото семейство.',
              en: 'Everything the whole family needs for healthy teeth.',
            }[locale],
            source: 'services',
            allowMultiple: false,
            density: 'comfortable',
            tone: 'base',
          }),
          section('section.processSteps', {
            heading: { bg: 'Първото посещение', en: 'Your first visit' }[locale],
            steps: keyed(
              [
                {
                  _type: 'processStep' as const,
                  icon: 'phone' as const,
                  title: { bg: 'Обаждате се', en: 'You call us' }[locale],
                  text: {
                    bg: 'Избираме удобен час, без чакане.',
                    en: 'We pick a time that suits you, no waiting.',
                  }[locale],
                },
                {
                  _type: 'processStep' as const,
                  icon: 'smile' as const,
                  title: { bg: 'Запознаваме се', en: 'We get to know each other' }[locale],
                  text: {
                    bg: 'Детето разглежда кабинета и играе.',
                    en: 'Your child explores the room and plays.',
                  }[locale],
                },
                {
                  _type: 'processStep' as const,
                  icon: 'clipboard-list' as const,
                  title: { bg: 'Ясен план', en: 'A clear plan' }[locale],
                  text: {
                    bg: 'Получавате план и цени предварително.',
                    en: 'You get a plan and prices up front.',
                  }[locale],
                },
              ],
              'p',
            ),
            cta: bookCta(locale),
            tone: 'soft',
          }),
          section('section.team', {
            heading: { bg: 'Екипът', en: 'The team' }[locale],
            layout: 'featuredFirst',
          }),
          section('section.testimonials', {
            heading: { bg: 'Какво казват родителите', en: 'What parents say' }[locale],
            showRating: true,
            tone: 'soft',
          }),
          section('section.faq', {
            heading: { bg: 'Често задавани въпроси', en: 'Frequently asked questions' }[locale],
            source: 'all',
            emitSchema: true,
            tone: 'accent',
          }),
          section('section.blogTeaser', {
            heading: { bg: 'От блога', en: 'From the blog' }[locale],
            mode: 'latest',
            count: 3,
          }),
          section('section.ctaBand', {
            heading: { bg: 'Време е за преглед?', en: 'Time for a check-up?' }[locale],
            text: {
              bg: 'Запишете час онлайн или ни се обадете.',
              en: 'Book online or give us a call.',
            }[locale],
            ctas: keyed([bookCta(locale), callCta(locale)]),
            tone: 'brand',
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'services', (locale) => ({
      pageKey: 'services',
      title: { bg: 'Услуги', en: 'Services' }[locale],
      intro: {
        bg: 'Профилактика, лечение и естетика за деца и възрастни.',
        en: 'Prevention, treatment and cosmetic care for children and adults.',
      }[locale],
      sections: keyed(
        [
          section('section.tiles', {
            heading: { bg: 'Всички услуги', en: 'All services' }[locale],
            source: 'services',
            allowMultiple: true,
            density: 'comfortable',
          }),
          section('section.faq', {
            heading: { bg: 'Въпроси за цените', en: 'Questions about prices' }[locale],
            source: 'category',
            category: 'prices',
            emitSchema: true,
          }),
          section('section.ctaBand', {
            heading: { bg: 'Не намирате каквото търсите?', en: "Can't find what you need?" }[
              locale
            ],
            ctas: keyed([callCta(locale)]),
            tone: 'soft',
          }),
        ],
        's',
      ),
    })),
    ...routable<Page>('page', 'about', (locale) => ({
      pageKey: 'about',
      title: { bg: 'За нас', en: 'About us' }[locale],
      intro: {
        bg: 'Екипът, историята и ценностите зад Демо Дентал.',
        en: 'The team, the story and the values behind Demo Dental.',
      }[locale],
      sections: keyed(
        [
          section('section.textImage', {
            heading: { bg: 'Клиника, създадена за деца', en: 'A clinic designed for children' }[
              locale
            ],
            body: richText(
              {
                bg: 'Отворихме Демо Дентал, за да има място, където първото посещение при зъболекар е приятен спомен.',
                en: 'We opened Demo Dental so that a first dental visit can be a happy memory.',
              }[locale],
              {
                bg: 'Кабинетите са светли, имаме детски кът и никога не бързаме.',
                en: 'The rooms are bright, there is a kids corner, and we never rush.',
              }[locale],
            ),
            image: image(images, 'clinic-kids-corner', {
              bg: 'Детският кът в клиниката',
              en: 'The kids corner at the clinic',
            }),
            imagePosition: 'right',
          }),
          section('section.richTextBlock', {
            heading: { bg: 'В какво вярваме', en: 'What we believe' }[locale],
            body: richText(
              ...{
                bg: [
                  '- Без страх и без бързане',
                  '- Ясни цени предварително',
                  '- Профилактиката е най-доброто лечение',
                ],
                en: [
                  '- No fear and no rush',
                  '- Clear prices up front',
                  '- Prevention is the best treatment',
                ],
              }[locale],
            ),
            width: 'prose',
          }),
          section('section.team', {
            heading: { bg: 'Запознайте се с нас', en: 'Meet us' }[locale],
            layout: 'grid',
          }),
          section('section.gallery', {
            heading: { bg: 'Клиниката', en: 'The clinic' }[locale],
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
        bg: 'Разгледайте клиниката отвътре: чакалнята, кабинетите и детския кът.',
        en: 'Take a look inside the clinic: the waiting room, treatment rooms and kids’ corner.',
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
        bg: 'Съвети за здрави детски зъби от нашия екип.',
        en: 'Tips for healthy children’s teeth from our team.',
      }[locale],
      sections: [],
    })),
    ...routable<Page>('page', 'contact', (locale) => ({
      pageKey: 'contact',
      title: { bg: 'Контакти', en: 'Contact' }[locale],
      intro: {
        bg: 'Адрес, работно време и как да се свържете с нас.',
        en: 'Address, opening hours and how to reach us.',
      }[locale],
      sections: keyed(
        [
          section('section.contactHours', {
            heading: { bg: 'Как да ни намерите', en: 'How to find us' }[locale],
            showMap: true,
            showForm: true,
            note: { bg: 'Безплатно паркиране в двора.', en: 'Free parking in the courtyard.' }[
              locale
            ],
          }),
          section('section.faq', {
            heading: { bg: 'Спешни случаи', en: 'Emergencies' }[locale],
            source: 'category',
            category: 'emergencies',
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
          en: 'Everything parents need to know before their child’s first check-up.',
        }[locale],
        sections: keyed(
          [
            section('section.textImage', {
              heading: { bg: 'Първото посещение е игра', en: 'The first visit is play' }[locale],
              body: richText(
                {
                  bg: 'Не лекуваме на първото посещение, освен ако не е спешно. Целта е детето да се почувства спокойно.',
                  en: 'We do not treat on the first visit unless it is urgent. The goal is for your child to feel at ease.',
                }[locale],
              ),
              image: image(images, 'clinic-room', {
                bg: 'Светъл кабинет с детски стол',
                en: "A bright room with a child's chair",
              }),
              imagePosition: 'left',
              cta: bookCta(locale),
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
                        bg: 'Така детето вижда чакалнята и детския кът преди прегледа.',
                        en: 'That way your child sees the waiting area and kids corner before the check-up.',
                      }[locale],
                    ),
                  },
                ],
                'i',
              ),
              allowMultiple: false,
              density: 'compact',
            }),
            section('section.faq', {
              heading: { bg: 'Въпроси на родителите', en: 'Questions from parents' }[locale],
              source: 'selected',
              items: refs([id('faqItem', 'firstVisit'), id('faqItem', 'children')]),
              emitSchema: true,
            }),
            section('section.ctaBand', {
              heading: { bg: 'Готови ли сте?', en: 'Ready?' }[locale],
              ctas: keyed([bookCta(locale)]),
              tone: 'accent',
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
    brandName: i18nString({ bg: 'Демо Дентал', en: 'Demo Dental' }),
    tagline: i18nString({
      bg: 'Детска и семейна дентална клиника',
      en: 'Children’s and family dental clinic',
    }),
    businessType: 'Dentist',
    areaServed: i18nString({ bg: 'Русе и областта', en: 'Ruse and the region' }),
    priceRange: '€€',
    address: {
      _type: 'address',
      street: i18nString({ bg: 'ул. „Демо“ 1', en: '1 Demo St' }),
      city: i18nString({ bg: 'Русе', en: 'Ruse' }),
      postalCode: '7000',
      countryCode: 'BG',
    },
    geo: { _type: 'geo', lat: 43.8486, lng: 25.9542 },
    phones: keyed(
      [
        {
          _type: 'phone' as const,
          key: 'primary' as const,
          e164: '+35982000000',
          display: '082 000 000',
          label: i18nString({ bg: 'Рецепция', en: 'Reception' }),
        },
      ],
      'ph',
    ),
    email: 'hello@example.com',
    mapPlaceholder: image(images, 'map-placeholder', {
      bg: 'Карта с местоположението на клиниката',
      en: 'Map showing the clinic location',
    }),
    openingHours: keyed(
      [
        {
          _type: 'openingHoursSpec' as const,
          days: ['Mo', 'Tu', 'We', 'Th', 'Fr'],
          opens: '09:00',
          closes: '19:00',
        },
        { _type: 'openingHoursSpec' as const, days: ['Sa'], opens: '09:00', closes: '13:00' },
      ],
      'h',
    ),
    specialHours: keyed(
      [
        {
          _type: 'specialHours' as const,
          label: i18nString({ bg: 'Коледа', en: 'Christmas' }),
          date: '2026-12-24',
          endDate: '2026-12-26',
          closed: true,
        },
      ],
      'sh',
    ),
    timeZone: 'Europe/Sofia',
    socials: keyed(
      [
        {
          _type: 'socialLink' as const,
          platform: 'facebook' as const,
          url: 'https://www.facebook.com/example',
        },
      ],
      'so',
    ),
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
      representative: 'Мария Иванова',
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
    footerNote: i18nText({
      bg: 'Демо съдържание. Заменете преди пускане.',
      en: 'Demo content. Replace before launch.',
    }),
    seoDefaults: {
      titleTemplate: i18nString({ bg: '%s · Демо Дентал', en: '%s · Demo Dental' }),
      description: i18nText({
        bg: 'Детска и семейна дентална клиника в Русе: прегледи без страх, профилактика и лечение за деца и възрастни.',
        en: 'A children’s and family dental clinic in Ruse: fear-free check-ups, prevention and treatment for kids and adults.',
      }),
      ogImage: image(images, 'og-default', {
        bg: 'Демо Дентал, детска дентална клиника',
        en: 'Demo Dental, children’s dental clinic',
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
    ...announcements,
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
        item({ bg: 'Галерия', en: 'Gallery' }, 'gallery'),
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
          title: navLabel({ bg: 'Клиника', en: 'Clinic' }),
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
    mobileActionBar: { showDirections: true, secondaryAction: 'booking' },
  }
}
