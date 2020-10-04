import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@prtickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
