import { Publisher, OrderCreatedEvent, Subjects } from '@prtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
