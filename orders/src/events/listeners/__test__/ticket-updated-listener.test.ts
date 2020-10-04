import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@prtickets/common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of the Listner
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create a ticket and save
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 101,
  });
  await ticket.save();

  // update a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'concert updated',
    price: 200,
    userId: 'ddddddd', // does not matter for this test
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it('finds updates and saves a ticket', async () => {
  //call setup
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created by fetching the updated ticket
  const updticket = await Ticket.findById(ticket.id);
  expect(updticket).toBeDefined();
  expect(updticket!.price).not.toEqual(ticket.price);
  expect(updticket!.title).not.toEqual(ticket.title);
  expect(updticket!.price).toEqual(data.price);
  expect(updticket!.title).toEqual(data.title);
});

it('acks the message', async () => {
  //call setup
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assestions that ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('no ack message', async () => {
  //call setup
  const { listener, data, msg } = await setup();

  data.version = 10;

  // call the onMessage function with the data object + message object
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  // write assestions that ack function is called
  expect(msg.ack).not.toHaveBeenCalled();
});
