import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

/**
 * User model represents a user in the application.
 * It extends UserSchema and includes authentication capabilities
 * through the withAuthFinder mixin.
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * Get the user's initials from their full name or email.
   * Returns the first letter of first and last name if available,
   * otherwise returns the first two characters of the email username.
   */
  get initials() {
    if (this.fullName) {
      const parts = this.fullName.split(/\s+/)
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase()
      }
      return parts[0].slice(0, 2).toUpperCase()
    }
    return this.email.split('@')[0].slice(0, 2).toUpperCase()
  }
}
