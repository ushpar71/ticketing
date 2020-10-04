import mongoose from 'mongoose';

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from '@prtickets/common';
import { natsWrapper } from '../nats-wrapper';
import { Order, OrderStatus } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const stripeCharge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
      description: 'Ticketing.dev Purchase Order:' + order.id,
    });

    // Save the Stripe conformation details to our payment collection
    const payment = Payment.build({
      orderId: order.id,
      stripeId: stripeCharge.id,
      userId: order.userId,
    });
    await payment.save();

    //Publish event that payment is completed
    //removing await ( not sure why)
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
      userId: payment.userId,
    });
    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
