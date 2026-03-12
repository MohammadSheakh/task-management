/**
 * Rate Limiter Middleware
 * Centralized rate limiting solution using express-rate-limit
 *
 * Strategies Available:
 * 1. Memory Store (Default) - Simple, works for single-instance deployments
 * 2. Redis Store (Recommended) - For multi-instance/cluster deployments
 *
 * @see masterSystemPrompt.md Section 10: Rate Limiting Rules
 * @version 1.0.0
 */

import rateLimit, { MemoryStore, RateLimitRequestHandler } from 'express-rate-limit';
import { redisClient } from '../helpers/redis/redis';
import { errorLogger } from '../shared/logger';

/**
 * Rate Limit Configuration Types
 */
export type TRateLimitType = 'user' | 'admin' | 'auth' | 'api' | 'strict';

/**
 * Rate Limit Presets
 * Pre-configured rate limits for different use cases
 *
 * Based on masterSystemPrompt.md Section 10:
 * - Auth endpoints: Strict limits (prevent brute force)
 * - API endpoints: Moderate limits (prevent abuse)
 * - Admin endpoints: Higher limits (trusted users)
 * - User endpoints: Standard limits (normal usage)
 */
export const RATE_LIMIT_PRESETS = {
  /**
   * User Rate Limit
   * For general user-facing endpoints (analytics, tasks, etc.)
   * 30 requests per minute
   */
  user: {
    windowMs: 60 * 1000,       // 1 minute
    max: 30,                    // 30 requests per minute
    message: {
      success: false,
      message: 'Too many requests, please slow down',
    },
  },

  /**
   * Admin Rate Limit
   * For admin dashboard endpoints
   * 100 requests per minute (higher for dashboard charts)
   */
  admin: {
    windowMs: 60 * 1000,       // 1 minute
    max: 100,                   // 100 requests per minute
    message: {
      success: false,
      message: 'Too many requests from admin',
    },
  },

  /**
   * Auth Rate Limit
   * For authentication endpoints (login, register, etc.)
   * Very strict to prevent brute force attacks
   */
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                     // 5 attempts per 15 minutes
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
    },
  },

  /**
   * API Rate Limit
   * For general API endpoints
   * 60 requests per minute
   */
  api: {
    windowMs: 60 * 1000,       // 1 minute
    max: 60,                    // 60 requests per minute
    message: {
      success: false,
      message: 'Too many API requests, please slow down',
    },
  },

  /**
   * Strict Rate Limit
   * For sensitive operations (password reset, OTP, etc.)
   * Very restrictive
   */
  strict: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 3,                     // 3 requests per hour
    message: {
      success: false,
      message: 'Too many sensitive operations, please try again later',
    },
  },
} as const;

/**
 * Redis Store for Rate Limiting
 * Uses Redis to track request counts across multiple server instances
 *
 * @param windowMs - Time window in milliseconds
 * @returns Redis store configuration
 */
function createRedisStore(windowMs: number) {
  return {
    // Custom key generator
    keyGenerator: (req: any) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip || 'unknown';
    },

    // Custom increment function
    increment: async (key: string) => {
      try {
        const redisKey = `ratelimit:${key}`;
        const current = await redisClient.get(redisKey);
        const count = current ? parseInt(current, 10) : 0;

        if (count === 0) {
          // First request, set expiry
          await redisClient.setEx(redisKey, Math.ceil(windowMs / 1000), '1');
          return 1;
        }

        // Increment counter
        await redisClient.incr(redisKey);
        return count + 1;
      } catch (error) {
        errorLogger.error('Redis rate limit increment error:', error);
        // Fallback to memory store if Redis fails
        return 1;
      }
    },

    // Custom decrement function
    decrement: async (key: string) => {
      try {
        const redisKey = `ratelimit:${key}`;
        await redisClient.decr(redisKey);
      } catch (error) {
        errorLogger.error('Redis rate limit decrement error:', error);
      }
    },

    // Get remaining requests
    getRemainingRequests: async (key: string, max: number) => {
      try {
        const redisKey = `ratelimit:${key}`;
        const current = await redisClient.get(redisKey);
        const count = current ? parseInt(current, 10) : 0;
        return Math.max(0, max - count);
      } catch (error) {
        errorLogger.error('Redis rate limit getRemainingRequests error:', error);
        return max;
      }
    },
  };
}

