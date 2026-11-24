import { localeMeta, locales, type Locale } from '@/config/i18n'
import type { SiteSettings } from '@/lib/content/types'
import { formatTimeRange, formatWeekdayRange } from '@/lib/i18n/format'

export type LlmsLink = { title: string; url: string; description?: string }

export type LlmsSection = {
  locale: Locale
  services: LlmsLink[]
  team: { name: string; role: string; specialties: string[] }[]
  pages: LlmsLink[]
  articles: LlmsLink[]
}

export type LlmsInput = {
  /** Default-locale settings: name, tagline, description, NAP and hours. */
  settings: SiteSettings
  /** Default locale first; every other locale goes under its own `## {language}` heading. */
  sections: LlmsSection[]
}

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim()

const link = ({ title, url, description }: LlmsLink) =>
  `- [${oneLine(title)}](${url})${description ? `: ${oneLine(description)}` : ''}`

function facts(settings: SiteSettings, locale: Locale): string {
  const { address } = settings
  const street = [address.street, [address.postalCode, address.city].filter(Boolean).join(' ')]
  const phone = settings.phones.find((p) => p.key === 'primary') ?? settings.phones[0]
  const hours = settings.openingHours
    .map(
      (row) => `${formatWeekdayRange(locale, row.days)} ${formatTimeRange(row.opens, row.closes)}`,
    )
    .join('; ')
  return [
    `Address: ${street.filter(Boolean).join(', ')}`,
    phone ? `Phone: ${phone.e164}` : null,
    settings.email ? `Email: ${settings.email}` : null,
    hours ? `Hours: ${hours}` : null,
    `Languages: ${locales.map((l) => localeMeta[l].label).join(', ')}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

function sectionLines(section: LlmsSection, level: '##' | '###'): string[] {
  const block = (heading: string, lines: string[]) =>
    lines.length > 0 ? [`${level} ${heading}`, ...lines] : []
  return [
    ...block('Services', section.services.map(link)),
    ...block(
      'Team',
      section.team.map(
        (member) =>
          `- ${[member.name, member.role, member.specialties.join(', ')].filter(Boolean).join(', ')}`,
      ),
    ),
    ...block('Key pages', section.pages.map(link)),
    ...block('Articles', section.articles.map(link)),
  ]
}

/** `llms.txt` per SEO.md §4 (llmstxt.org convention). */
export function buildLlmsTxt({ settings, sections }: LlmsInput): string {
  const [first, ...rest] = sections
  const summary = [settings.tagline, settings.seoDefaults.description].filter(Boolean).join('. ')
  const lines = [
    `# ${oneLine(settings.brandName)}`,
    ...(summary ? [`> ${oneLine(summary)}`] : []),
    '',
    facts(settings, first?.locale ?? locales[0]),
    '',
    ...(first ? sectionLines(first, '##') : []),
    ...rest.flatMap((section) => [
      '',
      `## ${localeMeta[section.locale].label}`,
      ...sectionLines(section, '###'),
    ]),
  ]
  return `${lines.join('\n')}\n`
}
