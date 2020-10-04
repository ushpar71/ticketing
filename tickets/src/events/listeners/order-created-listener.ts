import { Message } from 'node-nats-streaming';

import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  NotFoundError,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log('----------- Tickets:: Order Created --------------');
    //console.log('  Data:', data);

    // process event
    // Saving ticket info into the local ticket collection for the populate method on ticket for an order
    //Everytime a ticket is created the ticket collection within order is added

    // find the ticket that the order reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //throw error if ticket is not found
    if (!ticket) {
      throw new NotFoundError();
    }

    // Mark the ticket with the Order Id
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save();

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

    // acknowledge the message
    msg.ack(); // mark as processed messages
  }
}
