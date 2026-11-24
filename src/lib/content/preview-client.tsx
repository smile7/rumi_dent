'use client'

import dynamic from 'next/dynamic'

// Lazy so the Sanity overlay code (comlink, xstate, @sanity/ui) stays out of every public page's
// first-load JS; it downloads only when draft mode renders this.
const VisualEditing = dynamic(
  () => import('next-sanity/visual-editing').then((mod) => mod.VisualEditing),
  { ssr: false },
)
const ExitPreview = dynamic(() => import('./exit-preview').then((mod) => mod.ExitPreview), {
  ssr: false,
})

export function PreviewClient({ exitLabel }: { exitLabel: string }) {
  return (
    <>
      <VisualEditing />
      <ExitPreview label={exitLabel} />
    </>
  )
}
