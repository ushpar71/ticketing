import express, { Request, Response, response } from 'express';
import { requireAuth, validateRequest } from '@prtickets/common';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@prtickets/common';
const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined });
  if (!tickets) {
    throw new NotFoundError();
  }
  res.send(tickets);
});

export { router as indexTicketRouter };
