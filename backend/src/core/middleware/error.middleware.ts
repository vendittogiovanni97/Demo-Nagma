import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/errors/AppError';
import { logger, getRequestContext, isDebugHttpEnabled, sanitizeForLog } from '../shared/utils/logger';

export function globalErrorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // 1. AppError (Expected/application errors)
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

  // 2. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Errore nei dati inviati.';
    let statusCode = 400;
    let code = 'DATABASE_ERROR';

    switch (err.code) {
      case 'P2002': {
        // Unique constraint failed
        const targets = err.meta?.target || [];
        const fields = Array.isArray(targets) ? targets.join(', ') : String(targets);
        message = `Valore già esistente per il campo: ${fields || 'chiave unica'}.`;
        statusCode = 409;
        code = 'RECORD_ALREADY_EXISTS';
        break;
      }
      case 'P2025':
        // Record to update/delete not found
        message = 'La risorsa richiesta non è stata trovata o è già stata rimossa.';
        statusCode = 404;
        code = 'RECORD_NOT_FOUND';
        break;
      case 'P2003':
        // Foreign key constraint failed
        message = 'Impossibile completare l\'operazione: una risorsa collegata non esiste o è in uso.';
        statusCode = 400;
        code = 'FOREIGN_KEY_VIOLATION';
        break;
      case 'P2000':
        message = 'Il valore inserito supera la lunghezza massima consentita per la colonna.';
        statusCode = 400;
        code = 'VALUE_TOO_LONG';
        break;
      default:
        message = `Errore di persistenza dati (${err.code}).`;
        break;
    }

    logger.warn('Errore Prisma gestito', {
      ...getRequestContext(req),
      code: err.code,
      message,
    });

    return res.status(statusCode).json({
      success: false,
      message,
      requestId: req.requestId,
      error: {
        code,
        statusCode,
      },
    });
  }

  // 3. SyntaxError (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    logger.warn('Errore sintassi payload', {
      ...getRequestContext(req),
      message: err.message,
    });

    return res.status(400).json({
      success: false,
      message: 'Il corpo della richiesta non è un JSON valido.',
      requestId: req.requestId,
      error: {
        code: 'MALFORMED_JSON',
        statusCode: 400,
      },
    });
  }

  // 4. Fallback for unhandled internal server errors (safe, concise, not leaking stack traces)
  logger.errorWithStack('Errore interno non gestito', err, {
    ...getRequestContext(req),
    ...(isDebugHttpEnabled() ? { body: sanitizeForLog(req.body), query: sanitizeForLog(req.query) } : {}),
  });

  return res.status(500).json({
    success: false,
    message: 'Si è verificato un errore interno del server.',
    requestId: req.requestId,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  });
}