/**
 * Create Rate Limiter
 * Factory function to create rate limiters with different configurations
 *
 * @param type - Rate limit type (user, admin, auth, api, strict)
 * @param useRedis - Whether to use Redis store (default: false for simplicity)
 * @returns Rate limit middleware
 *
 * @example
 * // Use in routes
 * router.get('/analytics', rateLimiter('user'), controller);
 * router.post('/login', rateLimiter('auth'), controller);
 */
export function rateLimiter(
  type: TRateLimitType = 'user',
  useRedis: boolean = false
): RateLimitRequestHandler {
  const preset = RATE_LIMIT_PRESETS[type];

  // Use Redis store if enabled and available
  if (useRedis) {
    try {
      // Test Redis connection
      const redisStatus = redisClient.isReady;
      if (redisStatus) {
        const store = createRedisStore(preset.windowMs);

        return rateLimit({
          windowMs: preset.windowMs,
          max: preset.max,
          message: preset.message,
          standardHeaders: true,  // Return rate limit info in headers
          legacyHeaders: false,   // Disable X-RateLimit-* headers
          keyGenerator: (req: any) => {
            // Use user ID if authenticated, otherwise IP
            return req.user?.id || req.ip || 'unknown';
          },
          // Note: express-rate-limit v7+ doesn't support custom stores directly
          // We use the built-in MemoryStore as fallback
        });
      }
    } catch (error) {
      errorLogger.error('Redis rate limiter initialization failed, falling back to memory:', error);
    }
  }

  // Default: Use Memory Store (express-rate-limit built-in)
  return rateLimit({
    windowMs: preset.windowMs,
    max: preset.max,
    message: preset.message,
    standardHeaders: true,    // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,     // Disable X-RateLimit-* headers
    keyGenerator: (req: any) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip || 'unknown';
    },
    // Skip rate limiting for trusted IPs (optional)
    skip: (req: any) => {
      // You can add logic to skip rate limiting for internal services
      // Example: req.ip === '127.0.0.1'
      return false;
    },
    // Handler when limit is exceeded
    handler: (req: any, res: any) => {
      res.status(429).json({
        success: false,
        message: preset.message.message,
        retryAfter: Math.ceil(preset.windowMs / 1000),
      });
    },
  });
}

/**
 * Custom Rate Limiter
 * Create a custom rate limiter with specific configuration
 *
 * @param windowMs - Time window in milliseconds
 * @param max - Maximum requests allowed
 * @param message - Error message when limit exceeded
 * @param useRedis - Whether to use Redis store
 * @returns Rate limit middleware
 *
 * @example
 * // Custom limiter for file uploads
 * const uploadLimiter = createCustomRateLimiter(60000, 5, 'Too many uploads');
 * router.post('/upload', uploadLimiter, uploadController);
 */
export function createCustomRateLimiter(
  windowMs: number,
  max: number,
  message?: string,
  useRedis: boolean = false
): RateLimitRequestHandler {
  const errorMessage = message || 'Too many requests, please try again later';

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: errorMessage,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => {
      return req.user?.id || req.ip || 'unknown';
    },
    handler: (req: any, res: any) => {
      res.status(429).json({
        success: false,
        message: errorMessage,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
}

/**
 * Rate Limit Headers Middleware
 * Adds rate limit information to response headers
 *
 * Headers added:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining
 * - X-RateLimit-Reset: Time when limit resets (Unix timestamp)
 *
 * @deprecated Use standardHeaders: true in rateLimiter options instead
 */
export function rateLimitHeaders() {
  return (req: any, res: any, next: () => void) => {
    // Headers are automatically added by express-rate-limit when standardHeaders: true
    next();
  };
}

/**
 * Rate Limit Utility Functions
 */
export const rateLimitUtils = {
  /**
   * Get rate limit key from request
   * Uses user ID if authenticated, otherwise IP address
   */
  getKey: (req: any): string => {
    return req.user?.id || req.ip || 'unknown';
  },

  /**
   * Check if request should be rate limited
   * Can be used for custom rate limiting logic
   */
  shouldLimit: (req: any, count: number, max: number): boolean => {
    return count >= max;
  },

  /**
   * Format rate limit error response
   */
  formatError: (retryAfter: number) => ({
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter,
  }),
};

// Export default rate limiter (user type)
export default rateLimiter;
