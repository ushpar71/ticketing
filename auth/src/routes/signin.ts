import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@prtickets/common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      //.isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    // Check if user exists. If not exists  then no more processing here
    if (!existingUser) {
      //console.log('Signin: Email not registered. Please register with email');
      //return res.send({});
      throw new BadRequestError('Signin: Invalid Credentials entered');
    }

    //console.log(existingUser.password + ':::' + password);
    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordMatch) {
      //console.log(existingUser.password + ':::' + password);
      throw new BadRequestError(
        'Signin: Invalid Credentials. Please sign in with a valid email and password'
      );
    }

    // generate jwt and store it on the sesstion object
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY! // adding ! is for typescript to know that we have alrteady checked for the env variable in index.ts
      // prior to creating the
      // 'asdf' // Signing key. base64decode.org and jwt.io
      // kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf ; kubectl get secrets
    );

    // store jwt in req session
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
