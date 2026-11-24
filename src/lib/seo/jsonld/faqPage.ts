import type { FAQPage } from 'schema-dts'

import type { FaqSection, RichTextValue } from '@/lib/content/types'

import { ids } from './ids'

function richTextToPlainText(value: RichTextValue): string {
  const blocks = value as unknown as { _type?: string; children?: { text?: string }[] }[]
  return blocks
    .filter((block) => block._type === 'block')
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
    .trim()
}

/** Only from a visible FAQ section with `emitSchema` on. */
export function faqPage(url: string, section: FaqSection): FAQPage | null {
  if (!section.emitSchema || section.items.length === 0) return null
  return {
    '@type': 'FAQPage',
    '@id': ids.faq(url),
    isPartOf: { '@id': ids.webPage(url) },
    mainEntity: section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: richTextToPlainText(item.answer) },
    })),
  }
}
