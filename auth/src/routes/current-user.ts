import express from 'express';
import { currentUser } from '@prtickets/common';

const router = express.Router();

// the second parameter is the middleware currentUser
// sequence is to get the current user to the request then to check if authorized. If everything passes
// then proceed with the body of the function
router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
