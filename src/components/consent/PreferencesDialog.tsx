'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { choosableCategories, enabledCookies, type ConsentCategory } from '@/config/cookies'
import type { GrantedCategory } from '@/lib/consent/consent'

export type PreferencesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  granted: GrantedCategory[]
  cookiePolicyHref?: string | undefined
  onSave: (categories: GrantedCategory[]) => void
}

/** Second consent layer: one switch per category in use, necessary locked on (LEGAL-GDPR §4). */
export function PreferencesDialog({
  open,
  onOpenChange,
  granted,
  cookiePolicyHref,
  onSave,
}: PreferencesDialogProps) {
  const t = useTranslations('Consent')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('dialog.close')}>
        <PreferencesForm
          granted={granted}
          cookiePolicyHref={cookiePolicyHref}
          onSave={(categories) => {
            onSave(categories)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

type PreferencesFormProps = Pick<PreferencesDialogProps, 'granted' | 'cookiePolicyHref' | 'onSave'>

/** Mounted on every open, so the switches start from the stored choice. */
function PreferencesForm({ granted, cookiePolicyHref, onSave }: PreferencesFormProps) {
  const t = useTranslations('Consent')
  const categories = choosableCategories()
  const [selected, setSelected] = useState<GrantedCategory[]>(() =>
    granted.filter((category) => categories.includes(category)),
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('dialog.title')}</DialogTitle>
        <DialogDescription>
          {t('dialog.description')}{' '}
          {cookiePolicyHref ? <NextLink href={cookiePolicyHref}>{t('policy')}</NextLink> : null}
        </DialogDescription>
      </DialogHeader>
      <ul className="flex flex-col gap-4">
        <CategoryRow category="necessary" checked disabled />
        {categories.map((category) => (
          <CategoryRow
            key={category}
            category={category}
            checked={selected.includes(category)}
            onChange={(checked) =>
              setSelected((current) =>
                checked ? [...current, category] : current.filter((c) => c !== category),
              )
            }
          />
        ))}
      </ul>
      <DialogFooter className="sm:justify-stretch *:sm:flex-1">
        <Button variant="outline" onClick={() => onSave([])}>
          {t('rejectAll')}
        </Button>
        <Button variant="outline" onClick={() => onSave(categories)}>
          {t('acceptAll')}
        </Button>
        <Button variant="outline" onClick={() => onSave(selected)}>
          {t('dialog.save')}
        </Button>
      </DialogFooter>
    </>
  )
}

type CategoryRowProps = {
  category: ConsentCategory
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

function CategoryRow({ category, checked, disabled, onChange }: CategoryRowProps) {
  const t = useTranslations('Cookies')
  const tConsent = useTranslations('Consent')
  const id = `consent-${category}`
  const entries = enabledCookies().filter((entry) => entry.category === category)

  return (
    <li className="rounded-card border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="font-semibold">
          {t(`categories.${category}.title`)}
          {disabled ? (
            <span className="ms-2 text-step--1 font-normal text-fg-muted">
              {tConsent('dialog.alwaysOn')}
            </span>
          ) : null}
        </label>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-describedby={`${id}-description`}
          onChange={(event) => onChange?.(event.target.checked)}
          className="size-6 shrink-0 accent-primary"
        />
      </div>
      <div id={`${id}-description`} className="mt-1 text-step--1 text-fg-muted">
        <p>{t(`categories.${category}.description`)}</p>
        {entries.length > 0 ? (
          <ul className="mt-2 list-disc ps-5">
            {entries.map((entry) => (
              <li key={entry.id}>
                <span className="font-semibold">{entry.name}</span> {t(`items.${entry.id}.purpose`)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  )
}
