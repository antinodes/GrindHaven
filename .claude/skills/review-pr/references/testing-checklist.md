# Testing Review Checklist

Load this checklist when the PR touches files in `tests/` or modifies
test configuration (`tests/bootstrap.ts`, `bin/test.ts`).

## Japa Test Structure

### Organization
- [ ] Tests in the correct suite directory (`tests/unit/`, `tests/browser/`)
- [ ] Test file naming follows convention: `{feature}.spec.ts`
- [ ] Test groups logically organized — one `test.group()` per feature/concern
- [ ] Setup/teardown uses `group.each.setup()` / `group.each.teardown()` not manual try/finally

### Assertions
- [ ] Assertions are specific — `assert.equal(x, 'expected')` not `assert.isTrue(x === 'expected')`
- [ ] Error cases assert the specific error, not just "it threw"
- [ ] HTTP response tests check status code AND body/structure
- [ ] Database state assertions use fresh queries, not stale references

### Test Isolation
- [ ] Each test creates its own data — no shared mutable state between tests
- [ ] Database cleaned between tests (transactions or truncation)
- [ ] No test order dependencies — any test should pass in isolation
- [ ] Global state (env vars, singletons) restored after modification

### Coverage Gaps
- [ ] Happy path tested
- [ ] Error/failure path tested (invalid input, missing data, auth failures)
- [ ] Edge cases tested (empty input, boundary values, null)
- [ ] If the PR adds a new endpoint, there's at least one test for it

## HTTP Tests (AdonisJS Plugin)

### Route Testing
```typescript
// Test authenticated routes
const user = await UserFactory.create()
const response = await client
  .get('/dashboard')
  .loginAs(user)
  .expect(200)

// Test validation
const response = await client
  .post('/signup')
  .form({ email: 'not-an-email' })
  .expect(422)
```

- [ ] Authentication tested: both authenticated and unauthenticated requests
- [ ] Validation tested: invalid input returns 422 with error details
- [ ] Authorization tested: wrong role/permission returns 403
- [ ] Response structure verified, not just status code
- [ ] Redirects tested with `assertRedirectsTo()`

### Database in Tests
- [ ] Tests use `group.each.setup()` with `db.beginGlobalTransaction()`
  or per-test transactions for isolation
- [ ] Factory methods preferred over manual model creation for test data
- [ ] Seeders not relied upon — tests should be self-contained
- [ ] Migration state assumed fresh — tests don't depend on prior test data

## Browser Tests (Playwright via @japa/browser-client)

### Page Interactions
- [ ] `visit()` uses route helpers: `visit(route('page.name'))`
- [ ] Assertions use `assertTextContains`, `assertElementExists`, etc.
- [ ] Wait for elements before asserting (avoid flaky race conditions)
- [ ] Authenticated flows use `browserContext.loginAs(user)`

### Reliability
- [ ] No hardcoded `sleep()` or `waitForTimeout()` — use element-based waits
- [ ] Tests don't depend on animation timing
- [ ] Selectors use data-testid or semantic selectors, not CSS classes
- [ ] Screenshots or traces captured on failure for debugging

### What to Browser-Test
- [ ] Critical user flows: login, signup, main navigation
- [ ] JavaScript-dependent interactions (Alpine.js components)
- [ ] Form submission and validation error display
- [ ] Don't duplicate what HTTP tests already cover — browser tests are slower

## Test Quality Signals

### Red Flags
- [ ] Test name describes behavior, not implementation: "creates user with valid input" not "calls User.create"
- [ ] No `console.log` left in tests
- [ ] No `.skip` or `.todo` without a tracking issue
- [ ] No overly broad assertions: `assert.isObject(result)` tells you nothing
- [ ] Tests don't mock what they should integrate with (DB, auth framework)

### Integration vs Unit
- [ ] Unit tests for pure business logic (calculations, transformations)
- [ ] Integration tests for controller + DB + validation flow
- [ ] Browser tests for JS-dependent UI behavior only
- [ ] Don't unit-test framework code (Lucid queries, VineJS schemas)
