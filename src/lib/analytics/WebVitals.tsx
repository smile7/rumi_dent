'use client'

import { useReportWebVitals } from 'next/web-vitals'

import { track } from './track'

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0]

// Module-level so the reference never changes (Next reports each metric once per callback).
function report(metric: Metric) {
  track('web_vital', {
    name: metric.name,
    // CLS is unitless (0.05); scaled so every metric is an integer.
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    id: metric.id,
  })
}

/** Core Web Vitals → `track('web_vital')` (SEO.md §8). Rendered for Umami and GA4 only. */
export function WebVitals() {
  useReportWebVitals(report)
  return null
}
