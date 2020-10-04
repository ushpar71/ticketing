import { Publisher, OrderCancelledEvent, Subjects } from '@prtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
