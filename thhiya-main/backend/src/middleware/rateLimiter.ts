/**
 * Rate Limiter Middleware for Hono
 * Implements a sliding window rate limiter using in-memory storage
 * For production with multiple instances, consider using Redis
 */

import type { Context, Next } from 'hono';

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    message?: string; // Custom error message
    keyGenerator?: (c: Context) => string; // Custom key generator
    skipFailedRequests?: boolean; // Don't count failed requests
    skipSuccessfulRequests?: boolean; // Don't count successful requests
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Default key generator - uses IP address
 */
const defaultKeyGenerator = (c: Context): string => {
    // Try various headers that might contain the real IP
    const forwarded = c.req.header('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = c.req.header('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to a default identifier
    return 'unknown';
};

/**
 * Create rate limiter middleware
 */
export const rateLimiter = (config: RateLimitConfig) => {
    const {
        windowMs,
        maxRequests,
        message = 'Too many requests, please try again later.',
        keyGenerator = defaultKeyGenerator,
        skipFailedRequests = false,
        skipSuccessfulRequests = false,
    } = config;

    return async (c: Context, next: Next) => {
        const key = keyGenerator(c);
        const now = Date.now();

        let entry = rateLimitStore.get(key);

        // If no entry or window has expired, create new entry
        if (!entry || entry.resetTime < now) {
            entry = {
                count: 0,
                resetTime: now + windowMs,
            };
            rateLimitStore.set(key, entry);
        }

        // Check if rate limit exceeded
        if (entry.count >= maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

            c.header('X-RateLimit-Limit', String(maxRequests));
            c.header('X-RateLimit-Remaining', '0');
            c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));
            c.header('Retry-After', String(retryAfter));

            return c.json(
                {
                    error: 'Rate limit exceeded',
                    message,
                    retryAfter,
                },
                429
            );
        }

        // Increment count before processing
        if (!skipSuccessfulRequests && !skipFailedRequests) {
            entry.count++;
        }

        // Add rate limit headers
        c.header('X-RateLimit-Limit', String(maxRequests));
        c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
        c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));

        await next();

        // Handle conditional counting based on response status
        const status = c.res.status;
        if (skipFailedRequests && status >= 400) {
            entry.count = Math.max(0, entry.count - 1);
        }
        if (skipSuccessfulRequests && status < 400) {
            entry.count = Math.max(0, entry.count - 1);
        }
    };
};

/**
 * Pre-configured rate limiters for different use cases
 */

// General API rate limiter: 200 requests per minute
export const generalRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: 'Too many requests from this IP, please try again after a minute.',
});

// Strict rate limiter for sensitive endpoints: 10 requests per minute
export const strictRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Rate limit exceeded for this endpoint. Please wait before trying again.',
});

// Form submission rate limiter: 5 requests per minute
export const formRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many form submissions. Please wait a minute before submitting again.',
});

// Auth rate limiter: 5 attempts per 15 minutes
export const authRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    skipSuccessfulRequests: true, // Don't count successful logins
});
