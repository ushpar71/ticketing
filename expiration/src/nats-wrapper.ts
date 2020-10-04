import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan; // ? to allow TS to know that the client will be defined later

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS before connecting to NATS');
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    // connect to nats
    this._client = nats.connect(clusterId, clientId, { url });

    // BAD CODE capturing close functionality here
    // // graceful closing of listener
    // this.client.on('close', () => {
    //   console.log('NATS connection closed!!! clientId:' + clientId);
    //   process.exit();
    // });
    // // Watch for process termination or interruption
    // process.on('SIGINT', () => this.client.close());
    // process.on('SIGTERM', () => this.client.close());

    //Wrap callback function as a Promise to provide async functionality
    return new Promise((resolve, reject) => {
      // resolve promise
      this.client.on('connect', () => {
        console.log(
          'NATS(wrapper): Connected to NATS for client:' + clientId,
          ' on cluster:',
          clusterId,
          ' URL:',
          url
        );
        resolve();
      });

      //reject promise
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}
// single instaance  of the NATS
export const natsWrapper = new NatsWrapper();
