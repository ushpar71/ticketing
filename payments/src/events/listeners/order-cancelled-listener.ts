import { Message } from 'node-nats-streaming';

import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  NotFoundError,
  OrderStatus,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    console.log('----------- Payments :: Order Cancelled Event --------------');
    console.log('  data:', data);

    // use findOne insted of findById m as we also want to check and process only if the version in the db is the previous version
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    msg.ack(); // mark as successfully processed messages
  }
}
