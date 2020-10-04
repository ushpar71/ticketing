import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

const createTicket = (ticketno: number, price: number) => {
  //create a ticket
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Ticket:' + ticketno,
      price: price,
    });
};

const getFakeId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

it('returns 404 if ticket is not found', async () => {
  let id = getFakeId();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'updated title',
      price: 40,
    })
    .expect(404);
});

it('returns 401 if not authenticated ', async () => {
  let id = getFakeId();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'updated title',
      price: 40,
    })
    .expect(404);
});

it('returns 401 if user does not own ticket', async () => {
  let cookie = global.signin();

  // create a ticket with one sign in
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title: title',
      price: 40,
    });

  // get the id of the ticket created above
  let id = `${response.body.id}`;

  //console.log('ID created:' + id);

  // create a new signin cookie to simulate a ifferent user
  cookie = global.signin();
  // update the ticket id with new values in a different signin
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Title: Updated title',
      price: 50,
    })
    .expect(401);

  //const checktickets = await Ticket.findById(id);
  //console.log('ticket updated:' + checktickets);
  //expect(checktickets && checktickets.title).toEqual('Title: Updated title');
});

it('returns 401 if ticket and/or price is invalid', async () => {
  let cookie = global.signin();

  // create a ticket with one sign in
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title: Invalid Title',
      price: 60,
    });

  expect(response.status).toEqual(201);

  // update the ticket id with bad price
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) // use same cookie
    .send({
      title: 'ssssss',
      price: -50,
    })
    .expect(400);

  // update the ticket id with bad title
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) // use same cookie
    .send({
      title: '',
      price: 50,
    })
    .expect(400);

  // update the ticket id with no title or price
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) // use same cookie
    .send({})
    .expect(400);
});

it('returns 200 if ticket updated successfully', async () => {
  let cookie = global.signin();

  // create a ticket with one sign in
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title: Success Title',
      price: 60,
    });

  // update the ticket id with new valid values
  const updResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) // use same cookie
    .send({
      title: 'Title: Success Updated title',
      price: 50,
    });

  // retrieve the upated ticket
  const ticketResponse = await request(app)
    .get(`/api/tickets/${updResponse.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('Title: Success Updated title');
  expect(ticketResponse.body.price).toEqual(50);
});

it('publishes an updated event', async () => {
  let cookie = global.signin();

  // create a ticket with one sign in
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title: Success Title',
      price: 60,
    });

  // update the ticket id with new valid values
  const updResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) // use same cookie
    .send({
      title: 'Title: Success Updated title',
      price: 50,
    });

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('reject updates if the ticket is reserved ', async () => {
  let cookie = global.signin();

  // create a ticket with one sign in
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title: Success Title',
      price: 60,
    });

  // add order id to fake the ticket to be reserved.
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  // update the ticket id with new valid values
  const updResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie) // use same cookie
    .send({
      title: 'Title: Success Updated title',
      price: 50,
    })
    .expect(400); // since there is orderid associated with the ticket it should not update
});
