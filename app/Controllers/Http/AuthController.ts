import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'

export default class AuthController {
  public async login({auth, request, response}:HttpContextContract){
    const email = request.input ('email')
    const password = request.input('password')
    try{
      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '30mins'
      })
      const user = auth.use('api').user
      if(user){
        const relation = await Database.query().from('user_roles').where('user_id', user.id)
        const roles:string[] = []

        for(let i = 0; i < relation.length; i++){
          const role = await Role.findBy('id', relation[i].role_id)
          if (role)
            roles.push(role.roleName)
        }
        return {token, user, roles}
      }
    }catch{
      return response.status(401).json({'message': 'Invalid credentials'})
    }
  }
}
