import { notFound } from 'next/navigation'

/** Sends unknown paths inside a locale to the localized `not-found.tsx` (within the locale layout). */
export default function CatchAll(): never {
  notFound()
}
