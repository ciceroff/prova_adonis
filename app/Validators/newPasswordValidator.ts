import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {schema, rules} from '@ioc:Adonis/Core/Validator'

export default class PasswordValidator{
  constructor(protected ctx: HttpContextContract){}

  public schema = schema.create({
    email: schema.string({},[
        rules.email()
    ])
  })
}