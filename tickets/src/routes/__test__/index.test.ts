import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const createTicket = (ticketno: number, price: number) => {
  //create a ticket
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Ticket:' + ticketno,
      price: price,
    });
};

it('fetch a list of tickets', async () => {
  //create tickets
  await createTicket(1, 10);
  await createTicket(2, 20);
  await createTicket(3, 25);
  await createTicket(4, 30);

  const ticketsresponse = await request(app)
    .get(`/api/tickets`)
    .send()
    .expect(200);

  expect(ticketsresponse.body.length).toEqual(4);
});
