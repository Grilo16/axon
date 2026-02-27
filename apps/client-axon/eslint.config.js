import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // 1. SHARED IS BLIND: Cannot import from anywhere above it
          {
            target: './src/shared',
            from: ['./src/features', './src/pages', './src/app'],
            message: '🛑 Architectural Violation: The "shared" folder is dumb and cannot import from features, pages, or app.'
          },
          // 2. CORE IS BLIND TO UI: Cannot import from standard features or pages
          {
            target: './src/features/core',
            from: ['./src/pages', './src/features/!(core)'], // The !(core) ignores itself
            message: '🛑 Architectural Violation: "features/core" is foundational. It cannot import from UI features or pages.'
          },
          // 3. FEATURES ARE BLIND TO PAGES: UI Features cannot import from the top level
          {
            target: './src/features',
            from: ['./src/pages', './src/app'],
            message: '🛑 Architectural Violation: "features" cannot import from pages or the app setup.'
          }
        ]
      }
    ],
    },
  },
)