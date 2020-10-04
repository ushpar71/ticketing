import request from 'supertest';
import { app } from '../../app';

it('Clears cookie after signing out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'as111234',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  //console.log(response.get('Set-Cookie'));
  // check the response header to see if Cookie is set
  //expect(response.get('Set-Cookie')).toBeDefined();
  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
