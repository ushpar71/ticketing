import { Message } from 'node-nats-streaming';

import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  NotFoundError,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    console.log('----------- Tickets:: Order Cancelled --------------');
    //console.log('  Data:', data);
    // find the ticket that the order reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //throw error if ticket is not found
    if (!ticket) {
      throw new NotFoundError();
    }

    //ToDo: verify if this is needed
    // if (ticket.orderId !== data.id) {
    //   throw new NotFoundError();
    // }

    // reset the ticket with the Order Id = undefined .  Dont use null
    ticket.set({ orderId: undefined });

    // save the ticket
    await ticket.save();

    // emit a change event
    // emit a Ticket updated event. This is essential !!!!!!! ,
    // Make it await as well.. so ack is not called if there is an issue
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    //ack
    msg.ack(); // mark as processed messages
  }
}
