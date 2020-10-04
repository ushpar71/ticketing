import { Publisher, PaymentCreatedEvent, Subjects } from '@prtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
