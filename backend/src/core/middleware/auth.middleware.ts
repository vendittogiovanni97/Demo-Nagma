import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getCookieToken } from '../shared/utils/cookieAuth';
import { logger } from '../shared/utils/logger';
import prisma from '../shared/utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
    tokenVersion?: number;
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

/**
 * SECURITY: rotte in cui è tollerato il token via query-param (?token=).
 * Necessario solo per i download avviati dal browser (es. backup DB), dove
 * non è possibile impostare l'header Authorization su un <a href> / window.open.
 * Il token in query finisce nei log/proxy/cronologia: mantenere questa lista
 * ridotta al minimo indispensabile. Tutte le altre rotte accettano SOLO il
 * Bearer token nell'header Authorization.
 */
const QUERY_TOKEN_ALLOWED_ROUTES: ReadonlyArray<{ method: string; path: string }> = [
  { method: 'GET', path: '/api/config/backup' },
];

function isQueryTokenAllowed(req: Request): boolean {
  return QUERY_TOKEN_ALLOWED_ROUTES.some(
    (r) => r.method === req.method && req.path === r.path,
  );
}

interface TokenVersionCacheEntry {
  version: number;
  expiresAt: number;
}
const tokenVersionCache = new Map<number, TokenVersionCacheEntry>();
const CACHE_TTL_MS = 30_000;

export function invalidateTokenVersionCache(userId?: number): void {
  if (userId) {
    tokenVersionCache.delete(userId);
  } else {
    tokenVersionCache.clear();
  }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = '';
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (
    req.query.token &&
    typeof req.query.token === 'string' &&
    isQueryTokenAllowed(req)
  ) {
    token = req.query.token;
  } else {
    // SECURITY (Audit M2): fallback sul cookie di sessione httpOnly.
    // Il browser lo invia automaticamente (credentials: 'include'); non è
    // leggibile da JavaScript, quindi un XSS non può esfiltrarlo.
    const cookieToken = getCookieToken(req);
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    logger.warn(`401 ${req.method} ${req.originalUrl} · NO_TOKEN`);
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
    const decoded = jwt.verify(token, secret) as NonNullable<AuthRequest['user']>;

    const now = Date.now();
    const cached = tokenVersionCache.get(decoded.id);
    let currentVersion: number | null = null;

    if (cached && cached.expiresAt > now) {
      currentVersion = cached.version;
    } else {
      const dbUser = await prisma.user.findFirst({
        where: { id: decoded.id, deletedAt: null },
        select: { tokenVersion: true },
      });
      if (dbUser) {
        currentVersion = dbUser.tokenVersion;
        tokenVersionCache.set(decoded.id, {
          version: dbUser.tokenVersion,
          expiresAt: now + CACHE_TTL_MS,
        });
      }
    }

    // Il claim tokenVersion è sempre emesso da login/refresh: la sua assenza (token legacy o forgiato)
    // deve valere come revoca, non come bypass del controllo.
    if (currentVersion === null || currentVersion !== decoded.tokenVersion) {
      tokenVersionCache.delete(decoded.id);
      logger.warn(`401 ${req.method} ${req.originalUrl} · REVOKED_TOKEN`);
      return res.status(401).json({
        message: 'Token revocato o non più valido.',
        requestId: req.requestId,
      });
    }

    req.user = decoded;
    next();
  } catch {
    logger.warn(`401 ${req.method} ${req.originalUrl} · INVALID_TOKEN`);
    return res.status(401).json({
      message: 'Token non valido o scaduto.',
      requestId: req.requestId,
    });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    logger.warn(`403 ${req.method} ${req.originalUrl} · ADMIN_ONLY`, { userId: req.user?.id, role: req.user?.role });
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
      logger.warn(`403 ${req.method} ${req.originalUrl} · FORBIDDEN`, {
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
