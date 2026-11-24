import type { Service as ServiceNode } from 'schema-dts'

import { ogImageUrl } from '@/lib/content/image-loader'
import type { Service } from '@/lib/content/types'

import { ids, type JsonLdContext } from './ids'

export function service(ctx: JsonLdContext, url: string, item: Service): ServiceNode {
  return {
    '@type': 'Service',
    '@id': ids.service(url),
    name: item.title,
    description: item.teaser,
    url,
    image: item.image ? ogImageUrl(item.image) : undefined,
    serviceType: item.category?.title,
    provider: { '@id': ids.organization(ctx.siteUrl) },
    areaServed: ctx.settings.areaServed,
  }
}
