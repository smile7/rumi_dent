import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier/flat'

const sanityIconsPath = {
  name: '@sanity/icons',
  message:
    "Import each icon from its subpath (`import { CaseIcon } from '@sanity/icons/Case'`). The v5 root entry types icons as `never`, so the root import typechecks but is undefined at runtime.",
}

const boundaryMessage =
  'CMS boundary: site code reads content only through `@/lib/content` (domain types + get*). See .cursor/rules/content-layer.mdc.'

/** Read by scripts/check-boundaries.ts too, so keep every pattern a `regex`. */
const contentBoundaryPatterns = [
  { regex: '^(next-sanity|sanity|groq)(/.*)?$', message: boundaryMessage },
  { regex: '^@(sanity|portabletext)/', message: boundaryMessage },
  { regex: '(^|/)lib/content/sanity(/|$)', message: boundaryMessage },
  { regex: '(^|/)sanity\\.types(\\.ts)?$', message: boundaryMessage },
]

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The jsx-a11y plugin is registered by eslint-config-next; only raise its rules to "strict".
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: ['Label'],
          controlComponents: ['Input', 'Textarea', 'Checkbox'],
          assert: 'either',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-imports': [
        'error',
        { paths: [sanityIconsPath], patterns: contentBoundaryPatterns },
      ],
    },
  },
  {
    // The CMS-aware side of the boundary (ARCHITECTURE §4, .cursor/rules/content-layer.mdc).
    files: [
      'src/lib/content/**',
      'src/sanity/**',
      'src/app/admin/**',
      'src/app/api/**',
      'scripts/**',
      'sanity.*.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', { paths: [sanityIconsPath] }],
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    // Styleguide: internal, env-gated, noindex demo page with sample copy, not user-facing UI.
    ignores: ['**/*.test.tsx', 'src/components/styleguide/**'],
    rules: {
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: [
            '·',
            '•',
            '—',
            '–',
            '|',
            '/',
            '×',
            ':',
            ',',
            '.',
            '(',
            ')',
            '+',
            '*',
            '&nbsp;',
          ],
        },
      ],
    },
  },
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.open-next/**',
    '.wrangler/**',
    'cloudflare-env.d.ts',
    'sanity.types.ts',
  ]),
])

export default eslintConfig
