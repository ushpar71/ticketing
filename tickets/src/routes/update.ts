import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from '@prtickets/common';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required and cannot be empty'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price is required and must be > 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //console.log('updateTs:' + req.params.id);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // check to see if ticket can be edited
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserverd ticket');
    }

    // update the data into the tables
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId, // reason for using tickets is mongoose can have pre/post changes
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
