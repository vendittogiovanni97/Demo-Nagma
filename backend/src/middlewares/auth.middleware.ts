import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { isDebugHttpEnabled, logger, sanitizeForLog } from '../shared/utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
  };
}

/**
 * FIX #4 SECURITY: Hard-Coded JWT Secret Risk Prevention
 * Valida che JWT_SECRET sia configurato e abbia lunghezza sufficiente (32+ chars).
 * Deve essere chiamato SOLO UNA VOLTA al boot della app (in app.ts).
 * Una secret debole/mancante compromette TUTTA l'autenticazione.
 */
export function validateJwtSecret(): void {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const errorMsg =
      'FATAL: JWT_SECRET non impostata in .env. ' +
      'Genera con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (secret.length < 32) {
    const errorMsg =
      `FATAL: JWT_SECRET troppo corta (${secret.length} chars, minimo 32 richiesto). ` +
      'Genera una nuova secret con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  logger.info('JWT_SECRET validation passed', { length: secret.length });
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = '';
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    logger.warn('Richiesta autenticata senza token Bearer o query token', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
    return res.status(401).json({
      message: 'Accesso negato. Token mancante.',
      requestId: req.requestId,
    });
  }

  const secret = process.env.JWT_SECRET;

  // FIX #4: Defensive check (should never happen if validateJwtSecret() called at boot)
  if (!secret || secret.length < 32) {
    logger.error('JWT_SECRET is invalid or missing', {
      requestId: req.requestId,
      secretExists: !!secret,
      secretLength: secret?.length ?? 0,
    });
    return res.status(500).json({
      message: 'Errore di configurazione server.',
      requestId: req.requestId,
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    logger.warn('Token JWT non valido o scaduto', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
    return res.status(401).json({
      message: 'Token non valido o scaduto.',
      requestId: req.requestId,
    });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    logger.warn('Accesso negato: route adminOnly', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?.id,
      role: req.user?.role,
    });
    return res.status(403).json({
      message: 'Accesso negato. Permessi insufficienti.',
      requestId: req.requestId,
    });
  }
  next();
};

export const requireRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN')) {
      logger.warn('Accesso negato: ruolo non autorizzato', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.id,
        role: req.user?.role,
        allowedRoles: roles,
      });
      return res.status(403).json({
        message: 'Accesso negato. Permessi insufficienti.',
        requestId: req.requestId,
      });
    }
    next();
  };
};

export const requireAuth = requireRoles('ADMIN', 'USER', 'SUPER_ADMIN');
export const requireAdmin = requireRoles('ADMIN', 'SUPER_ADMIN');
