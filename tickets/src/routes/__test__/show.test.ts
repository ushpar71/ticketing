import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns 404 if ticket is not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns ticket if ticket id is valid', async () => {
  const title = 'This is a valid Title';
  const price = 25;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketresponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
});
