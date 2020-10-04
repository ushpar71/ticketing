import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent, OrderStatus } from '@prtickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of the Listner
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // create a ticket and save
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 101,
  });
  await ticket.save();

  //create order and add ticket
  const order = Order.build({
    ticket,
    userId: 'randomid',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, order };
};

// ----------------------------
//   TEST cases start
// ----------------------------

it('updates the order status to cancelled', async () => {
  //call setup
  const { listener, data, msg, ticket, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an Order Cancelled event', async () => {
  //call setup
  const { listener, data, msg, ticket, order } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  //call setup
  const { listener, data, msg, ticket, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
