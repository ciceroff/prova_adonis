import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {schema, rules} from '@ioc:Adonis/Core/Validator'

export default class UserValidator{
  constructor(protected ctx: HttpContextContract){}

  public schema = schema.create({
    name: schema.string(
      { trim:true },
      [
        rules.alpha()
      ]),
    
      email: schema.string({},[
      rules.email(),  
      ]),

      password: schema.string({},[
        rules.confirmed()
      ])
  })
}