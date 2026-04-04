# AdonisJS Review Checklist

Load this checklist when the PR touches files in `app/`, `start/`, `config/`,
or `database/`. Pass relevant sections to agents based on which files changed.

## Controllers

- [ ] Controllers use dependency injection (`@inject()`) not manual instantiation
- [ ] All user input validated via `validate(ctx, zodSchema)` — never `request.all()` directly
- [ ] Controllers delegate to services — no more than ~30 lines of business logic
- [ ] HTTP context destructured correctly: `{ request, response, auth, view }`
- [ ] Error responses return appropriate status codes (422 for validation, 401/403 for auth)

## Lucid ORM

### Queries
- [ ] Relationships use `preload()` not loops with `load()` (N+1 detection)
- [ ] Queries returning lists have appropriate limits or pagination
- [ ] `.first()` results checked for null before use
- [ ] `.findOrFail()` vs `.find()` used appropriately
- [ ] `count()` uses `.count('*')` not `.all().length`
- [ ] Queries select only needed columns where performance matters

### Transactions
- [ ] Transactions use managed callbacks: `db.transaction(async (trx) => {})`
- [ ] Transaction scope is minimal — don't hold connections longer than needed
- [ ] Model hooks don't have side effects that could fail silently

### Models
- [ ] Sensitive fields use `serializeAs: null` to prevent API exposure
- [ ] Relationships properly typed with `@hasMany`, `@belongsTo`, etc.
- [ ] No business logic in models — keep in services

## Validation (Zod)

- [ ] All user input validated before use — no exceptions
- [ ] Schemas handle edge cases: empty strings, null, whitespace-only
- [ ] Validation error messages are user-friendly
- [ ] Shared schema fragments extracted (like `email`, `password` consts)
- [ ] `.refine()` used for cross-field validation (password confirmation, etc.)
- [ ] `z.infer<typeof schema>` used for type derivation — no manual type duplication
- [ ] Uniqueness checks (email unique) handled at DB level or in controller logic

## Auth & Authorization

- [ ] Protected routes have `auth` middleware applied
- [ ] Role/permission checks use bouncer policies, not manual if-checks
- [ ] Auth guards configured correctly for the route type
- [ ] Session IDs regenerated after login
- [ ] Logout invalidates session server-side
- [ ] Login endpoints have rate limiting (check `start/limiter.ts`)

## Routes

- [ ] Route groups use appropriate middleware
- [ ] Resource routes match controller methods
- [ ] Auth middleware applied to protected routes
- [ ] Guest middleware on login/signup routes

## Security (Shield)

- [ ] CSRF protection enabled for web routes
- [ ] Content Security Policy configured (at minimum `defaultSrc: ["'self'"]`)
- [ ] X-Frame-Options set
- [ ] HSTS enabled
- [ ] Secrets loaded from env, not hardcoded
- [ ] `APP_KEY` is set and strong
- [ ] Debug mode disabled in production config

## Performance

### N+1 Detection
```typescript
// BAD: N+1 — query per iteration
const users = await User.all()
for (const user of users) {
  await user.load('profile')
}

// GOOD: eager load
const users = await User.query().preload('profile')
```

### Parallelization
```typescript
// BAD: sequential when independent
const user = await User.find(1)
const posts = await Post.query().where('userId', 1)

// GOOD: parallel
const [user, posts] = await Promise.all([
  User.find(1),
  Post.query().where('userId', 1),
])
```

## SQL Injection

```typescript
// CRITICAL: string concatenation
await Database.rawQuery(`SELECT * FROM users WHERE name = '${name}'`)

// WRONG: missing array wrapper
await User.query().whereRaw('email = ?', email)

// CORRECT: parameter binding with array
await User.query().whereRaw('email = ?', [email])
```

- [ ] No raw queries with string concatenation
- [ ] `whereRaw()` uses parameter binding with ARRAY
- [ ] Search/filter inputs sanitized before use in queries

## Mass Assignment

```typescript
// CRITICAL: passes all fields including isAdmin, role, etc.
await User.create(request.all())

// CORRECT: validate with Zod and use only parsed fields
const input = await validate(ctx, createUserSchema)
await User.create(input)
```

- [ ] `request.all()` never passed directly to `.create()` or `.merge()`
- [ ] Sensitive fields (role, isAdmin, balance) protected from mass assignment
