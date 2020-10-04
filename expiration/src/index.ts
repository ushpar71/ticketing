import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  try {
    //NATS connection
    // converted to envirnment variable
    //const clientId = 'abc';
    //const clusterId = 'ticketing';
    //const url = 'http://nats-srv:4222'; // check the infra8 service
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    //GOOD CODE. put this here and not in the natswrapper
    // graceful closing of listener
    natsWrapper.client.on('close', () => {
      console.log(
        'NATS connection closed!!! clientId:' + process.env.NATS_CLIENT_ID,
        ' cluster:',
        process.env.NATS_CLUSTER_ID,
        ' URL:',
        process.env.NATS_URL
      );
      process.exit();
    });
    // Watch for process termination or interruption
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
