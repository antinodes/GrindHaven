import { test } from '@japa/runner'

test.group('Auth routes', () => {
  test('GET /login returns 200', async ({ client }) => {
    const response = await client.get('/login')
    response.assertStatus(200)
  })

  test('GET /signup returns 200', async ({ client }) => {
    const response = await client.get('/signup')
    response.assertStatus(200)
  })

  test('POST /login with invalid credentials returns error', async ({ client }) => {
    const response = await client
      .post('/login')
      .withCsrfToken()
      .form({
        email: 'nonexistent@test.com',
        password: 'wrongpassword',
      })
      .redirects(0)
    response.assertStatus(302)
  })

  test('POST /signup with missing fields redirects back', async ({ client }) => {
    const response = await client
      .post('/signup')
      .withCsrfToken()
      .form({
        email: '',
        password: '',
        passwordConfirmation: '',
      })
      .redirects(0)
    response.assertStatus(302)
  })

  test('POST /logout without auth redirects', async ({ client }) => {
    const response = await client.post('/logout').withCsrfToken().redirects(0)
    response.assertStatus(302)
  })
})
