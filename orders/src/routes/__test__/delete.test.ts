import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket, TicketDoc } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper'; // fake nats wrapper

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

//#########################################
it('Delete order for a particular orderid ', async () => {
  // Create 1 ticket
  const ticketOne = await buildTicket();

  //users:
  const userOne = global.signin();
  // Create 1 order as User 1
  const { body: orderOne } = await buildOrder(ticketOne, userOne);

  // Make request to get Orders for user 1
  const response = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);
  //console.log(response.body);
  expect(response.body.id).toEqual(orderOne.id);

  // delete the order
  const deleteresponse = await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);
  //console.log(deleteresponse.body);

  // Check status has changed to Cancelled
  const updresponse = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);
  //console.log(response.body);
  // Ensure that the status was changed to Cancelled for the order
  expect(updresponse.body.status).toEqual(OrderStatus.Cancelled);
});

// ###########################################
it('Returns unauthorized error for a particular orderid where the userid is not the same', async () => {
  // Create 2 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();

  //users:
  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order ads User 1
  const { body: orderOne } = await buildOrder(ticketOne, userOne);

  // Create 2 orders as user 2
  const { body: orderTwo } = await buildOrder(ticketTwo, userTwo);

  // delete order created by User 1 using User 2
  const response = await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
  //console.log(response.body);
});

it('emits an order cancelled  event', async () => {
  // Create 1 ticket
  const ticketOne = await buildTicket();

  //users:
  const userOne = global.signin();
  // Create 1 order as User 1
  const { body: orderOne } = await buildOrder(ticketOne, userOne);

  // Make request to get Orders for user 1
  const response = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);
  //console.log(response.body);
  expect(response.body.id).toEqual(orderOne.id);

  // delete the order
  const deleteresponse = await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(204);
  //console.log(deleteresponse.body);

  //expect that the event has been published
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
