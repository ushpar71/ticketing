import mongoose, { Mongoose } from 'mongoose';
import { OrderStatus } from '@prtickets/common';
import { TicketDoc } from './ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// this is done to allow for Tickets to have one import statement from orders for all order related items
export { OrderStatus };

// An interface that describes the properties that are required to create a new Order
interface OrderAttrs {
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
  userId: string;
}
// An interface that describes the properties that a Order Document
interface OrderDoc extends mongoose.Document {
  ticket: TicketDoc;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
  userId: string;
}

// An interface that describes the properties that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    userId: {
      type: String,
      required: true,
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
orderSchema.set('versionKey', 'version');

// Mongoose if current update version
orderSchema.plugin(updateIfCurrentPlugin);

// Non-Mongoose if current update version
// orderSchema.pre('save', function (done) {
//   //typscript does not know $where so we can ignore it.
//   //@ts-ignore
//   this.$where = {
//     version: this.get('version') - 1,
//   };
//   done();
// });

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
