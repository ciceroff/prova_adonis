import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'
import GameValidator from 'App/Validators/gameValidator'

export default class GamesController {
  public async index({}: HttpContextContract) {
    let types = await Game.all()
    const cart = await Cart.findByOrFail('id', 1)
    const value = cart.minCartValue
    return {"min-cart-value": value, types}
  }

  public async store({request}: HttpContextContract) {

    await request.validate(GameValidator)
    const {type, description, range, price, max_number, color} = request.body()
    try {
      const game = await Game.create({
        type, 
        description, 
        range, 
        price, 
        maxNumber: max_number, 
        color
      })
      return game
    } catch (error) {
      return error.detail
    }
  }

  public async show({request, response}: HttpContextContract) {
    const { id } = request.params()
    const game = await Game.findBy('id', id)

    return game ? game : response.badRequest({'message':'There is no game description with this id!'});
  
  }

  public async update({request, response}: HttpContextContract) {
    const { id } = request.params()
    const {type, description, range, price, max_number, color} = request.body()
    const game = await Game.findBy('id', id)

    if (!game)
      return response.badRequest({'message':'There is no game description with this id!'})

    try {
      game.type = type
      game.description = description
      game.range = range
      game.price = price
      game.maxNumber = max_number
      game.color = color
      game.save()
      return game
  } catch (error) {
      return error.detail
    }
  }

  public async destroy({request, response}: HttpContextContract) {
    const { id } = request.params()
    const game = await Game.findBy('id', id)
    
    if (!game)
      return response.badRequest({'message':'There is no game description with this id!'})
    
    game.delete()
    return {message : "Game succesfully deleted"}
  }
}
