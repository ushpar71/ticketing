import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route request listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('return a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});
it('returns an error of an invalid title is provided', async () => {
  const responseEmptyTitle = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  const responseNoTitle = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it('returns an error of an invalid price is provided', async () => {
  const responseEmptyTitle = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'This is valid title but invalid price',
      price: -1,
    })
    .expect(400);

  const responseNoTitle = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'This is valid title but no price',
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  //TODO: add in a check to ensure the ticket is actually saved.

  // check how many records are in thw collection first.
  let tickets = await Ticket.find({});
  const title = 'This is a valid Ttitle';

  expect(tickets.length).toEqual(0);
  // this is because we delete everything when mongo starts see beforeall

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1); // expect only one ticket added
  expect(tickets[0].price).toEqual(20); // check the price value
  expect(tickets[0].title).toEqual(title); // check the title value
});

it('publishes a event=', async () => {
  // check how many records are in thw collection first.
  let tickets = await Ticket.find({});
  const title = 'This is a valid Ttitle';

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
