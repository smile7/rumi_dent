'use client'

import { useTranslations } from 'next-intl'
import { useId } from 'react'

import { enabledCookies } from '@/config/cookies'

export type CookieTableProps = { caption?: string | undefined }

/** The cookie policy table, generated from the registry so it always matches the build. */
export function CookieTable({ caption }: CookieTableProps) {
  const t = useTranslations('Cookies')
  const captionId = useId()

  return (
    // Scrolls sideways on narrow screens; focusable so keyboard users can scroll it too.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div role="region" aria-labelledby={captionId} tabIndex={0} className="overflow-x-auto">
      <table>
        <caption id={captionId} className="text-start">
          {caption ?? t('table.caption')}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t('table.name')}</th>
            <th scope="col">{t('table.provider')}</th>
            <th scope="col">{t('table.purpose')}</th>
            <th scope="col">{t('table.duration')}</th>
            <th scope="col">{t('table.category')}</th>
          </tr>
        </thead>
        <tbody>
          {enabledCookies().map((entry) => (
            <tr key={entry.id}>
              <th scope="row" className="font-mono text-step--1 font-normal">
                {entry.name}
              </th>
              <td>{t(`providers.${entry.provider}`)}</td>
              <td>{t(`items.${entry.id}.purpose`)}</td>
              <td>{t(`items.${entry.id}.duration`)}</td>
              <td>{t(`categories.${entry.category}.title`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
