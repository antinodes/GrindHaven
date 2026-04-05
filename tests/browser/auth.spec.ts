import { test } from '@japa/runner'

test.group('Auth pages', () => {
  test('login page renders', async ({ visit }) => {
    const page = await visit('/login')
    await page.assertTextContains('h1', 'Login')
  })

  test('signup page renders', async ({ visit }) => {
    const page = await visit('/signup')
    await page.assertTextContains('h1', 'Signup')
  })

  test('login form has email and password fields', async ({ visit }) => {
    const page = await visit('/login')
    await page.assertExists('input[name="email"]')
    await page.assertExists('input[name="password"]')
  })

  test('signup form has all required fields', async ({ visit }) => {
    const page = await visit('/signup')
    await page.assertExists('input[name="email"]')
    await page.assertExists('input[name="password"]')
    await page.assertExists('input[name="passwordConfirmation"]')
  })
})
