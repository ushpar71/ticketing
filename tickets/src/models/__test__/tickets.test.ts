import { Ticket } from '../ticket';
import { TicketCreatedListener } from '../../events/listeners/ticket-created-listener';

it('implments optimistic cuncurrency control', async (done) => {
  //Create instance of ticket
  const ticket = Ticket.build({
    title: 'my title',
    price: 5,
    userId: '123',
  });

  //Save the ticket to the database
  await ticket.save();

  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fethed
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 20 });

  // save the first fetched ticket
  await firstInstance!.save();

  //save the second fetched ticket ( some out of date version issue) error sscenario

  // jest does not work well with this syntax so use the try catch method as we know that we are going to an error thrown
  // expect(async () => {
  //   await secondInstance!.save();
  // }).toThrow();

  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }
  throw new Error('Should not reach this point');
});

it('increments the version no. on multiple saves', async () => {
  //Create instance of ticket
  const ticket = Ticket.build({
    title: 'my title',
    price: 5,
    userId: '123',
  });

  // save the first fetched ticket
  await ticket.save();
  expect(ticket.version).toEqual(0);

  //save again version to increase to 1
  await ticket.save();
  expect(ticket.version).toEqual(1);

  //save again version to increase to 2
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
