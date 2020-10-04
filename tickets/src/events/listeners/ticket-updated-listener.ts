import { Message } from 'node-nats-streaming';

import { Listener, TicketUpdatedEvent, Subjects } from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    //console.log('  Data:', data);
    msg.ack(); // mark as processed messages
  }
}
