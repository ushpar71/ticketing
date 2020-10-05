import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  console.log('Orders Service Starting......');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

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

    // Start listening to events
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    // Start Expiration listening to events
    new ExpirationCompleteListener(natsWrapper.client).listen();

    // Mongoose connection
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('orders Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Orders Service: Listening on port 3000  !!!!!!!!');
  });
};

start();
