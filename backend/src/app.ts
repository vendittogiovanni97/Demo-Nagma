import cors from 'cors';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { config } from './core/config/env';
import { getSwaggerSpec } from './core/config/swagger';
import { bootstrapContainer } from './core/container/bootstrap';
import { container } from './core/container';
import { ConfigService } from './modules/config/services/configService';
import { globalErrorHandler } from './core/middleware/error.middleware';
import { registerRoutes } from './routes';
import { isDebugHttpEnabled, logger, sanitizeForLog } from './core/shared/utils/logger';
import prisma from './core/shared/utils/prisma';

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

  const productionWhitelist = ['https://nagma.it', 'https://www.nagma.it'];

  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? (origin: string | undefined, callback: (err: Error | null, allowed: boolean) => void) => {
            if (!origin) {
              callback(new Error('Not allowed by CORS'), false);
              return;
            }
            if (productionWhitelist.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'), false);
            }
          }
        : allowedOrigins,
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(express.json({ limit: config.jsonPayloadLimit }));

  app.use((req, res, next) => {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const shouldLogBody = isDebugHttpEnabled() && req.method !== 'GET' && req.method !== 'HEAD';
    logger.debug('Richiesta in ingresso', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      ...(shouldLogBody ? { body: sanitizeForLog(req.body) } : {}),
      ...(isDebugHttpEnabled() ? { query: sanitizeForLog(req.query) } : {}),
    });

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const baseMeta = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        userId: req.user?.id,
        userRole: req.user?.role,
        ...(isDebugHttpEnabled() ? { contentLength: res.getHeader('content-length') } : {}),
      };

      if (durationMs > 5000) {
        logger.error('⚠️ Very slow request detected (>5s)', baseMeta);
        // TODO: Send alert to monitoring system (Sentry, DataDog, etc.)
        return;
      }

      if (durationMs > 1000) {
        logger.warn('⚠️ Slow request detected (>1s)', baseMeta);
        return;
      }

      if (res.statusCode >= 500) {
        logger.error('Richiesta completata con errore server', baseMeta);
        return;
      }

      if (res.statusCode >= 400) {
        logger.warn('Richiesta completata con errore client', baseMeta);
        return;
      }

      logger.debug('Richiesta completata', baseMeta);
    });

    next();
  });

  registerRoutes(app);

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

  app.use(globalErrorHandler);

  return app;
}
