import mongoose, { Mongoose } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from '../models/order';

// An interface that describes the properties that are required to create a new Ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties that a Ticket Document
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;

  // add this function to keep things cleaner
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      // this is for ensureing that return data is formated in the way we need.
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

//usage of versioning in mongodb and mongoose. we will rename _v to version using this
ticketSchema.set('versionKey', 'version');
// Mongoose if current update version
ticketSchema.plugin(updateIfCurrentPlugin);

// Non-Mongoose if current update version
// ticketSchema.pre('save', function (done) {
//   //typscript does not know $where so we can ignore it.
//   //@ts-ignore
//   this.$where = {
//     version: this.get('version') - 1,
//   };
//   done();
// });

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  //return new Ticket(attrs);  // we cannot pass the attrs as is. _id will be different. so we need to ensure _id =id  hence add them one by one

  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

//function key word is nessary here
ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called

  // Look at all Orders , find an order where the ticket is what we found and the order status is not cancelled
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder; // return boolean
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
