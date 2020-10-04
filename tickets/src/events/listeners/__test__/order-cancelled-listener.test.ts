import { OrderCreatedListener } from '../order-created-listener';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent, OrderStatus } from '@prtickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of the Listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  // Ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 122,
    userId: 'fake user',
  });
  ticket.set({ orderId });
  await ticket.save();

  // create a Order
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: { id: ticket.id },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, orderId };
};

it('updates published acks sets the orderid of the ticket', async () => {
  //call setup
  const { listener, data, msg, ticket, orderId } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was cancelled
  const updticket = await Ticket.findById(ticket.id);
  expect(updticket!.orderId).not.toBeDefined();

  // write assertions that ack function is called
  expect(msg.ack).toHaveBeenCalled();

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // how to avoid the @ts-ignore for the mock error
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.orderId).not.toBeDefined();
});
