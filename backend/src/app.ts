import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { config } from './core/config/env';
import { getSwaggerSpec } from './core/config/swagger';
import { container } from './core/container';
import { bootstrapContainer } from './core/container/bootstrap';
import { globalErrorHandler } from './core/middleware/error.middleware';
import { apiRateLimiter } from './core/middleware/rateLimiter';
import { isDebugHttpEnabled, logger, sanitizeForLog } from './core/shared/utils/logger';
import prisma from './core/shared/utils/prisma';
import { ConfigService } from './modules/config/services/configService';
import { registerRoutes } from './routes';

import { MetricsService } from './modules/metrics/services/metrics.service';

bootstrapContainer();

const configService = container.get(ConfigService);

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map(o => o.trim());

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Health check endpoint — esclusivo dalla CORS (usato da Docker healthcheck senza origin header)
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const appVersion = configService.getAppVersionSync();
      res.json({ status: 'ok', db: 'connected', version: appVersion });
    } catch (error) {
      logger.errorWithStack('Health check fallito per errore database', error);
      res.status(500).json({
        success: false,
        message: 'Connessione al database fallita',
        error: { code: 'DB_CONNECTION_ERROR', statusCode: 500 },
        requestId: _req.requestId,
      });
    }
  });

  // localhost è ammesso solo fuori da produzione; in prod la whitelist deriva dai domini + CORS_ORIGINS.
  const isProduction = process.env.NODE_ENV === 'production';
  const localhostOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const whitelist = [
    'https://nagma.it',
    'https://www.nagma.it',
    ...allowedOrigins,
    ...(isProduction ? [] : localhostOrigins),
  ];

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
      // Origin non consentita: nega senza sollevare un Error (evita un 500, il browser blocca la risposta).
      callback(null, !origin || whitelist.includes(origin));
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  // SECURITY (Audit M2): parsing dei cookie per la sessione httpOnly.
  app.use(cookieParser());

  app.use(express.json({ limit: config.jsonPayloadLimit }));

  app.use((req, res, next) => {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const shouldLogBody = isDebugHttpEnabled() && req.method !== 'GET' && req.method !== 'HEAD';
    logger.debug(`→ ${req.method} ${req.originalUrl}`, {
      ...(isDebugHttpEnabled() ? { requestId, ip: req.ip } : {}),
      ...(shouldLogBody ? { body: sanitizeForLog(req.body) } : {}),
      ...(isDebugHttpEnabled() ? { query: sanitizeForLog(req.query) } : {}),
    });

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;

      try {
        const metricsService = container.get(MetricsService);
        metricsService.recordRequest(req.method, req.originalUrl, res.statusCode, durationMs, req.user?.id);
      } catch {}

      // ── Avvisi di performance ─────────────────────────────────────────
      if (durationMs > 5000) {
        logger.error(`SLOW >5s  ${req.method} ${req.originalUrl}`, {
          statusCode: res.statusCode,
          durationMs,
          userId: req.user?.id,
        });
        return;
      }

      if (durationMs > 1000) {
        logger.warn(`SLOW >1s  ${req.method} ${req.originalUrl}`, {
          statusCode: res.statusCode,
          durationMs,
          userId: req.user?.id,
        });
        return;
      }

      // Log di completamento solo in DEBUG — le 4xx/5xx vengono già tracciate
      // dall'error middleware con i dettagli completi (evita log duplicati)
      logger.debug(`← ${res.statusCode}  ${req.method} ${req.originalUrl}`, {
        durationMs,
        ...(isDebugHttpEnabled() ? { requestId, userId: req.user?.id, contentLength: res.getHeader('content-length') } : {}),
      });
    });

    next();
  });

  // SECURITY (Audit B5/Audit): rate limiter globale sull'intera superficie /api.
  // Copre le chiamate non autenticate (per-IP) e, quando l'utente è già stato
  // autenticato da un middleware precedente, per-utente. File/health oppure
  // /api-docs non sono sotto /api e restano fuori dal limite. Il limite
  // specifico di login resta gestito dai limiter dedicati sulle route auth.
  app.use('/api', apiRateLimiter);

  registerRoutes(app);

  // SECURITY: la documentazione Swagger espone l'intera superficie API e non
  // deve essere raggiungibile in produzione. La si monta solo fuori da
  // NODE_ENV=production (override esplicito con ENABLE_API_DOCS=true se serve
  // pubblicarla dietro protezione a livello di reverse-proxy).
  const apiDocsEnabled =
    process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS === 'true';

  if (apiDocsEnabled) {
    // Build the Swagger spec only when /api-docs is actually requested.
    app.use('/api-docs', swaggerUi.serve, (req: Request, res: Response, next: NextFunction) => {
      const swaggerSpec = getSwaggerSpec();
      const swaggerHandler = swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Nagma Tattoo CRM - API Docs',
      });

      swaggerHandler(req, res, next);
    });
  } else {
    logger.info('Swagger /api-docs disabilitato (NODE_ENV=production)');
  }

  app.use(globalErrorHandler);

  return app;
}
