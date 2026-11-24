/**
 * Launch QA against a running site (NEW-CLIENT §9). Prints a pass/fail table and exits 1 on any
 * failure, then lists the checks that stay manual.
 *
 *   pnpm launch-check --url https://www.client.bg
 *   pnpm launch-check --url https://www.client.bg --mail-domain mail.client.bg
 *   pnpm launch-check --url http://localhost:3000      (a production-like `next build && next start`)
 *
 * Sitemap URLs carry `NEXT_PUBLIC_SITE_URL`; they are fetched through `--url`, so a local server
 * built with another site URL still works (the origin check is then a warning, not a failure).
 * DNS checks are skipped for localhost.
 */
import { parseArgs } from 'node:util'

import { defaultLocale } from '../src/config/i18n'
import {
  type CheckResult,
  findPlaceholders,
  formatTable,
  hreflangProblems,
  jsonLdProblems,
  missingSecurityHeaders,
  type PageHead,
  parseHead,
  parseRobots,
  parseSitemap,
  txtRecords,
} from './launch-check/parse'

const { values } = parseArgs({
  options: {
    url: { type: 'string' },
    'mail-domain': { type: 'string' },
  },
})

if (!values.url) {
  console.error('Usage: pnpm launch-check --url https://<domain> [--mail-domain mail.<domain>]')
  process.exit(2)
}

const base = new URL(values.url)
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)
const results: CheckResult[] = []
const problems: string[] = []

function record(name: string, found: string[], { warnOnly = false } = {}) {
  results.push({
    name,
    status: found.length ? (warnOnly ? 'warn' : 'fail') : 'pass',
    detail: found.length ? `${found.length} problem(s)` : undefined,
  })
  problems.push(...found.slice(0, 10).map((problem) => `${name}: ${problem}`))
  if (found.length > 10) problems.push(`${name}: … and ${found.length - 10} more`)
}

async function get(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000), ...init })
}

/** Fetches a site URL through `--url`, keeping its path. */
function viaBase(url: string): string {
  const target = new URL(url)
  return new URL(target.pathname + target.search, base).toString()
}

async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
  const out: R[] = []
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++
        out[index] = await task(items[index] as T)
      }
    }),
  )
  return out
}

// robots.txt
const robotsResponse = await get(new URL('/robots.txt', base).toString())
const robots = parseRobots(robotsResponse.ok ? await robotsResponse.text() : '')
record('robots.txt reachable', robotsResponse.ok ? [] : [`status ${robotsResponse.status}`])
record('robots allows indexing', robots.disallowsAll ? ['User-agent: * has Disallow: /'] : [])
record(
  'NEXT_PUBLIC_ENV=production',
  robots.disallowsAll ? ['robots.txt blocks everything, so this is not a production build'] : [],
)
record(
  'robots points to the sitemap',
  robots.sitemaps.some((url) => url.endsWith('/sitemap.xml')) ? [] : ['no Sitemap: line'],
)

// sitemap
const sitemapResponse = await get(new URL('/sitemap.xml', base).toString())
const urls = sitemapResponse.ok ? parseSitemap(await sitemapResponse.text()) : []
record('sitemap.xml lists pages', urls.length ? [] : [`status ${sitemapResponse.status}, 0 URLs`])
const siteOrigin = urls[0] ? new URL(urls[0]).origin : base.origin
record(
  'sitemap origin = --url',
  siteOrigin === base.origin ? [] : [`sitemap uses ${siteOrigin}, checked via ${base.origin}`],
  { warnOnly: isLocal },
)

// every page
const heads = new Map<string, PageHead>()
const statusProblems: string[] = []
const canonicalProblems: string[] = []
const noindexProblems: string[] = []
const jsonProblems: string[] = []
const placeholderProblems: string[] = []
const ogImages = new Set<string>()
const ogMissing: string[] = []
let homeHeaders: Headers | undefined

