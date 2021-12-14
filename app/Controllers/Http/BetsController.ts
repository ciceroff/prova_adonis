import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Bet from 'App/Models/Bet'
import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'
import Role from 'App/Models/Role'

export default class BetsController {
  public async index( {auth}: HttpContextContract) {
    const userId = auth.use('api').user?.id 
    const role = await Role.findByOrFail('role_name', 'admin')
    
    if(userId && role){
      const check = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)
    
    if(check.length > 0){
      return Bet.all()
    }

    const bets = Bet.findBy('user_id', userId)
    return bets
    }
  }

  public async store({request, response, auth}: HttpContextContract) {
    const bets = request.body().bets
    const cart = await Cart.findOrFail(1)      
    let soma: number = 0
    const userId = auth.use('api').user?.id 
    if (!userId) return 'Authentication error'

    for(let i = 0; i < bets.length; i++) {
      const game = await Game.findBy('id', bets[i].game_id)
      if (!game)
        return response.badRequest(`There is no game with ID: ${bets[i].game_id}`)
      soma += game.price
      
    };
   
    if(soma < cart.minCartValue)
      return 'The cart should have at least a $30 price'
    
    for(let i = 0; i < bets.length; i++ ){
      const game = await Game.findByOrFail('id', bets[i].game_id)
      if (!game)
        return response.badRequest(`There is no game with ID: ${bets[i].game_id}`)
      
        const numbers:Array<number> = bets[i].filled_numbers.sort((n1: number, n2: number) => n1 - n2)
      
      if(await Bet.findBy('filled_numbers', numbers.toString()))
        return 'You already made this bet, please check out your numbers'
      
        Bet.create({
        userId,
        gameId: bets[i].game_id,
        filledNumbers: numbers.toString()
      }
        )
    };
  }

  public async show({response, request, auth}: HttpContextContract) {
    const {id} = request.params()
    const userId = auth.use('api').user?.id
    const bet = await Bet.findBy('id', id)
    const role = await Role.findByOrFail('role_name', 'admin')

    if(!bet)
      return response.badRequest('There is no bet with this ID!')

    if(userId){
      const check = await Database.from('bets').where('user_id', userId).where('id', bet.id)

      if(check.length > 0) return bet

      const checkAdmin = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)

      if (checkAdmin.length > 0)  return bet

      return 'This bet does not belong to you'
    }
  }

  public async update({}: HttpContextContract) {}

  public async destroy({request, response, auth}: HttpContextContract) {
    const {id} = request.params()
    const userId = auth.use('api').user?.id
    const bet = await Bet.findBy('id', id)
    const role = await Role.findByOrFail('role_name', 'admin')

    if(!bet)
      return response.badRequest('There is no bet with this ID!')

    if(userId){
      const check = await Database.from('bets').where('user_id', userId).where('id', bet.id)

      if(check.length > 0) bet.delete()

      const checkAdmin = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)

      if (checkAdmin.length > 0) bet.delete()
      else
      return 'This bet does not belong to you'
    }

    return 'Bet succesfully deleted'
  }
}
