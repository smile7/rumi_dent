import { describe, expect, it } from 'vitest'

import { galleryConsentFilter } from '../fragments'
import { galleryQuery } from './collections'
import { pageByKeyQuery, pageBySlugQuery } from './documents'

const squash = (query: string) => query.replace(/\s+/g, ' ')

describe('gallery consent guarantee', () => {
  it('only lets patient photos through with consent on file', () => {
    expect(galleryConsentFilter).toBe('(showsPatient != true || consentOnFile == true)')
  })

  it('applies it to the gallery list query', () => {
    expect(squash(galleryQuery)).toContain(`_type == "galleryItem" && ${galleryConsentFilter}`)
  })

  it('applies it to both gallery section branches (hand-picked and automatic)', () => {
    for (const query of [pageByKeyQuery, pageBySlugQuery]) {
      const flat = squash(query)
      expect(flat).toContain('items[ @->showsPatient != true || @->consentOnFile == true ]->{')
      expect(flat).toContain(`*[_type == "galleryItem" && ${galleryConsentFilter} &&`)
    }
  })
})
