# GrindHaven — Project Conventions

## Stack

- **Framework:** AdonisJS v7 (hypermedia starter — Edge.js + Alpine.js)
- **Database:** SQLite via better-sqlite3 (stored at `tmp/db.sqlite3`)
- **Auth:** Session-based. Dev auto-login via `DevAuthMiddleware` (dev-only, gated by `app.inDev`)
- **Validation:** Zod — NOT VineJS. Use `validate()` from `#validators/validate`
- **Package manager:** pnpm
- **Node:** >=24 (see `.nvmrc`)

## Commands

```bash
# Development
node ace serve --hmr          # Dev server with HMR
node ace db:seed              # Seed default dev user

# Testing
node ace test                 # All suites (unit, functional, browser)
node ace test --suite=unit    # Unit tests only
node ace test --suite=functional  # HTTP tests only
node ace test --suite=browser     # Playwright browser tests

# Quality
pnpm lint                     # ESLint
pnpm format:check             # Prettier check
pnpm typecheck                # tsc --noEmit

# Database
node ace migration:run        # Run pending migrations
node ace migration:rollback   # Rollback last batch
```

## Test Suites

| Suite        | Location                        | Timeout | Notes                                 |
| ------------ | ------------------------------- | ------- | ------------------------------------- |
| `unit`       | `tests/unit/**/*.spec.ts`       | 2s      | Pure logic, no HTTP                   |
| `functional` | `tests/functional/**/*.spec.ts` | 30s     | HTTP tests via `@japa/api-client`     |
| `browser`    | `tests/browser/**/*.spec.ts`    | 300s    | Playwright via `@japa/browser-client` |

## Validation Pattern

Use Zod schemas in `app/validators/`. Call `validate(ctx, schema)` from controllers — it handles flash messages, redirect back, and throws `ValidationException`. Do NOT wrap `validate()` in try/catch.

```ts
import { validate } from '#validators/validate'

const data = await validate(ctx, signupSchema)
```

## Project Structure

```
app/controllers/      # HTTP controllers (lazy-loaded via #generated/controllers)
app/exceptions/       # Custom exceptions (ValidationException)
app/middleware/        # HTTP middleware (auth, guest, devAuth, silentAuth)
app/models/           # Lucid ORM models
app/validators/       # Zod schemas + validate() helper
config/               # AdonisJS configuration
database/migrations/  # Database migrations
database/seeders/     # Seeders (default dev user)
database/schema.ts    # Auto-generated schema (DO NOT edit manually)
resources/views/      # Edge.js templates
start/routes.ts       # Route definitions
start/kernel.ts       # Middleware stack
tests/                # Japa test suites
```

## ESLint Rules

Complexity limits are enforced — keep code simple:

- **Cyclomatic complexity:** max 10
- **Max depth:** 3
- **Max params:** 4
- **Max lines per function:** 50 (warning)

## Git & PR Workflow

### Branching

- Work on feature branches, PR into `main`
- Conventional commits required (enforced by commitlint)
- Format: `type: description` (e.g., `feat: add user profile page`)

### Before Creating a PR

1. All tests pass: `node ace test`
2. Lint clean: `pnpm lint`
3. Types clean: `pnpm typecheck`
4. Format clean: `pnpm format:check`

### PR Review — REQUIRED Before Merge

Run `/review-pr {number}` before merging any PR. This launches 3 parallel review agents (code-reviewer, typescript-reviewer, architect-reviewer) and produces a consolidated report.

Address all CRITICAL and HIGH findings before merging. MEDIUM findings should be addressed unless there's a documented reason to defer.

### Before Merging

1. Update the PR description to reflect the final state of changes (not the initial description — the PR may have evolved during review)
2. **Prompt the user for approval** before merging. Never merge without explicit user confirmation.
3. Merge via `gh pr merge --squash`

## Autonomous Dev Loop

When working on a feature end-to-end:

1. Create a feature branch
2. Write code + tests
3. Run `node ace test` — iterate until green
4. Run `pnpm lint && pnpm typecheck && pnpm format:check`
5. Start the app (`node ace serve`), use Playwright MCP to visually verify if UI changed
6. Commit, push, create PR via `gh pr create`
7. Run `/review-pr` against the PR
8. Address findings, push updates
9. Re-run review if significant changes were made
10. Update PR description to reflect final changes
11. Ask the user for merge approval
12. Merge via `gh pr merge --squash` when approved

## CI/CD

- **CI:** GitHub Actions — lint, typecheck, test (parallel jobs)
- **Coverage:** Codecov with 80% patch target (informational, not blocking)
- **Releases:** release-please for automated changelog + semver
