import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany, hasMany, HasMany, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Role from 'App/Models/Role'
import Bet from 'App/Models/Bet'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({})
  public password: string

  @column()
  public token: string | null

  @column.dateTime({})
  public tokenCreatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(()=> Role, {
    pivotTimestamps: true, 
    pivotTable: 'user_roles'
  })
  public roles: ManyToMany<typeof Role>

  @hasMany(() => Bet, {
    foreignKey: 'user_id',
  })
  public bets: HasMany<typeof Bet>
  
  @beforeSave()
  public static async hashPassword(user: User){
    if(user.$dirty.password){
      user.password = await Hash.make(user.password)
    }
  }
}
