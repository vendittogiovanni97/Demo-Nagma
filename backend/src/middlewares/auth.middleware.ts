import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { isDebugHttpEnabled, logger, sanitizeForLog } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('Richiesta autenticata senza token Bearer', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      ...(isDebugHttpEnabled() ? { headers: sanitizeForLog(req.headers) } : {}),
    });
    return res.status(401).json({
      message: 'Accesso negato. Token mancante.',
      requestId: req.requestId,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    logger.warn('Token JWT non valido o scaduto', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      ...(isDebugHttpEnabled() ? { headers: sanitizeForLog(req.headers) } : {}),
    });
    return res.status(401).json({
      message: 'Token non valido o scaduto.',
      requestId: req.requestId,
    });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
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
    if (!req.user || !roles.includes(req.user.role)) {
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
