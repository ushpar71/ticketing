import request from 'supertest';
import { app } from '../../app';

it('Fails when a email that does not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'a@b.com',
      password: 'password',
    })
    .expect(400);
});

it('Fails when a incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'as111234',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'a@b.com',
      password: 'password',
    })
    .expect(400);
});

it('Respnds with a cookie with a valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'as111234',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'a@b.com',
      password: 'as111234',
    })
    .expect(200);

  // check the response header to see if Cookie is set
  expect(response.get('Set-Cookie')).toBeDefined();
});
