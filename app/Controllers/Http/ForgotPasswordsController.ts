import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import PasswordValidator from 'App/Validators/newPasswordValidator'
import crypto from 'crypto'
import { Kafka } from 'kafkajs'
import { DateTime } from 'luxon'
import moment from 'moment'

export default class ForgotPasswordsController {
  public async store({request, response}: HttpContextContract){
    await request.validate(PasswordValidator)
    try {
      const kafka = new Kafka({
        brokers: ['kafka:29092']
      })

      const email = request.input('email')
      const user = await User.findByOrFail('email', email)
      user.token = crypto.randomBytes(10).toString('hex')
      user.tokenCreatedAt = DateTime.now()
      await user.save()

      const producer = kafka.producer()
      
      await producer.connect()
      
      await producer.send({
        topic: 'password-recovery',
        messages:[
          {value: JSON.stringify(user)},
        ]
      })
      await producer.disconnect()
      return response.status(204)
    }catch(error){
      return response.status(error.status).send('Something went wrong. Please check your email')
    }
  }

  public async update({request, response}:HttpContextContract){
    try {
      const {token, password} = request.body()

      const user = await User.findByOrFail('token', token)
      const tokenExpired = moment().subtract('2', 'days').isAfter(user.tokenCreatedAt)

      if(tokenExpired){
        return response.status(401).send('Your recovery token has expired')
      }

      user.token = null
      user.tokenCreatedAt = null
      user.password = password
      await user.save()
      return response.status(204)
    } catch (error) {
      return response.status(error.status).send('Something went wrong. Please check your email')
    }
  }
}
