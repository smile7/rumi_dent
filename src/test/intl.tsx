import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactElement } from 'react'

import type { Locale } from '@/config/i18n'

import { catalogs } from './messages'

/** Renders a client component the way the locale layout provides it (all messages). */
export function renderWithIntl(ui: ReactElement, locale: Locale = 'bg') {
  return render(
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="Europe/Sofia">
      {ui}
    </NextIntlClientProvider>,
  )
}
