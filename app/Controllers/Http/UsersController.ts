import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bet from 'App/Models/Bet'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import moment from 'moment'
export default class UsersController {
  public async index({}: HttpContextContract) {
    return User.all()
  }

  public async store({request}: HttpContextContract) {
    const { name, email, password} = request.body()

    const user = await User.create({
      name,
      email,
      password
    })
    const role = await Role.findByOrFail('role_name', 'player')
    await user.related('roles').attach([role.id])

    return user
  }

  public async show({request, response}: HttpContextContract) {
    const { id } = request.params()

    const user = await User.findBy('id', id)
    
    if(!user)
      return response.badRequest('There is no user with this ID!')
    
    const lastMonth = moment().startOf('day').subtract('1', 'month').toDate()
    const bets = await Bet.query().where('user_id', id).where('created_at', '>', lastMonth)
    return {user, bets}
  } 

  public async update({request, response}: HttpContextContract) {
    const {id} = request.params()
    const {name, email, password} = request.body()
    const user = await User.findBy('id', id)

    if(!user)
      return response.badRequest('There is no user with this ID!')

    try {

      user.name = name
      user.email = email
      user.password = password
      user.save()
      return user

    } catch (error) {
      return error.detail
    }
  }

  public async destroy({request, response}: HttpContextContract) {
    const {id} = request.params()
    const user = await User.findBy('id', id)

    if(!user)
      return response.badRequest('There is no user with this ID!')

    user.delete()
    return {message: "User succesfully deleted"}
  }
}
