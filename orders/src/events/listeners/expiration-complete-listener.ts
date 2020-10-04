import { Message } from 'node-nats-streaming';

import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@prtickets/common';
import { queueGroupName } from './queue-group-name';

import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    console.log(
      '----------- Order :: Expiration Complete Event --------------'
    );
    console.log('  data:', data);

    // process event
    // Saving ticket info into the local ticket collection for the populate method on ticket for an order
    //Everytime a ticket is created the ticket collection within order is adde

    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.status === OrderStatus.Complete) {
      console.log(
        'order has already been completed. Not cancelling the order:',
        order.id
      );
      // ack the messag early
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack(); // mark as successfully processed messages
  }
}
