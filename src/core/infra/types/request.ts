import { GoogleProfile } from 'src/auth/strategies/types/google';
import { Request as ExpressRequest } from 'express';

export type Request<User extends GoogleProfile | unknown = unknown> =
  ExpressRequest & {
    user: User;
  };
