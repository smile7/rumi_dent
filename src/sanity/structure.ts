import { AddIcon } from '@sanity/icons/Add'
import { BellIcon } from '@sanity/icons/Bell'
import { CaseIcon } from '@sanity/icons/Case'
import { CogIcon } from '@sanity/icons/Cog'
import { ComposeIcon } from '@sanity/icons/Compose'
import { DocumentIcon } from '@sanity/icons/Document'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { ImagesIcon } from '@sanity/icons/Images'
import { TranslateIcon } from '@sanity/icons/Translate'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { ComponentType } from 'react'
import type {
  ListBuilder,
  StructureBuilder,
  StructureResolver,
  StructureResolverContext,
} from 'sanity/structure'

import { apiVersion } from './env'
import { routableTypes, type RoutableType, studioLanguages } from './i18n'
import { faqCategories } from './schemaTypes/collections/faqItem'
import { galleryAlbums } from './schemaTypes/collections/galleryItem'

type Builder = { S: StructureBuilder; context: StructureResolverContext }

/** One list per language. New documents come from that language's template (`page-bg`, …). */
const languageLists = (
  { S }: Builder,
  type: RoutableType,
  title: string,
  icon: ComponentType,
  defaultOrdering?: { field: string; direction: 'asc' | 'desc' },
) =>
  studioLanguages.map((language) =>
    S.listItem()
      .id(`${type}-${language.id}`)
      .title(`${title} · ${language.title}`)
      .icon(icon)
      .child(
        S.documentTypeList(type)
          .id(`${type}-${language.id}`)
          .title(`${title} · ${language.title}`)
          .filter('_type == $type && language == $language')
          .params({ type, language: language.id })
          .initialValueTemplates([S.initialValueTemplateItem(`${type}-${language.id}`)])
          .defaultOrdering(defaultOrdering ? [defaultOrdering] : []),
      ),
  )

/** Drag-and-drop lists of one routable type, one per language. */
const orderableLanguageLists = (
  { S, context }: Builder,
  type: RoutableType,
  title: string,
  icon: ComponentType,
) =>
  studioLanguages.map((language) =>
    orderableDocumentListDeskItem({
      S,
      context,
      type,
      icon,
      id: `orderable-${type}-${language.id}`,
      title: `${title} · ${language.title}`,
      filter: 'language == $language',
      params: { language: language.id },
      createIntent: false,
      menuItems: [
        S.menuItem()
          .title(`New (${language.title})`)
          .icon(AddIcon)
          .intent({ type: 'create', params: { type, template: `${type}-${language.id}` } })
          .showAsAction(true)
          .serialize(),
      ],
    }),
  )

/** Drag-and-drop list of a shared type, plus one list per value of `field`. */
const orderableWithFilters = (
  { S, context }: Builder,
  type: string,
  title: string,
  icon: ComponentType,
  field: string,
  options: readonly { title: string; value: string }[],
) =>
  S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .id(`${type}-lists`)
        .title(title)
        .items([
          orderableDocumentListDeskItem({
            S,
            context,
            type,
            icon,
            id: `orderable-${type}`,
            title: 'All',
          }),
          S.divider(),
          ...options.map((option) =>
            orderableDocumentListDeskItem({
              S,
              context,
              type,
              icon,
              id: `orderable-${type}-${option.value}`,
              title: option.title,
              filter: `${field} == $value`,
              params: { value: option.value },
            }),
          ),
        ]),
    )

const groupItem = (
  S: StructureBuilder,
  id: string,
  title: string,
  icon: ComponentType,
  items: Parameters<ListBuilder['items']>[0],
) => S.listItem().id(id).title(title).icon(icon).child(S.list().id(id).title(title).items(items))

/** Documents with no translation linked in `language` yet (drafts included). */
const missingTranslations = (S: StructureBuilder) =>
  S.listItem()
    .id('missing-translations')
    .title('Missing translations')
    .icon(TranslateIcon)
    .child(
      S.list()
        .id('missing-translations')
        .title('Missing translations')
        .items(
          studioLanguages.map((language) =>
            S.listItem()
              .id(`missing-${language.id}`)
              .title(`Not yet in ${language.title}`)
              .icon(TranslateIcon)
              .child(
                S.documentList()
                  .id(`missing-${language.id}`)
                  .title(`Not yet in ${language.title}`)
                  .apiVersion(apiVersion)
                  .filter(
                    `_type in $types && defined(language) && language != $language && !($language in coalesce(*[_type == "translation.metadata" && references(string::split(^._id, "drafts.")[-1])][0].translations[].language, []))`,
                  )
                  .params({ types: [...routableTypes], language: language.id }),
              ),
          ),
        ),
    )

const announcementFilters = {
  active: 'startsAt <= now() && (!defined(endsAt) || endsAt > now())',
  scheduled: 'startsAt > now()',
  past: 'defined(endsAt) && endsAt <= now()',
}

const announcements = (S: StructureBuilder) =>
  groupItem(
    S,
    'announcements',
    'Announcements',
    BellIcon,
    (
      [
        ['active', 'Active now'],
        ['scheduled', 'Scheduled'],
        ['past', 'Ended'],
      ] as const
    ).map(([key, title]) =>
      S.listItem()
        .id(`announcements-${key}`)
        .title(title)
        .icon(BellIcon)
        .child(
          S.documentTypeList('announcement')
            .id(`announcements-${key}`)
            .title(title)
            .filter(`_type == "announcement" && ${announcementFilters[key]}`)
            .defaultOrdering([{ field: 'startsAt', direction: 'desc' }]),
        ),
    ),
  )

/** CONTENT-MODEL §7. Every document is at most two clicks away. */
export const structure: StructureResolver = (S, context) => {
  const builder = { S, context }
  return S.list()
    .id('content')
    .title('Content')
    .items([
      groupItem(S, 'settings', 'Settings', CogIcon, [
        S.listItem().singleton('siteSettings').title('Site settings'),
        S.listItem().singleton('navigation').title('Navigation'),
      ]),
      S.divider(),
      groupItem(
        S,
        'pages',
        'Pages',
        DocumentIcon,
        languageLists(builder, 'page', 'Pages', DocumentIcon),
      ),
      groupItem(S, 'services', 'Services', CaseIcon, [
        orderableDocumentListDeskItem({
          S,
          context,
          type: 'serviceCategory',
          id: 'orderable-serviceCategory',
          title: 'Categories',
        }),
        S.divider(),
        ...orderableLanguageLists(builder, 'service', 'Services', CaseIcon),
      ]),
      orderableDocumentListDeskItem({
        S,
        context,
        type: 'teamMember',
        id: 'orderable-teamMember',
        title: 'Team',
      }),
      orderableWithFilters(builder, 'faqItem', 'FAQ', HelpCircleIcon, 'category', faqCategories),
      orderableWithFilters(builder, 'galleryItem', 'Gallery', ImagesIcon, 'album', galleryAlbums),
      groupItem(
        S,
        'blog',
        'Blog',
        ComposeIcon,
        languageLists(builder, 'article', 'Articles', ComposeIcon, {
          field: 'publishedAt',
          direction: 'desc',
        }),
      ),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      announcements(S),
      groupItem(
        S,
        'legal',
        'Legal',
        DocumentTextIcon,
        languageLists(builder, 'legalPage', 'Legal pages', DocumentTextIcon),
      ),
      S.divider(),
      missingTranslations(S),
    ])
}
