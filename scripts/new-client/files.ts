/** Pure file transforms for `scripts/new-client.ts`. Each one is idempotent. */

export const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/
export const HOSTNAME = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

/** Sets `KEY=value` in a dotenv file, replacing the existing line or appending one. */
export function setEnvValue(content: string, key: string, value: string): string {
  const line = `${key}=${value}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  if (pattern.test(content)) return content.replace(pattern, line)
  return `${content.replace(/\n*$/, '\n')}${line}\n`
}

/** Renames the Worker and its self-referencing service binding in `wrangler.jsonc`. */
export function setWorkerName(jsonc: string, name: string): string {
  const current = /"name":\s*"([^"]+)"/.exec(jsonc)?.[1]
  if (!current) throw new Error('wrangler.jsonc has no "name"')
  return jsonc
    .replace(/"name":\s*"[^"]+"/, `"name": "${name}"`)
    .replaceAll(`"service": "${current}"`, `"service": "${name}"`)
}

/** Opts the production `robots.txt` in or out of AI crawlers (`src/config/site.ts`). */
export function setBlockedBots(source: string, blockAi: boolean): string {
  const pattern = /export const blockedBots: string\[\] = .*$/m
  if (!pattern.test(source)) throw new Error('src/config/site.ts has no blockedBots line')
  return source.replace(
    pattern,
    `export const blockedBots: string[] = ${blockAi ? '[...AI_CRAWLERS]' : '[]'}`,
  )
}

/** The apex domain: `www.client.bg` → `client.bg`. */
export function apexDomain(hostname: string): string {
  return hostname.replace(/^www\./, '')
}

export type ProgressInput = { slug: string; domain: string; templateVersion: string }

/** A fresh `docs/PROGRESS.md` for a client repo (the template's own history stays upstream). */
export function clientProgress({ slug, domain, templateVersion }: ProgressInput): string {
  return `# Progress: ${slug}

Client site for \`${domain}\`, created from the site starter template ${templateVersion}.
Work through \`docs/NEW-CLIENT.md\` top to bottom and tick the steps here.

Legend: [ ] todo · [~] in progress · [x] done · [!] blocked · [-] skipped

## Setup (NEW-CLIENT)
- [x] §2 Repository (\`pnpm new-client\`)
- [ ] §1 Accounts · [ ] §3 Sanity · [ ] §4 Cloudflare · [ ] §5 Theme and brand
- [ ] §6 Content · [ ] §7 Email deliverability · [ ] §8 Domain and go-live
- [ ] §9 Launch QA (\`pnpm launch-check\`) · [ ] §10 Handover

## Notes

## Needs the client

## Follow-ups
`
}
