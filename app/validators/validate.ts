import type { z } from 'zod'
import type { HttpContext } from '@adonisjs/core/http'
import { ValidationException } from '#exceptions/validation_exception'

/**
 * Parse request body with a Zod schema. On validation failure, flashes
 * errors and old input to the session and redirects back.
 *
 * Throws ValidationException to abort the controller — callers should
 * NOT wrap this in try/catch unless they re-throw.
 */
export async function validate<T extends z.ZodTypeAny>(
  ctx: HttpContext,
  schema: T,
  { flashExcept = ['password', 'passwordConfirmation'] }: { flashExcept?: string[] } = {}
): Promise<z.infer<T>> {
  const result = schema.safeParse(ctx.request.all())

  if (result.success) {
    return result.data
  }

  const errors = result.error.flatten().fieldErrors
  const formatted: Record<string, string[]> = {}
  for (const [field, messages] of Object.entries(errors)) {
    if (messages) {
      formatted[field] = messages
    }
  }

  ctx.session.flashValidationErrors(formatted)
  ctx.session.flashExcept(flashExcept)
  ctx.response.redirect('back')

  throw new ValidationException()
}
