import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedEvent, OrderStatus } from '@prtickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of the Listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 122,
    userId: 'fake user',
  });
  await ticket.save();

  // create a Order
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    expiresAt: new Date().toISOString(),
    ticket: { id: ticket.id, price: ticket.price },
    userId: ticket.userId,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('sets the orderid of the ticket', async () => {
  //call setup
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updticket = await Ticket.findById(ticket.id);
  expect(updticket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  //call setup
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assestions that ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes as ticket updated event', async () => {
  //call setup
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //checking to see if the nats recieved all the details correctly.
  // @ts-ignore
  //console.log(natsWrapper.client.publish.mock.calls);

  // @ts-ignore
  // console.log(natsWrapper.client.publish.mock.calls[0][1]);

  // how to avoid the @ts-ignore for the mock error
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
