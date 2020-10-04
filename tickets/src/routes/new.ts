import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@prtickets/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Title is required and cannot be empty'),
    body('price')
      .trim()
      .isFloat({ gt: 0 })
      .withMessage('Price is required and must be > 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();

    // no await here. User does not need to know about this. Increases latency
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId, // reason for using tickets is mongoose can have pre/post changes
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
