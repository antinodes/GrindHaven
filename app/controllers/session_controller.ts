import User from '#models/user'
import { loginSchema } from '#validators/user'
import { validate } from '#validators/validate'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async store(ctx: HttpContext) {
    const { email, password } = await validate(ctx, loginSchema)
    const user = await User.verifyCredentials(email, password)

    await ctx.auth.use('web').login(user)
    ctx.response.redirect().toRoute('home')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
