/**
 * Option lists shared by several schema types. `value`s are stored in content and read by the
 * content layer, so renaming one needs a migration.
 */

/** System pages bound to a code route (CONTENT-MODEL §3 `page.pageKey`, `link.systemRoute`). */
export const systemPageKeys = [
  { title: 'Home', value: 'home' },
  { title: 'Services', value: 'services' },
  { title: 'About', value: 'about' },
  { title: 'Gallery', value: 'gallery' },
  { title: 'Blog', value: 'blog' },
  { title: 'Contact', value: 'contact' },
] as const

export const weekdays = [
  { title: 'Mon', value: 'Mo' },
  { title: 'Tue', value: 'Tu' },
  { title: 'Wed', value: 'We' },
  { title: 'Thu', value: 'Th' },
  { title: 'Fri', value: 'Fr' },
  { title: 'Sat', value: 'Sa' },
  { title: 'Sun', value: 'Su' },
] as const

export const phoneKeys = [
  { title: 'Primary', value: 'primary' },
  { title: 'Secondary', value: 'secondary' },
] as const

export const buttonStyles = [
  { title: 'Primary', value: 'primary' },
  { title: 'Secondary', value: 'secondary' },
  { title: 'Outline', value: 'outline' },
  { title: 'Ghost', value: 'ghost' },
] as const

export const routableReferenceTargets = [
  { type: 'page' },
  { type: 'service' },
  { type: 'article' },
  { type: 'legalPage' },
]
