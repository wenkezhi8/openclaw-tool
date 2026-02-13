import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

export interface ApiError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = (err as ApiError).statusCode || 500;
  const code = (err as ApiError).code || 'INTERNAL_ERROR';

  // Return JSON error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
      details: (err as ApiError).details,
    },
  });
}

export function createError(message: string, code: string, statusCode: number = 500): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.statusCode = statusCode;
  return error;
}
