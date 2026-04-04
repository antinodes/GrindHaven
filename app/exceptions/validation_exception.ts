import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Thrown by validate() on Zod validation failure. The handle() method
 * short-circuits the exception handler so the redirect already queued
 * by validate() is preserved — without this, the base handler would
 * overwrite the redirect with a 422 error page.
 */
export class ValidationException extends Exception {
  constructor() {
    super('Validation failed', { status: 422, code: 'E_VALIDATION_ERROR' })
  }

  async handle(_error: this, _ctx: HttpContext) {
    // redirect and flash already set by validate(); nothing to do here
  }
}
