import test from 'japa'
import supertest from 'supertest'
const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`


test.group('Game', () => {

  test('ensure game is created', async (assert) => {
    const requestAdmin = await supertest(BASE_URL).post('/login').send({
      email: 'admin@loterica.com',
      password: 'secret'
    }).expect(200)
    
    const token = requestAdmin.body['token'].token
    
    const requestGame = await supertest(BASE_URL).post('/games').send({
      type: "Super sena",
	    description: "The bets for this year's contest enshrined on Tuesday (16) and can be placed until 5:00 pm (Brasilia tim.",
	    range: 60,
	    price: 4.50,
	    max_number: 6,
	    color: "#4169E1"
    }).set('Authorization', 'bearer ' + token).expect(200)

    const game = requestGame.body
    assert.equal(game.type, 'Super sena')
  })

  test('ensure game is read', async (assert) => {
    const requestAdmin = await supertest(BASE_URL).post('/login').send({
      email: 'admin@loterica.com',
      password: 'secret'
    }).expect(200)
    
    const token = requestAdmin.body['token'].token
    const requestGame = await supertest(BASE_URL).get('/games')
    .expect(200)
    .set('Authorization', 'bearer ' + token)

    const games = requestGame.body
    assert.exists(games)
  })

  test('ensure game is deleted', async (assert) => {
    const requestAdmin = await supertest(BASE_URL).post('/login').send({
      email: 'admin@loterica.com',
      password: 'secret'
    }).expect(200)
    
    const token = requestAdmin.body['token'].token

    const requestGame = await supertest(BASE_URL).delete('/games/' + '4').expect(200).set('Authorization', 'bearer '+ token)
    const games =  await supertest(BASE_URL).get('/games')
    .expect(200)
    .set('Authorization', 'bearer ' + token)

    // Since 3 games are created in seeders, one game is created inside the test file, deleting the last one
    // will make the games length return to 3
    assert.equal(games.body.types.length, 3)
    assert.equal(requestGame.body.message, 'Game succesfully deleted')
  })

  test('ensure game is updated', async (assert) => {
    const requestAdmin = await supertest(BASE_URL).post('/login').send({
      email: 'admin@loterica.com',
      password: 'secret'
    }).expect(200)
    const token = requestAdmin.body['token'].token

    const requestGame = await supertest(BASE_URL).put('/games/' + '3').send({
      type: "Mega da virada",
	    description: "The bets for this year's contest enshrined on Tuesday (16) and can be placed until 5:00 pm (Brasilia tim.",
	    range: 60,
	    price: 4.50,
	    max_number: 6,
	    color: "#4169E1"
    }).expect(200).set('Authorization', 'bearer ' + token)

    const requestUpdatedGame = await supertest(BASE_URL).get('/games/' + '3').expect(200).set('Authorization', 'bearer ' + token)
    const updatedGame = requestUpdatedGame.body

    assert.equal(updatedGame.type, requestGame.body.type)
  
  })
})