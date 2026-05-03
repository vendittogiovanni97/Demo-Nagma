import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { logger, getRequestContext, isDebugHttpEnabled, sanitizeForLog } from '../shared/utils/logger';

export function globalErrorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
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
}
