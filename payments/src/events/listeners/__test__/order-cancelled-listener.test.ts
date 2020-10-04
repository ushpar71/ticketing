import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import {
  OrderCreatedEvent,
  OrderCancelledEvent,
  OrderStatus,
} from '@prtickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';

const setup = async () => {
  // create instance of the Listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'fake user',
    price: 324.56,
    status: OrderStatus.Created,
  });
  await order.save();

  // create a Order
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: { id: 'asdfk' },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('cancels the order info', async () => {
  //call setup
  const { listener, data, msg, order } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was Cancelled
  const updOrder = await Order.findById(order.id);
  expect(updOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  //call setup
  const { listener, data, msg, order } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assestions that ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
