'use client'

import { useTranslations } from 'next-intl'

import { enabledProcessors } from '@/config/processors'

export type ProcessorsListProps = { caption?: string | undefined }

/** The privacy policy's list of processors and recipients, generated from config. */
export function ProcessorsList({ caption }: ProcessorsListProps) {
  const t = useTranslations('Processors')

  return (
    <>
      {caption ? <p>{caption}</p> : null}
      <ul>
        {enabledProcessors().map((entry) => (
          <li key={entry.id}>
            <strong>{t(`items.${entry.id}.name`)}</strong>
            <span className="block">{t(`items.${entry.id}.purpose`)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
