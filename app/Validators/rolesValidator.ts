import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {schema} from '@ioc:Adonis/Core/Validator'

export default class RoleValidator{
  constructor(protected ctx: HttpContextContract){}

  public schema = schema.create({
    role_name: schema.string()
  })
}