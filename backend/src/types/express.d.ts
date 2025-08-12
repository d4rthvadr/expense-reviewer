// types/express.d.ts - Type definitions for Clerk auth in Express
import { AuthObject } from '@clerk/express';

declare global {
  namespace Express {
    interface Request {
      auth: AuthObject;
    }
  }
}
