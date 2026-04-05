import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class DefaultUserSeeder extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    await User.updateOrCreate(
      { email: 'dev@grindhaven.local' },
      {
        fullName: 'Dev User',
        email: 'dev@grindhaven.local',
        password: 'password', // hashed by withAuthFinder mixin beforeSave hook
      }
    )
  }
}
