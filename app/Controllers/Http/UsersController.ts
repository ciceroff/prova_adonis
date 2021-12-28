import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Bet from 'App/Models/Bet'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import UserValidator from 'App/Validators/userValidators'
import moment from 'moment'
import { Kafka } from 'kafkajs'
export default class UsersController {
  public async index({}: HttpContextContract) {
    return User.all()
  }

  public async store({request}: HttpContextContract) {

    const kafka = new Kafka({
      brokers: ['localhost:9092']
    })

    await request.validate(UserValidator)
    
    const { name, email, password} = request.body()
    try{
      const user = await User.create({
        name,
        email,
        password
    })
      const role = await Role.findByOrFail('role_name', 'player')
      await user.related('roles').attach([role.id])
      const producer = kafka.producer()
      
      await producer.connect()
     
      await producer.send({
        topic: 'new-user',
        messages:[
          {value: JSON.stringify(user)},
        ]
      })
      // await Mail.sendLater((message) => {
      //   message.subject('Welcome'),
      //   message.from('loterica@gmail.com').to(user.email).htmlView('emails/welcome', {
      //     fullName: user.name,
      //   })
      // })
      
      return user
    }catch(error){
      return error.detail
    }
  }

  public async show({request, response}: HttpContextContract) {
    const { id } = request.params()

    const user = await User.findBy('id', id)
    
    if(!user)
      return response.badRequest({'message':'There is no user with this ID!'})
    
    const lastMonth = moment().startOf('day').subtract('1', 'month').toDate()
    const bets = await Bet.query().where('user_id', id).where('created_at', '>', lastMonth)
    let userBets:[{}] = [{}]
    userBets.pop()
    for(let i = 0; i < bets.length; i++){
      userBets.push({
        "id" : bets[i].id,
        "game_id": bets[i].gameId,
        "user_id": user.id,
        "filled_numbers": bets[i].filledNumbers.split(',').map(Number),
        "created_at": bets[i].createdAt,
        "updated_at": bets[i].updatedAt
      })
    }
    return {user, userBets}
  } 

  public async update({request, response, auth}: HttpContextContract) {
    const {id} = request.params()
    const {name, email, password} = request.body()
    const user = await User.findBy('id', id)
    const userId = auth.use('api').user?.id
    const role = await Role.findByOrFail('role_name', 'admin')

    if(!user)
      return response.badRequest({'message':'There is no user with this ID!'})

    if(userId && role){
      const check = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)
      if(check.length > 0 || id === userId){
        try {
          
          user.name = name
          user.email = email
          user.password = password
          user.save()
          return user

        } catch (error) {
          return error.detail
        }
      }else{
        return response.status(405).json({'message': 'Only the admin or the user himself have access to this method'})
      }
    }
  }

  public async destroy({request, response, auth}: HttpContextContract) {
    const userId = auth.use('api').user?.id
    const role = await Role.findByOrFail('role_name', 'admin')
    if(userId && role){
      const check = await Database.from('user_roles').where('user_id', userId).where('role_id', role.id)
      const {id} = request.params()
      const user = await User.findBy('id', id)

      if(!user)
        return response.badRequest({'message':'There is no user with this ID!'})
      
      if(check.length > 0 || id === userId){
        user.delete()
        return {message: "User succesfully deleted"}
      }else{
        return response.status(405).json({'message':'Only the admin or the user himself have access to this method'})
      }
    }
  }
}
