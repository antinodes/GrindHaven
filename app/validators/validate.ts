import type { z } from 'zod'
import type { HttpContext } from '@adonisjs/core/http'
import { ValidationException } from '#exceptions/validation_exception'

/**
 * Parse request body with a Zod schema. On validation failure, flashes
 * errors and old input to the session and redirects back.
 *
 * Writes directly to the session flash store (inputErrorsBag + errorsBag)
 * rather than using flashValidationErrors(), which expects VineJS-shaped
 * error arrays that don't match Zod's output format.
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

  const fieldErrors = result.error.flatten().fieldErrors
  const errorsBag: Record<string, string[]> = Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] => !!entry[1])
  )

  ctx.session.flash('inputErrorsBag', errorsBag)
  ctx.session.flash('errorsBag', {
    E_VALIDATION_ERROR: 'Please check the form for errors.',
  })
  ctx.session.flashExcept(flashExcept)
  ctx.response.redirect('back')

  throw new ValidationException()
}
