import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface PayLoad {
  orderId: string;
}

const expirationQueue = new Queue<PayLoad>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// Process upon completion
expirationQueue.process(async (job) => {
  console.log(
    'Publishing expiration complete event for orderId',
    job.data.orderId
  );
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
