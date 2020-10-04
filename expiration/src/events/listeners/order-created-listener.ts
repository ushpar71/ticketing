import { Message } from 'node-nats-streaming';

import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  NotFoundError,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log('----------- Expiration:: Order Created --------------');
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Expiration delay::', delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: delay,
      }
    );

    // acknowledge the message
    msg.ack(); // mark as processed messages
  }
}
