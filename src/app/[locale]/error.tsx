'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Section } from '@/components/primitives/Section'
import { Cluster, Stack } from '@/components/primitives/Stack'
import { Text } from '@/components/primitives/Text'
import { Button, buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export type ErrorPageProps = {
  error: unknown
  retry: () => void
}

/** Runtime errors below the `[locale]` layout; header and footer stay usable. */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <title>{t('title')}</title>
      <Section tone="soft" labelledBy="error-title">
        <Container width="prose">
          <Stack gap="lg">
            <Heading as="h1" id="error-title" className="text-balance">
              {t('title')}
            </Heading>
            <Text size="lead" className="text-pretty">
              {t('description')}
            </Text>
            <Cluster gap="sm">
              <Button onClick={() => retry()}>{t('retry')}</Button>
              <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
                {t('home')}
              </Link>
            </Cluster>
          </Stack>
        </Container>
      </Section>
    </>
  )
}
