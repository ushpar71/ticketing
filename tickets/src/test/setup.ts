import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

// Mock NATS Wrapper for testing purposes
jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks(); // ensure that the NATS publish is flushed before each test
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// async requrired for old method
global.signin = () => {
  // ------------------------------
  // new fake method for testing
  // ------------------------------

  // 1. Build a jason webtoken payload
  const payload = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'partha@test.com',
  };

  // 2. Create a JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // 3. build session object
  const session = { jwt: token };

  // 4. Turn that session in JSON
  const sessionJSON = JSON.stringify(session);

  // 5. Take JSON and encode it into base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // 6. return string thats the cookie with endocded data
  return [`express:sess=${base64}`];
};
