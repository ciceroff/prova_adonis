import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Game from './Game'

export default class Bet extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public filled_numbers: string

  @column()
  public user_id: number

  @column()
  public game_id: number
  // table.integer('game_id').unsigned().references('games.id').onDelete('cascade').onUpdate('cascade')
  //     table.integer('user_id').unsigned().references('users.id').onDelete('cascade').onUpdate('cascade')
  //     table.string('filled_numbers').notNullable()
  //     table.unique(['game_id','user_id','filled_numbers'])
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Game)
  public games: HasMany<typeof Game>
}
