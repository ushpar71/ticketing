import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedEvent, OrderStatus } from '@prtickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';

const setup = async () => {
  // create instance of the Listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create a Order
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    expiresAt: new Date().toISOString(),
    ticket: { id: 'fake ticket', price: 20 },
    userId: 'fake user',
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  //call setup
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  //call setup
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assestions that ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
