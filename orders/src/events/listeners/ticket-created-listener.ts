import { Message } from 'node-nats-streaming';

import { Listener, TicketCreatedEvent, Subjects } from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('----------- Order :: Ticket Created Event --------------');
    console.log('  data:', data);

    // process event
    // Saving ticket info into the local ticket collection for the populate method on ticket for an order
    //Everytime a ticket is created the ticket collection within order is added
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    msg.ack(); // mark as successfully processed messages
  }
}
