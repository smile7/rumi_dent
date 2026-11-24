/**
 * Lists unreplaced `[[placeholders]]` in every legal page of the dataset in `.env.local`. With
 * `NEXT_PUBLIC_ENV=production` any placeholder fails the check (exit 1), exactly as it fails a
 * production build (`getLegalPage`).
 *
 *   pnpm check:legal
 *   NEXT_PUBLIC_ENV=production pnpm check:legal
 */
import { registerHooks } from 'node:module'

try {
  process.loadEnvFile('.env.local')
} catch {
  // Variables can be set in the shell instead.
}

const stubs: Record<string, string> = {
  'next/headers': 'export const draftMode = async () => ({ isEnabled: false })',
  'server-only': 'export {}',
}
registerHooks({
  resolve(specifier, context, nextResolve) {
    const stub = stubs[specifier]
    return stub
      ? { url: `data:text/javascript,${encodeURIComponent(stub)}`, shortCircuit: true }
      : nextResolve(specifier, context)
  },
})

const content = await import('@/lib/content')

let failed = 0
for (const { slug, locale } of await content.getStaticSlugs('legalPage')) {
  try {
    const page = await content.getLegalPage(slug, locale)
    const found = page?.placeholders ?? []
    console.log(
      `${found.length ? '⚠' : '✓'} ${locale}/${slug}${found.length ? `: ${found.join(', ')}` : ''}`,
    )
  } catch (error) {
    failed++
    console.error(`✗ ${locale}/${slug}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failed) {
  console.error(`\n${failed} legal page(s) are not publishable in production.`)
  process.exit(1)
}
