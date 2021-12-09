import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Bets extends BaseSchema {
  protected tableName = 'bets'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('games.id').onDelete('cascade').onUpdate('cascade')
      table.integer('user_id').unsigned().references('users.id').onDelete('cascade').onUpdate('cascade')
      table.string('filled_numbers').notNullable()
      table.unique(['game_id','user_id','filled_numbers'])
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
