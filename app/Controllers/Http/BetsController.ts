import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Bet from 'App/Models/Bet'
import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'
import Role from 'App/Models/Role'
import BetValidator from 'App/Validators/betValidator'

export default class BetsController {
  public async index( {auth}: HttpContextContract) {
    const userId = auth.use('api').user?.id 
    const role = await Role.findByOrFail('role_name', 'admin')
    
    if(userId && role){
      const check = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)

      if(check.length > 0){
        const bet = await Bet.all()
        let adminShow:[{}] = [{}]
        adminShow.pop()
        
        for(let i = 0; i < bet.length; i++){
          adminShow.push({
            "id" : bet[i].id,
            "game_id": bet[i].gameId,
            "user_id": userId,
            "filled_numbers": bet[i].filledNumbers.split(',').map(Number),
            "created_at": bet[i].createdAt,
            "updated_at": bet[i].updatedAt
          })
      }
        return adminShow
    }

      const bets = await Bet.query().where('user_id', userId)
      let userBets:[{}] = [{}]
      userBets.pop()
      for(let i = 0; i < bets.length; i++){
        userBets.push({
          "id" : bets[i].id,
          "game_id": bets[i].gameId,
          "user_id": userId,
          "filled_numbers": bets[i].filledNumbers.split(',').map(Number),
          "created_at": bets[i].createdAt,
          "updated_at": bets[i].updatedAt
        })
      }
      return userBets
  }
}
  public async store({request, response, auth}: HttpContextContract) {

    await request.validate(BetValidator)
    
    const bets = request.body().bets
    const cart = await Cart.findOrFail(1)      
    let soma: number = 0
    const user = auth.use('api').user
    if (!user) return {'message':'Authentication error'}

    for(let i = 0; i < bets.length; i++) {
      const game = await Game.findBy('id', bets[i].game_id)
      if (!game)
        return response.badRequest({'message':`There is no game with ID: ${bets[i].game_id}`})
      soma += game.price
      
    };
   
    // if(soma < cart.minCartValue)
    //   return response.status(400).json({'message':'The cart should have at least a $30 price'})
    
    for(let i = 0; i < bets.length; i++ ){
      const game = await Game.findByOrFail('id', bets[i].game_id)
      if (!game)
        return response.badRequest(`There is no game with ID: ${bets[i].game_id}`)
      
        const numbers:Array<number> = bets[i].filled_numbers.sort((n1: number, n2: number) => n1 - n2)
      
      const checkBet = await Bet.query().where('filled_numbers', numbers.toString()).where('user_id', user.id).where('game_id', game.id)
      if(checkBet.length > 0)
        return {'message':'You already made this bet, please check out your numbers'}
      try{
        Bet.create({
        userId: user.id,
        gameId: bets[i].game_id,
        filledNumbers: numbers.toString()
        }
        )
      }catch(error){
        console.log('oi')
        console.log(error)
        return error.detail
      }
    };
    await Mail.sendLater((message) => {
      message.subject('New bet registered'),
      message.from('loterica@gmail.com').to(user.email).htmlView('emails/new_bet', {
        
      })
    })
    return {'message':'Your bets were succesfully done'}
  }

  public async show({response, request, auth}: HttpContextContract) {
    const {id} = request.params()
    const userId = auth.use('api').user?.id
    const bet = await Bet.findByOrFail('id', id)
    let userBet: object
    userBet = {
      "id" : bet.id,
      "game_id": bet.gameId,
      "user_id": userId,
      "filled_numbers": bet.filledNumbers.split(',').map(Number),
      "created_at": bet.createdAt,
      "updated_at": bet.updatedAt
    }
    const role = await Role.findByOrFail('role_name', 'admin')

    if(!bet)
      return response.badRequest('There is no bet with this ID!')

    if(userId){
      const check = await Database.from('bets').where('user_id', userId).where('id', bet.id)

      if(check.length > 0) return userBet

      const checkAdmin = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)

      if (checkAdmin.length > 0)  return userBet

      return {message: 'This bet does not belong to you'}
    }
  }

  public async destroy({request, response, auth}: HttpContextContract) {
    const {id} = request.params()
    const userId = auth.use('api').user?.id
    const bet = await Bet.findBy('id', id)
    const role = await Role.findByOrFail('role_name', 'admin')

    if(!bet)
      return response.badRequest({'message':'There is no bet with this ID!'})

    if(userId){
      const check = await Database.from('bets').where('user_id', userId).where('id', bet.id)

      if(check.length > 0) bet.delete()

      const checkAdmin = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)

      if (checkAdmin.length > 0) bet.delete()
      else
      return response.status(403).json({'message': 'This bet does not belong to you'})
    }

    return response.status(200).json({'message': 'Bet succesfully deleted'})
  }
}
