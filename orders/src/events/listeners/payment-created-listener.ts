import { Message } from 'node-nats-streaming';

import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  OrderStatus,
  NotFoundError,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    console.log('----------- Order :: Payment Created Event --------------');
    console.log('  data:', data);

    // process event
    // Saving Payment info into the local Payment collection for the populate method on Payment for an order
    //Everytime a Payment is created the Payment collection within order is added
    const { orderId } = data;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    order.set({ status: OrderStatus.Complete });
    //ideally we need to add another event for order updated
    // so they can ignore the order going forward as the order is completed.

    await order.save();

    msg.ack(); // mark as successfully processed messages
  }
}
