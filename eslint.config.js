import { configApp } from '@adonisjs/eslint-config'

export default [
  ...configApp(),
  {
    ignores: ['.claude/worktrees/**'],
  },
  {
    rules: {
      // Complexity
      'complexity': ['error', { max: 10 }],
      'max-depth': ['error', { max: 3 }],
      'max-params': ['error', { max: 4 }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],

      // Code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // no-return-await intentionally omitted — the @typescript-eslint/return-await
      // variant requires type-aware linting. The base rule has false positives in
      // try blocks where removing await breaks rejection catching.
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
  },
]
