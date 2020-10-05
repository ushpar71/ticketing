import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// USe the mock stripe to simulate payments via Stripe
// uncomment this if you dont want to use the real stripe api to test
// also rename the stipe.ts.old to stripe.ts uner the __mock__ directory
// jest.mock('../../stripe');

it('returns 404 when purchasing and order that does not exist', async () => {
  const orderId = mongoose.Types.ObjectId();
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: '12345', orderId: orderId });
  expect(response.status).toEqual(404);
});

it('returns a 401 when puchasing an order that deosent belong the user', async () => {
  // Create order
  const orderId = mongoose.Types.ObjectId().toHexString();
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: orderId,
    userId: userId,
    version: 0,
    price: 23,
    status: OrderStatus.Created,
  });
  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: '12345', orderId: orderId });
  expect(response.status).toEqual(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  // Create order
  const orderId = mongoose.Types.ObjectId().toHexString();
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: orderId,
    userId: userId,
    version: 0,
    price: 23,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ token: '12345', orderId: orderId });
  expect(response.status).toEqual(400);
});

// USE THIS IF YOU ARE USING LOCAL STRIPE testing
// it('returns a 201 with valid inputs', async () => {
//   // Create order
//   const orderId = mongoose.Types.ObjectId().toHexString();
//   const userId = mongoose.Types.ObjectId().toHexString();

//   const order = Order.build({
//     id: orderId,
//     userId: userId,
//     version: 0,
//     price: 20,
//     status: OrderStatus.Created,
//   });

//   await order.save();

//   const response = await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signin(userId))
//     .send({ token: 'tok_visa', orderId: orderId });

//   expect(response.status).toEqual(201);

//    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(20 * 100);
//   expect(chargeOptions.currency).toEqual('usd');
// });

// using Stripe site to test our api success
it('returns a 201 with valid inputs Live', async () => {
  // Create order
  const orderId = mongoose.Types.ObjectId().toHexString();
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000); // use this random price for the test aling with the currency

  const order = Order.build({
    id: orderId,
    userId: userId,
    version: 0,
    price: price,
    status: OrderStatus.Created,
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ token: 'tok_visa', orderId: orderId });
  expect(response.status).toEqual(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
  //expect(payment?.price).toEqual(stripeCharge!.amount);
});
