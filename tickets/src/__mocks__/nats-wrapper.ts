import { Publisher } from '@prtickets/common';

export const natsWrapper = {
  client: {
    // publish: (subject: string, data: string, callback: () => void) => {
    //   callback();
    // },
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
