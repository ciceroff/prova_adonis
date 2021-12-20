import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', () => {
  
  test('ensure user is created', async (assert) => {
    const request = await supertest(BASE_URL).post('/users').send(
      {
        name: 'Cicero',
        email: 'cicero.fernandes@gmail.com',
        password: 'secret',
        password_confirmation: 'secret'
      }
    ).expect(200).expect('Content-type', /json/)

    const user = request.body
    
    assert.equal(user.name, 'Cicero')
    assert.equal(user.id, 2)
  })  
  
  test('ensure user is authenticated', async (assert) => {
    await supertest(BASE_URL).post('/users').send(
      {
        name: 'Cicero',
        email: 'cicero.fernandes@gmail.com',
        password: 'secret',
        password_confirmation: 'secret'
      }
    ).expect(200)

    const request = await supertest(BASE_URL).post('/login').send({
      email: 'cicero.fernandes@gmail.com',
      password: 'secret'
    }).expect(200)

    const userAuthenticated = request.body
    assert.equal(userAuthenticated.token.type, 'bearer')
    assert.equal(userAuthenticated.user[0].email, 'cicero.fernandes@gmail.com')
  })
})