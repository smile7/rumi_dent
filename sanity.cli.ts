import { defineCliConfig } from 'sanity/cli'

import { dataset, projectId } from './src/sanity/env'

export default defineCliConfig({
  api: { projectId, dataset },
  // Only used by `pnpm studio:deploy` (optional hosted Studio, ADR-010).
  studioHost: process.env.SANITY_STUDIO_HOST,
  typegen: {
    path: './src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: 'sanity.types.ts',
    overloadClientMethods: true,
  },
})
