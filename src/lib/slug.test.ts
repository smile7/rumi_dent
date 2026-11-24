import { describe, expect, it } from 'vitest'

import { SLUG_MAX_LENGTH, reservedSlugs, slugify } from './slug'

describe('slugify', () => {
  it('transliterates Bulgarian with the official system', () => {
    expect(slugify('Детска стоматология')).toBe('detska-stomatologiya')
    expect(slugify('Щадящо лечение на зъби')).toBe('shtadyashto-lechenie-na-zabi')
    expect(slugify('Юлия Цветкова')).toBe('yuliya-tsvetkova')
    expect(slugify('ЖЪЛТ ЧАЙ')).toBe('zhalt-chay')
  })

  it('strips Latin diacritics and punctuation', () => {
    expect(slugify('Café & Co.')).toBe('cafe-co')
    expect(slugify('  Teeth whitening: 2 steps!  ')).toBe('teeth-whitening-2-steps')
  })

  it('collapses separators and never starts or ends with a hyphen', () => {
    expect(slugify('--a  —  b--')).toBe('a-b')
    expect(slugify('!!!')).toBe('')
  })

  it('caps the length without leaving a trailing hyphen', () => {
    const slug = slugify(`${'a'.repeat(SLUG_MAX_LENGTH - 1)} b`)
    expect(slug).toBe('a'.repeat(SLUG_MAX_LENGTH - 1))
  })
})

describe('reservedSlugs', () => {
  it('lists every top-level system segment in every locale', () => {
    expect([...reservedSlugs].sort()).toEqual(
      [
        'about',
        'admin',
        'api',
        'bg',
        'blog',
        'contact',
        'en',
        'galeriya',
        'gallery',
        'kontakti',
        'legal',
        'pravna-informaciya',
        'services',
        'styleguide',
        'uslugi',
        'za-nas',
      ].sort(),
    )
  })
})
