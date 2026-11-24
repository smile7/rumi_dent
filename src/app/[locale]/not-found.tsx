import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Section } from '@/components/primitives/Section'
import { Cluster, Stack } from '@/components/primitives/Stack'
import { Text } from '@/components/primitives/Text'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <>
      {/* Segment-level not-found files can't export metadata; React hoists this into <head>. */}
      <title>{t('title')}</title>
      <Section tone="soft" labelledBy="not-found-title">
        <Container width="prose">
          <Stack gap="lg">
            <Text tone="muted" className="font-display text-step-1 font-bold tabular-nums">
              {t('code')}
            </Text>
            <Heading as="h1" id="not-found-title" className="text-balance">
              {t('title')}
            </Heading>
            <Text size="lead" className="text-pretty">
              {t('description')}
            </Text>
            <Cluster gap="sm">
              <Link href="/" className={cn(buttonVariants())}>
                {t('home')}
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ variant: 'outline' }))}>
                {t('contact')}
              </Link>
            </Cluster>
          </Stack>
        </Container>
      </Section>
    </>
  )
}
