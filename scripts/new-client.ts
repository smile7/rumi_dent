/**
 * Turns a fresh copy of the template into a client repo (NEW-CLIENT §2). Interactive, idempotent:
 * re-running with the same answers changes nothing, and secrets already in `.env.local` /
 * `.dev.vars` are kept.
 *
 *   pnpm new-client
 *   pnpm new-client --dry-run      shows what would change, writes nothing
 *
 * Brand names, contacts and hours are content (Studio → Site settings), not code, so they are
 * not asked here; the closing note lists them with the other manual steps.
 */
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { cancel, confirm, intro, isCancel, log, note, outro, select, text } from '@clack/prompts'

import { brandColors, serializeBrandColors } from './export-brand-colors'
import {
  apexDomain,
  clientProgress,
  HOSTNAME,
  setBlockedBots,
  setEnvValue,
  setWorkerName,
  SLUG,
} from './new-client/files'

const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } })
const dryRun = values['dry-run']
const root = resolve(import.meta.dirname, '..')
const path = (file: string) => resolve(root, file)
const read = (file: string) => (existsSync(path(file)) ? readFileSync(path(file), 'utf8') : '')

function answer<T>(value: T): Exclude<T, symbol> {
  if (isCancel(value)) {
    cancel('Cancelled, nothing written.')
    process.exit(1)
  }
  return value as Exclude<T, symbol>
}

const currentEnv = read('.env.local') || read('.env.example')
const envValue = (key: string) => new RegExp(`^${key}=(.*)$`, 'm').exec(currentEnv)?.[1] ?? ''
const currentWorker = /"name":\s*"([^"]+)"/.exec(read('wrangler.jsonc'))?.[1] ?? ''
const presets = readdirSync(path('src/styles/presets')).map((file) => basename(file, '.css'))
const version = (JSON.parse(read('package.json')) as { version: string }).version

intro(dryRun ? 'New client (dry run)' : 'New client')

const slug = answer(
  await text({
    message: 'Client slug (lowercase, dashes)',
    placeholder: 'rumi-dent',
    initialValue: currentWorker.endsWith('-site') ? currentWorker.slice(0, -'-site'.length) : '',
    validate: (value) => (SLUG.test(value ?? '') ? undefined : 'Use a-z, 0-9 and dashes.'),
  }),
)
const domain = answer(
  await text({
    message: 'Production domain (no https://)',
    placeholder: 'www.client.bg',
    validate: (value) => (HOSTNAME.test(value ?? '') ? undefined : 'e.g. www.client.bg'),
  }),
)
const projectId = answer(
  await text({
    message: 'Sanity project ID',
    initialValue: envValue('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    validate: (value) => (/^[a-z0-9]{6,}$/.test(value ?? '') ? undefined : 'From sanity.io/manage'),
  }),
)
const dataset = answer(
  await select({
    message: 'Dataset for local development',
    initialValue: 'development',
    options: [
      { value: 'development', label: 'development', hint: 'seed and experiments' },
      { value: 'production', label: 'production' },
    ],
  }),
)
const analytics = answer(
  await select({
    message: 'Analytics provider',
    initialValue: envValue('NEXT_PUBLIC_ANALYTICS') || 'none',
    options: [
      { value: 'none', label: 'none' },
      { value: 'cloudflare', label: 'Cloudflare Web Analytics', hint: 'free, no cookies' },
      { value: 'umami', label: 'Umami Cloud Hobby', hint: 'free, no cookies' },
      { value: 'ga4', label: 'Google Analytics 4', hint: 'needs the consent banner' },
    ],
  }),
)
const blockAi = answer(
  await confirm({ message: 'Block AI crawlers in robots.txt?', initialValue: false }),
)
const preset = answer(
  await select({
    message: 'Theme preset (copied into src/styles/tokens.css)',
    initialValue: presets.includes('neutral') ? 'neutral' : presets[0],
    options: presets.map((name) => ({ value: name, label: name })),
  }),
)
const resetProgress = answer(
  await confirm({ message: 'Reset docs/PROGRESS.md to a client copy?', initialValue: true }),
)
const removeDemoImages = answer(
  await confirm({
    message: 'Delete the demo seed images (seed/images)? `pnpm seed` demo mode stops working.',
    initialValue: false,
  }),
)

const apex = apexDomain(domain)
const fromEmail = `Website <noreply@mail.${apex}>`
const tokens = read(`src/styles/presets/${preset}.css`)

let env = currentEnv
for (const [key, value] of [
  ['NEXT_PUBLIC_SANITY_PROJECT_ID', projectId],
  ['NEXT_PUBLIC_SANITY_DATASET', dataset],
  ['NEXT_PUBLIC_ANALYTICS', analytics],
  ['CONTACT_FROM_EMAIL', fromEmail],
] as const) {
  env = setEnvValue(env, key, value)
}

const writes = new Map<string, string>([
  ['.env.local', env],
  [
    '.dev.vars',
    setEnvValue(read('.dev.vars') || read('.dev.vars.example'), 'CONTACT_FROM_EMAIL', fromEmail),
  ],
  ['wrangler.jsonc', setWorkerName(read('wrangler.jsonc'), `${slug}-site`)],
  ['src/config/site.ts', setBlockedBots(read('src/config/site.ts'), blockAi)],
  ['src/styles/tokens.css', tokens],
  ['src/config/brand-colors.json', serializeBrandColors(brandColors(tokens))],
])
if (resetProgress) {
  writes.set('docs/PROGRESS.md', clientProgress({ slug, domain, templateVersion: `v${version}` }))
}
const deletions = removeDemoImages
  ? readdirSync(path('seed/images'))
      .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
      .map((file) => `seed/images/${file}`)
  : []

for (const [file, content] of writes) {
  if (read(file) === content) {
    log.info(`unchanged  ${file}`)
  } else if (dryRun) {
    log.warn(`would write ${file}`)
  } else {
    writeFileSync(path(file), content)
    log.success(`wrote      ${file}`)
  }
}
for (const file of deletions) {
  if (dryRun) log.warn(`would delete ${file}`)
  else rmSync(path(file))
}
if (deletions.length && !dryRun) log.success(`deleted    ${deletions.length} demo images`)

note(
  [
    `GitHub repository variables (Settings → Secrets and variables → Actions → Variables):`,
    `  NEXT_PUBLIC_SITE_URL=https://${domain}  NEXT_PUBLIC_ENV=production`,
    `  NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}  NEXT_PUBLIC_SANITY_DATASET=production`,
    `  NEXT_PUBLIC_ANALYTICS=${analytics}${analytics === 'none' ? '' : ' + its ID (ARCHITECTURE §9)'}`,
    `  NEXT_PUBLIC_ENABLE_STYLEGUIDE=true until the client signs off the styleguide`,
    `Languages: keep bg + en, or follow ARCHITECTURE §7.1 before seeding.`,
    `Content: pnpm seed --client --dataset production, then Studio → Site settings`,
    `  (brand names per language, address, phones, hours, legal entity).`,
    `Theme: refine src/styles/tokens.css + src/config/fonts.ts, then pnpm tokens:export.`,
    `Then continue with NEW-CLIENT §3 (Sanity) and §4 (Cloudflare).`,
  ].join('\n'),
  'Next steps',
)
outro(dryRun ? 'Dry run: nothing was written.' : 'Done. Review the changes with git diff.')
