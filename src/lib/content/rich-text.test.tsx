import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import { RichText } from './rich-text'
import { blockRow, linkRow } from './sanity/mappers/fixtures'
import { mapRichText } from './sanity/mappers/shared'

const value = mapRichText(
  [
    { ...blockRow('Why baby teeth matter'), _key: 'h', style: 'h2' },
    blockRow(
      'Call or read the guide',
      [
        { _type: 'link', _key: 'in', ...linkRow({ systemRoute: 'contact' }) },
        {
          _type: 'link',
          _key: 'out',
          ...linkRow({ kind: 'external', href: 'https://example.org', openInNewTab: true }),
        },
      ],
      [],
    ),
  ].map((block, index) =>
    index === 1
      ? {
          ...block,
          children: [
            { _type: 'span', _key: 'a', text: 'contact us', marks: ['in'] },
            { _type: 'span', _key: 'b', text: 'the guide', marks: ['out'] },
          ],
        }
      : block,
  ),
  'en',
)

describe('RichText', () => {
  it('renders CMS h2 as h2 by default and shifts it under a section heading', () => {
    const { unmount } = renderWithIntl(<RichText value={value} />, 'en')
    expect(screen.getByRole('heading', { level: 2, name: 'Why baby teeth matter' })).toBeVisible()
    unmount()

    renderWithIntl(<RichText value={value} headingOffset={1} />, 'en')
    expect(screen.getByRole('heading', { level: 3, name: 'Why baby teeth matter' })).toBeVisible()
  })

  it('renders localized internal links and announces new-tab external links', () => {
    renderWithIntl(<RichText value={value} />, 'en')
    expect(screen.getByRole('link', { name: 'contact us' })).toHaveAttribute('href', '/en/contact')
    const external = screen.getByRole('link', { name: /the guide/ })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
    expect(external).toHaveTextContent('(opens in a new tab)')
  })
})
