import express, { Request, Response, response } from 'express';
import { requireAuth, validateRequest } from '@prtickets/common';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@prtickets/common';
const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }
  res.send(ticket);
});

export { router as showTicketRouter };
