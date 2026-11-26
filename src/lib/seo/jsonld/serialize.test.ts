import { describe, expect, it } from 'vitest'

import type { FaqSection, RichTextValue } from '@/lib/content'

import { faqPage } from './faqPage'
import { serializeJsonLd } from './serialize'

const marker = '\u200b\u200c\u200d\ufeff'.repeat(8)

const answer = [
  { _type: 'block', children: [{ _type: 'span', text: `От 1 година.${marker}` }] },
] as unknown as RichTextValue

const faq: FaqSection = {
  type: 'faq',
  key: 'faq',
  tone: 'base',
  spacing: 'default',
  layout: 'accordion',
  emitSchema: true,
  items: [{ id: 'q1', question: `От каква възраст?${marker}`, answer }],
}

describe('serializeJsonLd', () => {
  it('strips stega markers from FAQ JSON-LD (draft mode)', () => {
    const json = serializeJsonLd(faqPage('https://example.com/bg', faq))

    expect(json).not.toMatch(/[\u200b-\u200d\ufeff]/)
    expect(JSON.parse(json)).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [{ name: 'От каква възраст?', acceptedAnswer: { text: 'От 1 година.' } }],
    })
  })

  it('escapes "<" so CMS text cannot close the script element', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(json).not.toContain('<')
    expect(JSON.parse(json)).toEqual({ name: '</script><script>alert(1)</script>' })
  })
})
