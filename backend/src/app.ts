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

  const productionWhitelist = ['https://nagma.it', 'https://www.nagma.it', ...allowedOrigins, 'http://localhost:3000', 'http://127.0.0.1:3000'];

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
      if (!origin || productionWhitelist.includes(origin) || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
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
