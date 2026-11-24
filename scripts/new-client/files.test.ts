import { describe, expect, it } from 'vitest'

import {
  apexDomain,
  clientProgress,
  HOSTNAME,
  setBlockedBots,
  setEnvValue,
  setWorkerName,
  SLUG,
} from './files'

describe('setEnvValue', () => {
  it('replaces an existing key and keeps the rest', () => {
    const env = '# comment\nNEXT_PUBLIC_SANITY_DATASET=development\nSECRET=keep\n'
    expect(setEnvValue(env, 'NEXT_PUBLIC_SANITY_DATASET', 'production')).toBe(
      '# comment\nNEXT_PUBLIC_SANITY_DATASET=production\nSECRET=keep\n',
    )
  })

  it('appends a missing key once (idempotent)', () => {
    const once = setEnvValue('A=1', 'B', '2')
    expect(once).toBe('A=1\nB=2\n')
    expect(setEnvValue(once, 'B', '2')).toBe(once)
  })

  it('does not match a key that only shares a prefix', () => {
    expect(setEnvValue('NEXT_PUBLIC_GA_ID_X=1\n', 'NEXT_PUBLIC_GA_ID', 'G')).toBe(
      'NEXT_PUBLIC_GA_ID_X=1\nNEXT_PUBLIC_GA_ID=G\n',
    )
  })
})

describe('setWorkerName', () => {
  const jsonc = `{
  "name": "site-starter-demo",
  "services": [{ "binding": "WORKER_SELF_REFERENCE", "service": "site-starter-demo" }],
}`

  it('renames the worker and its self-reference', () => {
    const renamed = setWorkerName(jsonc, 'rumi-dent-site')
    expect(renamed).toContain('"name": "rumi-dent-site"')
    expect(renamed).toContain('"service": "rumi-dent-site"')
    expect(renamed).not.toContain('site-starter-demo')
    expect(setWorkerName(renamed, 'rumi-dent-site')).toBe(renamed)
  })
})

describe('setBlockedBots', () => {
  const source = "export const AI_CRAWLERS = ['GPTBot']\nexport const blockedBots: string[] = []\n"

  it('switches AI crawlers off and back on', () => {
    const blocked = setBlockedBots(source, true)
    expect(blocked).toContain('export const blockedBots: string[] = [...AI_CRAWLERS]')
    expect(setBlockedBots(blocked, false)).toBe(source)
  })
})

describe('validation', () => {
  it('accepts slugs and hostnames', () => {
    expect(SLUG.test('rumi-dent')).toBe(true)
    expect(SLUG.test('Rumi Dent')).toBe(false)
    expect(HOSTNAME.test('www.rumident.bg')).toBe(true)
    expect(HOSTNAME.test('https://rumident.bg')).toBe(false)
    expect(apexDomain('www.rumident.bg')).toBe('rumident.bg')
  })
})

describe('clientProgress', () => {
  it('names the client and the template version', () => {
    const progress = clientProgress({
      slug: 'rumi-dent',
      domain: 'www.rumident.bg',
      templateVersion: 'v1.0.0',
    })
    expect(progress).toMatch(/^# Progress: rumi-dent\n/)
    expect(progress).toContain('`www.rumident.bg`')
    expect(progress).toContain('v1.0.0')
  })
})
