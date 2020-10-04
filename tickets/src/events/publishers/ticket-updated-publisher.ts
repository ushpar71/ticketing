import { Publisher, TicketUpdatedEvent, Subjects } from '@prtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
