import { Message } from 'node-nats-streaming';

import { Listener, OrderCreatedEvent, Subjects } from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log('----------- Payments :: Order Created Event --------------');
    console.log('  data:', data);

    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    msg.ack(); // mark as successfully processed messages
  }
}
