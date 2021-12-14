import {schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

export default class BetValidator{
  constructor(protected ctx: HttpContextContract){}

  public schema = schema.create({
    bets: schema.array().members(
      schema.object().members({
        game_id: schema.number(),
        filled_numbers: schema.array().members(schema.number())
      })
    )
  })
}