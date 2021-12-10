import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    const user = await User.create({
      name: 'Admin',
      email: 'admin@loterica.com',
      password: 'secret'
    })

    const role = await Role.create({
      roleName: 'admin'
    })

    await Role.create({
      roleName: 'player'
    })

    await user.related('roles').attach([role.id])
  }
}
