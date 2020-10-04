import { Publisher, TicketCreatedEvent, Subjects } from '@prtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
