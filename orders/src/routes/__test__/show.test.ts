import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket, TicketDoc } from '../../models/ticket';

const buildTicket = async () => {
  // create ticket and save
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Ordered ticket success',
    price: 20,
  });
  await ticket.save();
  return ticket;
};

const buildOrder = async (ticket: TicketDoc, cookie: string[]) => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie[0])
    .send({
      ticketId: ticket.id,
    });
  expect(response.status).toEqual(201);
  return response;
};

it('Returns order for a particular orderid ', async () => {
  // Create 3 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  //users:
  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order ads User 1
  const { body: orderOne } = await buildOrder(ticketOne, userOne);

  // Create 2 orders as user 2
  const { body: orderTwo } = await buildOrder(ticketTwo, userTwo);
  const { body: orderThree } = await buildOrder(ticketThree, userTwo);

  // Make request to get Orders for user 2
  const response = await request(app)
    .get(`/api/orders/${orderTwo.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(200);
  //console.log(response.body);

  // Expect to ensure that the first ticket is not in the list

  expect(response.body.id).toEqual(orderTwo.id);
});

it('Returns unauthorized error for a particular orderid where the userid is not the same', async () => {
  // Create 3 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  //users:
  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order ads User 1
  const { body: orderOne } = await buildOrder(ticketOne, userOne);

  // Create 2 orders as user 2
  const { body: orderTwo } = await buildOrder(ticketTwo, userTwo);
  const { body: orderThree } = await buildOrder(ticketThree, userTwo);

  // Make request to get Orders for user 2
  const response = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
  //console.log(response.body);

  // Expect to ensure that the first ticket is not in the list

  expect(response.body.id).not.toEqual(orderTwo.id);
});
