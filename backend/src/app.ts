import cors from 'cors';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import bookingHistoryRoutes from './routes/booking-history.routes';
import customerRoutes from './routes/customer.routes';
import formTemplateRoutes from './routes/form-template.routes';
import teamRoutes from './routes/team.routes';
import transactionRoutes from './routes/transaction.routes';
import whatsappTemplateRoutes from './routes/whatsapp-template.routes';
import spesaLiberaRoutes from './routes/spesa-libera.routes';
import creamRouter from './routes/cream.routes';
import attachmentRoutes from './routes/attachment.routes';
import { config } from './config/env';
import { getSwaggerSpec } from './config/swagger';
import { AppError } from './utils/AppError';
import { getRequestContext, isDebugHttpEnabled, logger, sanitizeForLog } from './utils/logger';
import prisma from './utils/prisma';
import { configService } from './services/config.service';

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
    logger.info('Richiesta in ingresso', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      ...(shouldLogBody ? { body: sanitizeForLog(req.body) } : {}),
      ...(isDebugHttpEnabled()
        ? {
            query: sanitizeForLog(req.query),
            headers: sanitizeForLog({
              authorization: req.headers.authorization,
              'content-type': req.headers['content-type'],
              'user-agent': req.headers['user-agent'],
              referer: req.headers.referer,
            }),
          }
        : {}),
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

      logger.info('Richiesta completata', baseMeta);
    });

    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/admin/booking-history', bookingHistoryRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/form-templates', formTemplateRoutes);
  app.use('/api/whatsapp-templates', whatsappTemplateRoutes);
  app.use('/api/spese-libere', spesaLiberaRoutes);
  app.use('/api/cream', creamRouter);
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

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      logger.warn('Errore applicativo gestito', {
        ...getRequestContext(req),
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
        message: err.message,
        ...(isDebugHttpEnabled() ? { body: sanitizeForLog(req.body), query: sanitizeForLog(req.query) } : {}),
      });

      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        requestId: req.requestId,
        error: {
          code: err.code,
          statusCode: err.statusCode,
          details: err.details,
        },
      });
    }

    logger.errorWithStack('Errore interno non gestito', err, {
      ...getRequestContext(req),
      ...(isDebugHttpEnabled() ? { body: sanitizeForLog(req.body), query: sanitizeForLog(req.query) } : {}),
    });
    return res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      requestId: req.requestId,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      },
    });
  });

  return app;
}
