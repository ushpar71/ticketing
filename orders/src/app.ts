import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import { errorHandler, NotFoundError, currentUser } from '@prtickets/common';
import cookieSession from 'cookie-session';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/delete';
const app = express();

app.set('trust proxy', true); // ensure express knows that its sitting beihind a nginx proxy and to trust trust the proxy : Needed for https

app.use(json());
app.use(
  cookieSession({
    signed: false, //disable encryption for cookie, helps in multi language projects. Note that JWT will be encrypted anyway
    //secure: true, // cookies will be used only over a https connection
    //  This is to allow testing which uses http instead of https
    secure: process.env.NODE_ENV !== 'test',
  })
);
// old method moved over to routes
// app.get('/api/users/currentuser', (req, res) => {
//   res.send('Hi there!');
// });

//currentuser

app.use(currentUser);

app.use(showOrderRouter);

//createOrderRouter
app.use(createOrderRouter);

//indexOrderRouter
app.use(indexOrderRouter);

//deleteOrderRouter
app.use(deleteOrderRouter);

// any other routes throe an error
app.all('*', async (req, res, next) => {
  // Throw will not work with async so we need to use next
  // next(new NotBoundError());
  // but if you want to aviod using next, then add package express-async-errors
  throw new NotFoundError(); // this works because of express-async-errors
});

app.use(errorHandler);

export { app };
