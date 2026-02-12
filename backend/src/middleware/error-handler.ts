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
  _res: Response,
  next: NextFunction
): void {
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Re-throw for Express to handle
  next(err);
}

export function createError(message: string, code: string, statusCode: number = 500): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.statusCode = statusCode;
  return error;
}
