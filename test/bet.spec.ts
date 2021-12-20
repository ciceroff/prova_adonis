import test from 'japa'
import supertest from 'supertest'
const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Bet', () =>{
  test('ensure user can bet', async (assert) => {
    const requestAdmin = await supertest(BASE_URL).post('/login').send({
      email: 'admin@loterica.com',
      password: 'secret'
    }).expect(200)
    
    const token = requestAdmin.body['token'].token
    
    const numbers = Array.from({length: 6}, () => Math.floor(Math.random() * (60 - 1) + 1));
    const requestBet = await supertest(BASE_URL).post('/bets').send({
      bets: [
        {
          game_id: 2,
          filled_numbers: numbers
        }
      ]
    }).expect(200).set('Authorization', 'bearer ' + token)

    const bet = requestBet.body
    assert.equal(bet.message, 'Your bets were succesfully done')
  })
})