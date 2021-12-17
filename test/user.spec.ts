import test from 'japa'
import { JSDOM } from 'jsdom'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', () => {
  
  test('ensure user is created', async (assert) => {
    const user = await supertest(BASE_URL).post('/users').send(
      {
        name: 'Cicero',
        email: 'cicero.fernandes@gmail.com',
        password: 'secret'
      }
    )
    
    
    assert.equal(user.body.name, 'Cicero')
  })  
  
})