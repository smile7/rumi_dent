import type { Page, SiteSettings } from '../../sanity.types'
import type { Locale } from '../../src/config/i18n'
import { demoDocuments, legalPages, navigationDoc, section } from './demo'
import { keyed, ref, routable, routableId, type SeedDoc, type SeedImages } from './helpers'
import { legalTemplates, type LegalKind } from './legal'

export type SeedMode = 'demo' | 'client'

type SystemPageKey = NonNullable<Page['pageKey']>

const systemPageTitles: Record<SystemPageKey, Record<Locale, string>> = {
  home: { bg: 'Начало', en: 'Home' },
  services: { bg: 'Услуги', en: 'Services' },
  about: { bg: 'За нас', en: 'About us' },
  gallery: { bg: 'Галерия', en: 'Gallery' },
  blog: { bg: 'Блог', en: 'Blog' },
  contact: { bg: 'Контакти', en: 'Contact' },
}

/** The standard sections of each system page, left empty for the editor to fill in. */
const standardSections: Record<SystemPageKey, NonNullable<Page['sections']>> = {
  home: keyed(
    [
      section('section.hero', { variant: 'split' }),
      section('section.tiles', { source: 'services' }),
      section('section.ctaBand', {}),
    ],
    's',
  ),
  services: keyed([section('section.tiles', { source: 'services', allowMultiple: true })], 's'),
  about: keyed([section('section.textImage', {}), section('section.team', {})], 's'),
  gallery: keyed([section('section.gallery', { limit: 24 })], 's'),
  blog: [],
  contact: keyed([section('section.contactHours', { showMap: true, showForm: true })], 's'),
}

/** A real client's starting structure: system pages, legal templates, empty settings. */
function clientDocuments() {
  const pages = (Object.keys(systemPageTitles) as SystemPageKey[]).flatMap((pageKey) =>
    routable<Page>('page', pageKey, (locale) => ({
      pageKey,
      title: systemPageTitles[pageKey][locale],
      sections: standardSections[pageKey],
    })),
  )
  const settings: SeedDoc<SiteSettings> = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    timeZone: 'Europe/Sofia',
    legalLinks: keyed(
      (Object.keys(legalTemplates) as LegalKind[]).map((kind) =>
        ref(routableId('legalPage', kind, 'bg'), { weak: true }),
      ),
      'l',
    ),
  }
  return [settings, navigationDoc(), ...pages, ...legalPages()]
}

const isMetadata = (doc: { _type: string }) => doc._type === 'translation.metadata'

/**
 * Every document the seed writes. Demo content is published; a client's structure is created as
 * drafts (legal templates can't be published until their placeholders are replaced). Translation
 * metadata is always published, as the plugin does.
 */
export function buildSeed(mode: SeedMode, images: SeedImages) {
  if (mode === 'demo') return demoDocuments(images)
  return clientDocuments().map((doc) =>
    isMetadata(doc) ? doc : { ...doc, _id: `drafts.${doc._id}` },
  )
}

export type SeedDocument = ReturnType<typeof buildSeed>[number]
