import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@prtickets/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest, // middleware runs in sequence, this generic method catches all errors
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    // Check if user exists. If exists no more processing here
    if (existingUser) {
      //console.log(
      //  'Signup: Email already in use. Please signup with a different email'
      //);
      //return res.send({});
      throw new BadRequestError(
        'SignUp: Email already in use. Please signup with a different email'
      );
    }

    // Save the User to the database
    const user = User.build({ email, password });
    await user.save();

    // generate jwt and store it on the sesstion object
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
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

    res.status(201).send(user);
  }
);

export { router as signupRouter };
