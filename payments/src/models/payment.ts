import mongoose, { Mongoose } from 'mongoose';
import { OrderStatus } from '@prtickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// this is done to allow for Tickets to have one import statement from Payments for all Payment related items
export { OrderStatus };

interface PaymentAttrs {
  //id: string;
  //version: number;
  userId: string;
  orderId: string;
  stripeId: string;
  //price: number;
  //status: OrderStatus;
}

interface PaymentDoc extends mongoose.Document {
  //version: number;
  userId: string;
  orderId: string;
  stripeId: string;
  //price: number;
  //status: OrderStatus;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

PaymentSchema.set('versionKey', 'version');
PaymentSchema.plugin(updateIfCurrentPlugin);

PaymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment({
    //_id: attrs.id,
    //id: attrs.id,
    //version: attrs.version,
    //price: attrs.price,
    userId: attrs.userId,
    orderId: attrs.orderId,
    stripeId: attrs.stripeId,
    //status: attrs.status,
  });
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  PaymentSchema
);

export { Payment };
