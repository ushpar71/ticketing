import { Message } from 'node-nats-streaming';

import { Listener, TicketCreatedEvent, Subjects } from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('-----------Ticket Created--------------');
    //console.log('  Data:', data);

    msg.ack(); // mark as processed messages
  }
}
