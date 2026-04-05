import { test } from '@japa/runner'

test.group('Home page', () => {
  test('renders the home page', async ({ visit }) => {
    const page = await visit('/')
    await page.assertTextContains('body', 'Hypermedia')
  })

  test('shows navigation links', async ({ visit }) => {
    const page = await visit('/')
    await page.assertExists('nav')
  })
})
