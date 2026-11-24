import { describe, expect, it } from 'vitest'

import {
  E164,
  SLUG_LIKE,
  TIME,
  closesAfterOpens,
  duplicateKeys,
  headingsSkippingLevels,
  i18nValue,
  isTimeZone,
  placeholdersIn,
  sectionProblems,
  toMinutes,
  validateI18n,
} from './validation'

describe('duplicateKeys', () => {
  it('returns the later items that repeat a value, skipping empty ones', () => {
    const items = [
      { _key: 'a', id: 'x' },
      { _key: 'b', id: 'y' },
      { _key: 'c', id: 'x' },
      { _key: 'd' },
      { _key: 'e' },
    ]
    expect(duplicateKeys(items, (item) => item.id)).toEqual([{ _key: 'c', value: 'x' }])
  })
})

describe('sectionProblems', () => {
  const hero = (key: string) => ({ _key: key, _type: 'section.hero' })
  const faq = (key: string, emitSchema?: boolean) => ({
    _key: key,
    _type: 'section.faq',
    emitSchema,
  })
  const text = (key: string, anchorId?: string) => ({
    _key: key,
    _type: 'section.richTextBlock',
    anchorId,
  })

  it('accepts a hero first, one FAQ for Google and unique anchors', () => {
    expect(sectionProblems([hero('h'), text('t', 'a'), faq('f1'), faq('f2', false)])).toBe(true)
  })

  it('flags a hero that is not first, and a second hero', () => {
    expect(sectionProblems([text('t'), hero('h')])).toEqual([
      expect.objectContaining({ path: [{ _key: 'h' }] }),
    ])
    expect(sectionProblems([hero('h1'), hero('h2')])).toEqual([
      expect.objectContaining({ path: [{ _key: 'h2' }] }),
    ])
  })

  it('flags every FAQ for Google after the first (emitSchema defaults to true)', () => {
    expect(sectionProblems([faq('f1'), faq('f2', true), faq('f3')])).toEqual([
      expect.objectContaining({ path: [{ _key: 'f2' }, 'emitSchema'] }),
      expect.objectContaining({ path: [{ _key: 'f3' }, 'emitSchema'] }),
    ])
  })

  it('flags repeated anchor IDs', () => {
    expect(sectionProblems([text('a', 'visit'), text('b', 'visit')])).toEqual([
      expect.objectContaining({ path: [{ _key: 'b' }, 'anchorId'] }),
    ])
  })

  it('requires a section only when asked', () => {
    expect(sectionProblems([])).toBe(true)
    expect(sectionProblems(undefined, { requireOne: true })).toBe('Add at least one section.')
  })
})

describe('placeholdersIn', () => {
  const block = (key: string, ...texts: string[]) => ({
    _type: 'block',
    _key: key,
    children: texts.map((text) => ({ _type: 'span', text })),
  })

  it('finds every distinct [[placeholder]] in the text spans', () => {
    expect(
      placeholdersIn([
        block('a', 'Администратор: [[company name]], ЕИК [[EIK]].'),
        block('b', 'Пишете на ', '[[email]]', ' или на [[company name]].'),
        { _type: 'imageWithAlt', _key: 'c' },
      ]),
    ).toEqual(['[[company name]]', '[[EIK]]', '[[email]]'])
  })

  it('ignores single brackets and handles empty content', () => {
    expect(placeholdersIn([block('a', 'See [1] and [link].')])).toEqual([])
    expect(placeholdersIn(undefined)).toEqual([])
  })
})

const rows = [
  { _key: 'a', language: 'bg', value: 'Здравейте' },
  { _key: 'b', language: 'en', value: 'Hello there, this is long' },
]

describe('i18nValue', () => {
  it('returns the default-language row by default', () => {
    expect(i18nValue(rows)).toBe('Здравейте')
  })
  it('returns another language on request', () => {
    expect(i18nValue(rows, 'en')).toBe('Hello there, this is long')
  })
  it('treats blank strings as missing', () => {
    expect(i18nValue([{ _key: 'a', language: 'bg', value: '  ' }])).toBeUndefined()
  })
})

describe('validateI18n', () => {
  it('requires the default language', () => {
    expect(validateI18n({ required: 'Add a title' })(undefined)).toBe('Add a title')
    expect(validateI18n({ required: 'Add a title' })([rows[1]!])).toBe('Add a title')
    expect(validateI18n({ required: 'Add a title' })(rows)).toBe(true)
  })
  it('flags each row over the limit at its own path', () => {
    expect(validateI18n({ max: 12 })(rows)).toEqual([
      { message: 'Keep it under 12 characters (now 25).', path: [{ _key: 'b' }, 'value'] },
    ])
  })
  it('passes optional empty fields', () => {
    expect(validateI18n({ max: 10 })(undefined)).toBe(true)
  })
})

describe('patterns', () => {
  it('E.164', () => {
    expect(E164.test('+359888123456')).toBe(true)
    expect(E164.test('0888123456')).toBe(false)
    expect(E164.test('+359 888 123 456')).toBe(false)
  })
  it('HH:mm', () => {
    expect(TIME.test('09:00')).toBe(true)
    expect(TIME.test('9:00')).toBe(false)
    expect(TIME.test('24:00')).toBe(false)
  })
  it('slug-like', () => {
    expect(SLUG_LIKE.test('first-visit')).toBe(true)
    expect(SLUG_LIKE.test('First visit')).toBe(false)
    expect(SLUG_LIKE.test('a--b')).toBe(false)
  })
})

describe('isTimeZone', () => {
  it('accepts IANA zones and rejects anything else', () => {
    expect(isTimeZone('Europe/Sofia')).toBe(true)
    expect(isTimeZone('Sofia')).toBe(false)
  })
})

describe('opening times', () => {
  it('treats closing 00:00 as midnight', () => {
    expect(toMinutes('00:00', { closing: true })).toBe(1440)
    expect(closesAfterOpens('18:00', '00:00')).toBe(true)
  })
  it('rejects closing before opening', () => {
    expect(closesAfterOpens('18:00', '09:00')).toBe(false)
    expect(closesAfterOpens('09:00', '09:00')).toBe(false)
  })
  it('leaves incomplete or malformed pairs to the field rules', () => {
    expect(closesAfterOpens(undefined, '09:00')).toBe(true)
    expect(closesAfterOpens('9', '08:00')).toBe(true)
  })
})

describe('headingsSkippingLevels', () => {
  const block = (key: string, style: string) => ({ _type: 'block', _key: key, style })
  it('accepts h2 → h3 → h2 → h3 → h4', () => {
    expect(
      headingsSkippingLevels([
        block('1', 'h2'),
        block('2', 'normal'),
        block('3', 'h3'),
        block('4', 'h2'),
        block('5', 'h3'),
        block('6', 'h4'),
      ]),
    ).toEqual([])
  })
  it('flags a first heading below h2 and skipped levels', () => {
    expect(headingsSkippingLevels([block('1', 'h3'), block('2', 'h2'), block('3', 'h4')])).toEqual([
      '1',
      '3',
    ])
  })
  it('ignores non-block items', () => {
    expect(headingsSkippingLevels([{ _type: 'imageWithAlt', _key: 'x' }])).toEqual([])
  })
})
