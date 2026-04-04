import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import app from '@adonisjs/core/services/app'
import User from '#models/user'

/**
 * In development, automatically logs in as the default seeded user
 * so you don't have to sign in manually every time the server restarts.
 * Only active in development. Applied only to routes that need auto-login
 * (not guest routes like login/signup).
 */
export default class DevAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!app.inDev || ctx.auth.use('web').isAuthenticated) {
      return next()
    }

    try {
      const user = await User.findBy('email', 'dev@grindhaven.local')
      if (user) {
        await ctx.auth.use('web').login(user)
      } else {
        ctx.logger.warn('DevAuth: dev user not found. Run "node ace db:seed" to create it.')
      }
    } catch (error) {
      ctx.logger.warn({ err: error }, 'DevAuth: could not auto-login dev user')
    }

    return next()
  }
}
