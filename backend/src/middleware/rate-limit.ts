import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for gateway control operations (state-changing)
 */
export const gatewayRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
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
  max: 30,
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
  max: 60,
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
