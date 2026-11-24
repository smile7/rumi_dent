import type { Locale } from '@/config/i18n'

import type messages from './messages/bg.json'

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
