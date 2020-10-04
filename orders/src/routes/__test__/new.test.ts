import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper'; // fake nats wrapper

it('Returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId });
  expect(response.status).toEqual(404);
});

it('returns an error if the ticket is arelady reserved', async () => {
  const ticketId = mongoose.Types.ObjectId().toHexString();
  // create ticket and save
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Ordered ticket',
    price: 20,
  });
  await ticket.save();

  //create order and pdd ticket
  const order = Order.build({
    ticket,
    userId: 'randomid',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  // try to reserve
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id });
  expect(response.status).toEqual(400);
});

it('reserves a ticket successfully', async () => {
  const ticketId = mongoose.Types.ObjectId().toHexString();
  // create ticket and save
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Ordered ticket success',
    price: 20,
  });
  await ticket.save();

  // try to reserve
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id });
  expect(response.status).toEqual(201);
});

it('emits an order created event', async () => {
  // create ticket and save
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Ordered ticket',
    price: 20,
  });
  await ticket.save();

  // add order
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  //expec that the event has been published
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
