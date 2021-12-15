import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Role from 'App/Models/Role';

import User from "App/Models/User";
import ProfileValidator from 'App/Validators/profileRelationValidator';

export default class UserRolesController {
  public async store({request, response}:HttpContextContract){
    await request.validate(ProfileValidator)
    const { user_id, role_id } = request.body()

    const user = await User.findBy('id', user_id)
    const role = await Role.findBy('id', role_id)
   
    if(!user)  
      return response.badRequest({'message':'There is no user with this ID!'})

    if(!role) 
      return response.badRequest({'message':'There is no role with this ID!'})

    const checkRelation = await Database.query().from('user_roles').where('user_id', user_id).where('role_id',role_id)
    if(checkRelation.length > 0) return response.badRequest('The user already have this profile type')
    
    await user.related('roles').attach([role.id])
    return {message: "User's profile succesfully updated"}
  }
}