await mapLimit(urls, 6, async (url) => {
  const response = await get(viaBase(url))
  if (response.status !== 200) {
    statusProblems.push(`${url}: ${response.status}`)
    return
  }
  const html = await response.text()
  const head = parseHead(html)
  heads.set(url, head)
  if (new URL(url).pathname === `/${defaultLocale}`) homeHeaders = response.headers
  if (head.canonical !== url) canonicalProblems.push(`${url}: canonical ${head.canonical ?? '—'}`)
  const xRobots = response.headers.get('x-robots-tag') ?? ''
  if (/noindex/i.test(`${head.robots ?? ''} ${xRobots}`)) noindexProblems.push(url)
  jsonProblems.push(...jsonLdProblems(head).map((problem) => `${url}: ${problem}`))
  if (!head.jsonLd.length) jsonProblems.push(`${url}: no JSON-LD`)
  placeholderProblems.push(...findPlaceholders(html).map((found) => `${url}: ${found}`))
  if (head.ogImage) ogImages.add(head.ogImage)
  else ogMissing.push(`${url}: no og:image`)
})

record(`pages return 200 (${urls.length})`, statusProblems)
record('canonical = self', canonicalProblems)
record('no noindex', noindexProblems)
record('hreflang pairs reciprocal', hreflangProblems(heads))
record('JSON-LD parses', jsonProblems)
record('no [[placeholders]]', placeholderProblems)

const ogProblems = [
  ...ogMissing,
  ...(
    await mapLimit([...ogImages], 6, async (image) => {
      const target = new URL(image).origin === siteOrigin ? viaBase(image) : image
      const response = await get(target, { redirect: 'follow' })
      const type = response.headers.get('content-type') ?? ''
      return response.ok && type.startsWith('image/')
        ? []
        : [`${image}: ${response.status} ${type}`]
    })
  ).flat(),
]
record(`OG images reachable (${ogImages.size})`, ogProblems)

// styleguide and headers
const styleguide = await get(new URL(`/${defaultLocale}/styleguide`, base).toString())
record(
  'styleguide disabled (404)',
  styleguide.status === 404 ? [] : [`status ${styleguide.status}`],
)
record(
  'security headers',
  homeHeaders ? missingSecurityHeaders(homeHeaders) : ['home page not checked'],
)

// email DNS
const apex = base.hostname.replace(/^www\./, '')
const mailDomain = values['mail-domain'] ?? `mail.${apex}`

async function txt(name: string): Promise<string[]> {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`,
    { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(10_000) },
  )
  return response.ok ? txtRecords(await response.json()) : []
}

if (isLocal) {
  for (const name of ['SPF', 'DKIM', 'DMARC']) {
    results.push({ name: `DNS ${name}`, status: 'skip', detail: 'localhost' })
  }
} else {
  const [spfSend, spfDomain, dkim, dmarc] = await Promise.all([
    txt(`send.${mailDomain}`),
    txt(mailDomain),
    txt(`resend._domainkey.${mailDomain}`),
    txt(`_dmarc.${apex}`),
  ])
  record(
    `DNS SPF (${mailDomain})`,
    [...spfSend, ...spfDomain].some((entry) => entry.startsWith('v=spf1')) ? [] : ['no v=spf1'],
  )
  record(
    `DNS DKIM (resend._domainkey)`,
    dkim.some((entry) => entry.includes('p=')) ? [] : ['no DKIM key'],
  )
  record(
    `DNS DMARC (_dmarc.${apex})`,
    dmarc.some((entry) => entry.startsWith('v=DMARC1')) ? [] : ['no v=DMARC1'],
  )
}

console.log(`\nLaunch check: ${base.origin}\n`)
console.log(formatTable(results))
if (problems.length) console.log(`\nProblems:\n${problems.map((line) => `  - ${line}`).join('\n')}`)
console.log(`
Manual (NEW-CLIENT §9):
  - Contact form: send one message per language, check the inbox, reply-to and spam placement.
  - Lighthouse (mobile) within SEO.md §8 on the production URL.
  - Rich Results Test (home, a service, an article); Search Console sitemap; Bing import.
  - Phones: call, directions, menu, tiles, form, map consent, language switch.
  - Keyboard walk-through and a VoiceOver/TalkBack spot check (home, contact).
  - Browser console: no CSP report-only messages on every page journey.
  - Legal checklist (LEGAL-GDPR §10); publish test (edit → live in < 10 min).`)

const failed = results.filter((result) => result.status === 'fail').length
console.log(`\n${failed ? `${failed} check(s) failed.` : 'All automated checks passed.'}`)
process.exit(failed ? 1 : 0)
