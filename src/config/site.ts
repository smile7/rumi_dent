/** Known AI crawlers. Allowed by default (AEO, SEO.md §3). */
export const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']

/**
 * User agents disallowed in production `robots.txt`. A client who opts out of AI crawling sets
 * `[...AI_CRAWLERS]`; mention the choice in the privacy/terms discussion.
 */
export const blockedBots: string[] = []
