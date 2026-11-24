/**
 * Seeds a dataset with deterministic `seed-*` documents.
 *
 *   pnpm seed                         demo BG/EN content into `development` (re-runs replace it)
 *   pnpm seed --client --dataset production
 *                                     a real client's structure as drafts; never overwrites
 *   pnpm seed --reset                 delete every seed document first (development only)
 *
 * Demo mode and --reset require the `development` dataset unless --force; demo mode is refused on
 * `production` even with --force. --reset cannot be used with --client.
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and a SANITY_WRITE_TOKEN (Editor robot token) in `.env.local`.
 */
import { readFile, readdir } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { createClient } from '@sanity/client'

import { buildSeed, type SeedDocument, type SeedMode } from './seed/build'
import { seedPrefix, type SeedImages } from './seed/helpers'

try {
  process.loadEnvFile('.env.local')
} catch {
  // Variables can be set in the shell instead.
}

const { values } = parseArgs({
  options: {
    dataset: { type: 'string', default: 'development' },
    client: { type: 'boolean', default: false },
    reset: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
  },
})
const mode: SeedMode = values.client ? 'client' : 'demo'
const { dataset } = values

const fail = (message: string): never => {
  console.error(`seed: ${message}`)
  process.exit(1)
}

if (values.reset && values.client) {
  fail('refusing --reset with --client; client seed keeps seed-* ids and reset would delete edited content')
}

// --force never unlocks demo content in production.
if (mode === 'demo' && dataset === 'production') {
  fail('refusing to write demo content into production; use --client')
}
if (!values.force) {
  if (mode === 'demo' && dataset !== 'development') {
    fail(`refusing to write demo content into "${dataset}"; use development dataset or --force`)
  }
  if (values.reset && dataset !== 'development') {
    fail(`refusing to reset seed documents in "${dataset}"; use development dataset or --force`)
  }
}
const token = process.env.SANITY_WRITE_TOKEN || fail('SANITY_WRITE_TOKEN is not set')

const { apiVersion, projectId } = await import('../src/sanity/env')
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'raw',
})

const imagesDir = resolve(import.meta.dirname, '../seed/images')

/** Sanity dedupes uploads by content hash, so re-running returns the same asset ids. */
async function uploadImages(): Promise<SeedImages> {
  const files = (await readdir(imagesDir)).filter((file) => file.endsWith('.jpg'))
  const entries = await Promise.all(
    files.map(async (file) => {
      const asset = await client.assets.upload('image', await readFile(resolve(imagesDir, file)), {
        filename: file,
      })
      return [basename(file, '.jpg'), asset._id] as const
    }),
  )
  return Object.fromEntries(entries)
}

async function reset() {
  const ids = await client.fetch<string[]>(
    `*[string::startsWith(_id, $published) || string::startsWith(_id, $drafts)]._id`,
    { published: seedPrefix, drafts: `drafts.${seedPrefix}` },
  )
  if (ids.length === 0) return
  const transaction = client.transaction()
  for (const id of ids) transaction.delete(id)
  await transaction.commit()
  console.log(`seed: deleted ${ids.length} seed documents`)
}

if (values.reset) await reset()

const documents = buildSeed(mode, mode === 'demo' ? await uploadImages() : {})
const transaction = client.transaction()

if (mode === 'demo') {
  for (const doc of documents) transaction.createOrReplace<SeedDocument>(doc)
  await transaction.commit()
  console.log(`seed: wrote ${documents.length} demo documents to "${dataset}"`)
} else {
  // A document counts as existing if either its published or its draft version does.
  const publishedIds = documents.map((doc) => doc._id.replace(/^drafts\./, ''))
  const existing = new Set(
    (
      await client.fetch<string[]>(`*[_id in $ids]._id`, {
        ids: publishedIds.flatMap((id) => [id, `drafts.${id}`]),
      })
    ).map((id) => id.replace(/^drafts\./, '')),
  )
  const missing = documents.filter((_, i) => !existing.has(publishedIds[i]!))
  for (const doc of missing) transaction.create<SeedDocument>(doc)
  if (missing.length > 0) await transaction.commit()
  console.log(
    `seed: created ${missing.length} drafts in "${dataset}", kept ${documents.length - missing.length} existing`,
  )
}
