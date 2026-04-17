import cors from 'cors';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import customerRoutes from './routes/customer.routes';
import formTemplateRoutes from './routes/form-template.routes';
import staffRoutes from './routes/staff.routes';
import teamRoutes from './routes/team.routes';
import transactionRoutes from './routes/transaction.routes';
import whatsappTemplateRoutes from './routes/whatsapp-template.routes';
import spesaLiberaRoutes from './routes/spesa-libera.routes';
import { config } from './config/env';
import { AppError } from './utils/AppError';
import { getRequestContext, isDebugHttpEnabled, logger, sanitizeForLog } from './utils/logger';
import prisma from './utils/prisma';

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

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
        ...(isDebugHttpEnabled() ? { contentLength: res.getHeader('content-length') } : {}),
      };

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
  app.use('/api/staff', staffRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/form-templates', formTemplateRoutes);
  app.use('/api/whatsapp-templates', whatsappTemplateRoutes);
  app.use('/api/spese-libere', spesaLiberaRoutes);

  // Swagger API Docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Nagma Tattoo CRM - API Docs',
  }));

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', db: 'connected' });
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
