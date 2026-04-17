import type { Role } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    user?: {
      id: number;
      email: string;
      role: Role;
    };
  }
}
