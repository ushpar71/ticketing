import request from 'supertest';
import { app } from '../../app';

it('Returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'password',
    })
    .expect(201);
});

it('Returns a 400 on with and invalid email signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'ass',
      password: 'password',
    })
    .expect(400);
});

it('Returns a 400 on with and invalid password signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'A@B.COM',
      password: 'pas',
    })
    .expect(400);
});

it('Returns a 400 on with missing email and password signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.c',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'as1234',
    })
    .expect(400);

  await request(app).post('/api/users/signup').send({}).expect(400);
});

it('Disallow duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'as1234',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'as1234',
    })
    .expect(400);
});

it('Sets up cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'as111234',
    })
    .expect(201);

  // check the response header to see if Cookie is set
  expect(response.get('Set-Cookie')).toBeDefined();
});
