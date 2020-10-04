import { Message } from 'node-nats-streaming';

import {
  Listener,
  TicketUpdatedEvent,
  Subjects,
  NotFoundError,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log('----------- Order :: Ticket Updated Event --------------');
    console.log('  data:', data);

    // process event
    // Saving ticket info into the local ticket collection for the populate method on ticket for an order
    //Everytime a ticket is created the ticket collection within order is added
    const { id, title, price, version } = data;

    //find the ticket from the database lookin for prvious version and the id in the data
    // this methind is in the Ticket Model for ease of generalization
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new NotFoundError();
    }

    //Mongoose if current update version
    ticket.set({ title, price });
    // Non Mongoose update if current version
    //ticket.set({ title, price, version });

    await ticket.save();

    msg.ack(); // mark as successfully processed messages
  }
}
