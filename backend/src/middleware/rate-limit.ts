import rateLimit from 'express-rate-limit';

// Disable rate limiting in development
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Rate limiter for gateway control operations (state-changing)
 */
export const gatewayRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 100 : 10,
  skip: isDev ? () => true : undefined,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many gateway control requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for agent CRUD operations
 */
export const agentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 200 : 30,
  skip: isDev ? () => true : undefined,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many agent requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for read operations
 */
export const readRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 500 : 60,
  skip: isDev ? () => true : undefined,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
