import type { Messages } from 'next-intl'

import type { Locale } from '@/config/i18n'

import bg from '../../messages/bg.json'
import en from '../../messages/en.json'

/** Every message catalog, loaded eagerly for tests. A new locale is a type error until added here. */
export const catalogs: Record<Locale, Messages> = { bg, en }
