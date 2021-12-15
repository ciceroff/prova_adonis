import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import RoleValidator from 'App/Validators/rolesValidator'

export default class RolesController {
  public async index({}: HttpContextContract) {
    return await Role.all()
  }

  public async store({request}: HttpContextContract) {
    await request.validate(RoleValidator)
    const { role_name } = request.body()

    try {
      const role = await Role.create({roleName: role_name})
      return role
    } catch (error) {
      return error.detail
    }
  }

  public async show({request, response}: HttpContextContract) {
    const {id} = request.params()
    const role = await Role.findBy('id', id)

    if(!role)
      return response.badRequest({'message':'There is no role with this ID!'})
    
    return role
  }

  public async update({request, response}: HttpContextContract) {
    const {id} = request.params()
    const { role_name } = request.body()
    const role = await Role.findBy('id', id)

    if(!role)
      return response.badRequest({'message':'There is no role with this ID!'})
    role.roleName = role_name
    role.save()
    return role
  }

  public async destroy({request, response}: HttpContextContract) {
    const {id} = request.params()

    const role = await Role.findBy('id',id)

    if(!role)
      return response.badRequest({'message':'There is no role with this ID!'})

    role.delete()
    return {message: "Role succesfully deleted"}
  }
}
