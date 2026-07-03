import type { Request } from 'express';
import type { User } from '@maplewealth/db';

export interface RequestWithContext extends Request {
  user?: User;
  correlationId?: string;
}
