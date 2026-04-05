export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature → minor bump
        'fix', // bug fix → patch bump
        'docs', // documentation only
        'style', // formatting, no code change
        'refactor', // code change, no feature/fix
        'perf', // performance improvement
        'test', // adding/updating tests
        'build', // build system, dependencies
        'ci', // CI/CD changes
        'chore', // maintenance tasks
        'revert', // revert a commit
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 100],
  },
}
