import User from '#models/user'
import { signupSchema } from '#validators/user'
import { validate } from '#validators/validate'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  async store(ctx: HttpContext) {
    const { fullName, email, password } = await validate(ctx, signupSchema)

    try {
      const user = await User.create({ fullName, email, password })
      await ctx.auth.use('web').login(user)
      ctx.response.redirect().toRoute('home')
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        ctx.session.flashValidationErrors({ email: ['Email already taken'] })
        ctx.session.flashExcept(['password', 'passwordConfirmation'])
        return ctx.response.redirect('back')
      }
      throw error
    }
  }
}
