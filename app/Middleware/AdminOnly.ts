import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'

export default class Admin{
  public async handle({auth, response}: HttpContextContract, next:() => Promise<void>){
    const userId = auth.use('api').user?.id 
    const role = await Role.findByOrFail('role_name', 'admin')
    
    if(userId && role){
      const check = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)
    if(check.length == 0){
      return response.status(403).json({'message':'Only admin user have access to this method'})
    }
    await next()
  }
  
  }
}