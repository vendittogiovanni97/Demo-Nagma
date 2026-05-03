import cors from 'cors';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env';
import { getSwaggerSpec } from './config/swagger';
import { globalErrorHandler } from './middlewares/error.middleware';
import authRoutes from './modules/auth/interfaces/auth.routes';
import attachmentRoutes from './modules/attachment/interfaces/attachment.routes';
import bookingRoutes from './modules/booking/interfaces/booking.routes';
import creamRoutes from './modules/cream/interfaces/cream.routes';
import customerRoutes from './modules/customer/interfaces/customer.routes';
import formTemplateRoutes from './modules/form-template/interfaces/form-template.routes';
import teamRoutes from './modules/staff/interfaces/staff.routes';
import whatsappTemplateRoutes from './modules/whatsapp/interfaces/whatsapp.routes';
import financeRoutes from './modules/finance/interfaces/finance.routes';
import { configService } from './container';
import { isDebugHttpEnabled, logger, sanitizeForLog } from './shared/utils/logger';
import prisma from './shared/utils/prisma';

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

      // FIX B7: Alert on very slow requests (5s+)
      if (durationMs > 5000) {
        logger.error('⚠️ Very slow request detected (>5s)', baseMeta);
        // TODO: Send alert to monitoring system (Sentry, DataDog, etc.)
        return;
      }

      // FIX B7: Warn on slow requests (1s-5s)
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

  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api', financeRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/form-templates', formTemplateRoutes);
  app.use('/api/whatsapp-templates', whatsappTemplateRoutes);
  app.use('/api/cream', creamRoutes);
  app.use('/api/attachments', attachmentRoutes);

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
