import { defineQuery } from 'next-sanity'

import {
  faqItemFields,
  galleryConsentFilter,
  galleryItemFields,
  teamMemberFields,
  testimonialFields,
} from '../fragments'

export const teamQuery = defineQuery(
  `*[_type == "teamMember"] | order(orderRank){ ${teamMemberFields} }`,
)

export const faqQuery = defineQuery(
  `*[_type == "faqItem" && ($category == null || category == $category)]
    | order(orderRank){ ${faqItemFields} }`,
)

export const galleryQuery = defineQuery(
  `*[_type == "galleryItem" && ${galleryConsentFilter} && ($album == null || album == $album)]
    | order(orderRank)[0...$limit]{ ${galleryItemFields} }`,
)

export const testimonialsQuery = defineQuery(
  `*[_type == "testimonial" && ($featured == null || featured == $featured)]
    | order(date desc){ ${testimonialFields} }`,
)
