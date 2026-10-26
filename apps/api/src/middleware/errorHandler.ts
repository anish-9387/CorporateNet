import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, isAppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { logger, createChildLogger } from '../utils/logger';

const requestLogger = createChildLogger({ component: 'error-handler' });

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json(errorResponse('BAD_REQUEST', 'Invalid JSON body'));
    return;
  }
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json(errorResponse('VALIDATION_ERROR', 'Invalid request data', details));
    return;
  }

  if (isAppError(err)) {
    requestLogger.warn({ err, code: err.code }, 'Application error');
    res.status(err.statusCode).json(errorResponse(err.code, err.message, err.details));
    return;
  }

  requestLogger.error({ err }, 'Unhandled error');
  res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(errorResponse('NOT_FOUND', 'Route not found'));
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
