/** Pure helpers for `scripts/launch-check.ts`: no network, unit-tested. */

export type Status = 'pass' | 'fail' | 'warn' | 'skip'
export type CheckResult = { name: string; status: Status; detail?: string }

export type PageHead = {
  canonical?: string
  /** `hreflang` → absolute URL. */
  alternates: Record<string, string>
  robots?: string
  ogImage?: string
  jsonLd: string[]
}

const TAG = /<(link|meta)\b[^>]*>/gi
const ATTRIBUTE = /([\w:-]+)\s*=\s*"([^"]*)"/g
const JSON_LD = /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
const SCRIPT_OR_STYLE = /<(script|style)\b[\s\S]*?<\/\1>/gi
const PLACEHOLDER = /\[\[[^\]\n]{1,80}\]\]/g

export function decodeEntities(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [, name, value] of tag.matchAll(ATTRIBUTE)) {
    if (name && value !== undefined) out[name.toLowerCase()] = decodeEntities(value)
  }
  return out
}

export function parseHead(html: string): PageHead {
  const head: PageHead = { alternates: {}, jsonLd: [] }
  for (const [tag, kind] of html.matchAll(TAG)) {
    const attrs = attributes(tag)
    if (kind?.toLowerCase() === 'link') {
      if (attrs.rel === 'canonical') head.canonical = attrs.href
      if (attrs.rel === 'alternate' && attrs.hreflang && attrs.href) {
        head.alternates[attrs.hreflang] = attrs.href
      }
    } else if (attrs.name === 'robots') {
      head.robots = attrs.content
    } else if (attrs.property === 'og:image' && !head.ogImage) {
      head.ogImage = attrs.content
    }
  }
  for (const [, body] of html.matchAll(JSON_LD)) head.jsonLd.push(body ?? '')
  return head
}

/** `[[placeholders]]` in the visible text (scripts and styles removed: RSC payloads contain `[[`). */
export function findPlaceholders(html: string): string[] {
  return [...new Set(html.replace(SCRIPT_OR_STYLE, '').match(PLACEHOLDER) ?? [])]
}

export function parseSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) =>
    decodeEntities(url ?? '').trim(),
  )
}

export type RobotsSummary = { disallowsAll: boolean; sitemaps: string[] }

/** Only the `User-agent: *` group matters for "may search engines index the site". */
export function parseRobots(text: string): RobotsSummary {
  let inStarGroup = false
  let lastWasAgent = false
  let disallowsAll = false
  const sitemaps: string[] = []
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*/, '').trim()
    const [key = '', ...rest] = line.split(':')
    const field = key.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (field === 'user-agent') {
      inStarGroup = (lastWasAgent && inStarGroup) || value === '*'
      lastWasAgent = true
      continue
    }
    if (field) lastWasAgent = false
    if (field === 'sitemap') sitemaps.push(value)
    if (field === 'disallow' && inStarGroup && value === '/') disallowsAll = true
  }
  return { disallowsAll, sitemaps }
}

/** Every alternate that points to another checked page must point back. */
export function hreflangProblems(pages: Map<string, PageHead>): string[] {
  const problems: string[] = []
  for (const [url, head] of pages) {
    for (const [lang, target] of Object.entries(head.alternates)) {
      if (lang === 'x-default' || target === url) continue
      const other = pages.get(target)
      if (!other) {
        problems.push(`${url} → ${lang} ${target} is not in the sitemap`)
      } else if (!Object.values(other.alternates).includes(url)) {
        problems.push(`${target} doesn't link back to ${url}`)
      }
    }
  }
  return problems
}

export function jsonLdProblems(head: PageHead): string[] {
  return head.jsonLd.flatMap((body, index) => {
    try {
      JSON.parse(body)
      return []
    } catch (error) {
      return [`block ${index + 1}: ${error instanceof Error ? error.message : String(error)}`]
    }
  })
}

export const REQUIRED_HEADERS = [
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
] as const

export function missingSecurityHeaders(headers: Headers): string[] {
  const missing: string[] = REQUIRED_HEADERS.filter((name) => !headers.has(name))
  if (
    !headers.has('content-security-policy') &&
    !headers.has('content-security-policy-report-only')
  ) {
    missing.push('content-security-policy(-report-only)')
  }
  return missing
}

/** TXT answers from a DNS-over-HTTPS JSON response, with the quoting removed. */
export function txtRecords(response: unknown): string[] {
  const answers = (response as { Answer?: { type?: number; data?: string }[] } | null)?.Answer ?? []
  return answers
    .filter((answer) => answer.type === 16 && typeof answer.data === 'string')
    .map((answer) => (answer.data ?? '').replace(/"\s*"/g, '').replace(/^"|"$/g, ''))
}

export function formatTable(results: CheckResult[]): string {
  const icon: Record<Status, string> = { pass: 'PASS', fail: 'FAIL', warn: 'WARN', skip: 'SKIP' }
  const width = Math.max(...results.map((result) => result.name.length), 10)
  return results
    .map(
      (result) =>
        `${icon[result.status]}  ${result.name.padEnd(width)}${result.detail ? `  ${result.detail}` : ''}`,
    )
    .join('\n')
}
