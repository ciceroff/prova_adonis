import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {schema} from '@ioc:Adonis/Core/Validator'

export default class ProfileValidator{
  constructor(protected ctx: HttpContextContract){}

  public schema = schema.create({
    user_id: schema.number(),
    role_id: schema.number()
  })
}