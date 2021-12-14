import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class GameValidator{
  constructor(protected ctx: HttpContextContract){}

  public schema = schema.create({
    type: schema.string(),
    description: schema.string(),
    range: schema.number(),
    price: schema.number(),
    max_number: schema.number(),
    color: schema.string()
  })
}