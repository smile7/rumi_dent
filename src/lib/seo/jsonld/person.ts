import type { Person } from 'schema-dts'

import { sanityImageLoader } from '@/lib/content/image-loader'
import type { TeamMember } from '@/lib/content/types'

import { ids, type JsonLdContext } from './ids'

export function person(ctx: JsonLdContext, member: TeamMember): Person {
  return {
    '@type': 'Person',
    '@id': ids.person(ctx.siteUrl, member.id),
    name: member.name,
    alternateName: member.nameLatin,
    honorificPrefix: member.honorific,
    jobTitle: member.role,
    image: member.photo ? sanityImageLoader({ src: member.photo.src, width: 800 }) : undefined,
    worksFor: { '@id': ids.organization(ctx.siteUrl) },
    knowsAbout: member.specialties.length > 0 ? member.specialties : undefined,
    sameAs: member.sameAs.length > 0 ? member.sameAs : undefined,
  }
}
