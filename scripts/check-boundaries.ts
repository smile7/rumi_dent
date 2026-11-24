/**
 * Second net for the CMS boundary (`.cursor/rules/content-layer.mdc`): scans every import in
 * `src/` against the `no-restricted-imports` regex patterns ESLint resolves for that file, so it
 * also catches imports hidden behind `eslint-disable` comments.
 *
 *   pnpm boundaries
 */
import { glob, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

type Pattern = { regex: string; message?: string }

// `import x from '…'`, `export … from '…'`, `import '…'`, `import('…')`, `vi.mock('…')`
const specifierRe = /(?:\bfrom\s*|\bimport\s*\(?\s*|\bimport\s+|\bmock\(\s*)['"]([^'"]+)['"]/g

export function importSpecifiers(source: string): string[] {
  return [...source.matchAll(specifierRe)].map((match) => match[1]!)
}

export function findViolations(source: string, patterns: Pattern[]) {
  const compiled = patterns.map((pattern) => ({ ...pattern, re: new RegExp(pattern.regex) }))
  return importSpecifiers(source).flatMap((specifier) => {
    const hit = compiled.find(({ re }) => re.test(specifier))
    return hit ? [{ specifier, message: hit.message ?? '' }] : []
  })
}

function restrictedPatterns(config: { rules?: Record<string, unknown> }): Pattern[] {
  const rule = config.rules?.['no-restricted-imports']
  if (!Array.isArray(rule)) return []
  const [severity, options] = rule as [unknown, { patterns?: unknown[] } | undefined]
  if (severity === 0 || severity === 'off') return []
  return (options?.patterns ?? []).filter(
    (pattern): pattern is Pattern =>
      typeof pattern === 'object' && pattern !== null && 'regex' in pattern,
  )
}

async function main() {
  const { ESLint } = await import('eslint')
  const eslint = new ESLint()
  const failures: string[] = []
  let checked = 0

  for await (const file of glob('src/**/*.{ts,tsx}')) {
    const patterns = restrictedPatterns(await eslint.calculateConfigForFile(file))
    if (patterns.length === 0) continue
    checked++
    for (const { specifier, message } of findViolations(await readFile(file, 'utf8'), patterns)) {
      failures.push(`${file}: '${specifier}'\n  ${message}`)
    }
  }

  if (failures.length > 0) {
    console.error(`Content boundary violations:\n${failures.join('\n')}`)
    process.exit(1)
  }
  console.log(`Content boundary OK (${checked} files outside the CMS layer checked).`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
