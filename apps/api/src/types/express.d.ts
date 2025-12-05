import { JwtPayload } from '../middleware/auth.middleware.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export {};

