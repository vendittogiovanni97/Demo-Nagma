import type { Role } from '@prisma/client';
import type { ClientFeatures } from '../core/middleware/featureFlag.middleware';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    user?: {
      id: number;
      email: string;
      role: Role;
    };
    features?: ClientFeatures;
    featureEnabled?: boolean;
  }
}
