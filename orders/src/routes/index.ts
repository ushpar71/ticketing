import express, { Request, Response } from 'express';
import { requireAuth } from '@prtickets/common';
import { Order } from '../models/order';
const router = express.Router();

// Accessible only if authenicated
// aalso find ouly orders created by the user
// also populate the ticket information for each order
router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };
