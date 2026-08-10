/**
 * Security Middleware for Hono
 * Implements security headers and request validation
 */

import type { Context, Next } from 'hono';

// Environment check
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Security headers middleware - similar to helmet for Express
 * Sets headers BEFORE calling next() to ensure they're always set
 */
export const securityHeaders = () => {
    return async (c: Context, next: Next) => {
        // Set security headers BEFORE processing the request
        // This ensures headers are set even if an error occurs

        // Prevent clickjacking
        c.header('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        c.header('X-Content-Type-Options', 'nosniff');

        // XSS Protection (legacy but still useful)
        c.header('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy (restrict browser features) - using only standard features
        c.header(
            'Permissions-Policy',
            'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
        );

        // Content Security Policy for API (restrictive)
        c.header(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'"
        );

        // Strict Transport Security (HSTS) - only in production
        if (isProduction) {
            c.header(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // Remove server identification headers
        c.header('X-Powered-By', '');

        await next();
    };
};

/**
 * Request validation middleware
 * Validates common attack patterns and sanitizes input
 */
export const requestValidator = () => {
    return async (c: Context, next: Next) => {
        try {
            const method = c.req.method;

            // Check for oversized requests (body size limit)
            const contentLength = c.req.header('content-length');
            if (contentLength) {
                const size = parseInt(contentLength, 10);
                const maxSize = 1024 * 1024; // 1MB limit
                if (size > maxSize) {
                    return c.json(
                        { success: false, error: 'Request too large', message: 'Request body exceeds maximum allowed size.' },
                        413
                    );
                }
            }

            // Validate Content-Type for POST/PUT/PATCH requests
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                const contentType = c.req.header('content-type');
                if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
                    // Allow requests without body or with valid content types
                    if (contentLength && parseInt(contentLength, 10) > 0) {
                        return c.json(
                            { success: false, error: 'Invalid content type', message: 'Content-Type must be application/json.' },
                            415
                        );
                    }
                }
            }

            // Check for common injection patterns in query params
            const url = new URL(c.req.url);
            const suspiciousPatterns = [
                /<script/i,
                /javascript:/i,
                /on\w+\s*=/i, // onclick=, onerror=, etc.
                /\$\{/,  // Template injection
                /\{\{/,  // Template injection
            ];

            for (const [key, value] of url.searchParams.entries()) {
                for (const pattern of suspiciousPatterns) {
                    if (pattern.test(key) || pattern.test(value)) {
                        return c.json(
                            { success: false, error: 'Invalid request', message: 'Request contains potentially malicious content.' },
                            400
                        );
                    }
                }
            }

            await next();
        } catch (error) {
            // Log and re-throw to be caught by global error handler
            if (isProduction) {
                console.error('[Security] Validation error');
            } else {
                console.error('[Security] Validation error:', error);
            }
            throw error;
        }
    };
};

/**
 * Request ID middleware - adds unique ID to each request for tracking
 */
export const requestId = () => {
    return async (c: Context, next: Next) => {
        const id = c.req.header('x-request-id') || generateRequestId();
        c.header('X-Request-ID', id);
        await next();
    };
};

/**
 * Generate a simple request ID
 */
function generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
}

/**
 * Request logging middleware
 * Production-ready logging - minimal in production, verbose in development
 */
export const requestLogger = () => {
    return async (c: Context, next: Next) => {
        const start = Date.now();
        const method = c.req.method;
        const path = new URL(c.req.url).pathname;
        const requestId = c.req.header('x-request-id') || 'unknown';

        try {
            await next();
        } catch (error) {
            // Log error but don't swallow it - let it propagate to global error handler
            const duration = Date.now() - start;
            console.error(`[${new Date().toISOString()}] ERROR ${method} ${path} - ${duration}ms [${requestId}]`);
            throw error;
        }

        const duration = Date.now() - start;
        const status = c.res?.status || 0;

        // Production: Only log errors and slow requests (>1000ms)
        // Development: Log all requests
        if (isProduction) {
            if (status >= 500 || duration > 1000) {
                console.log(`[${new Date().toISOString()}] ${status >= 500 ? 'ERROR' : 'SLOW'} ${method} ${path} ${status} ${duration}ms [${requestId}]`);
            }
        } else {
            const logLevel = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
            console.log(`[${new Date().toISOString()}] ${logLevel} ${method} ${path} ${status} ${duration}ms`);
        }
    };
};

/**
 * CORS preflight cache - helps reduce preflight requests
 */
export const corsPreflightCache = () => {
    return async (c: Context, next: Next) => {
        if (c.req.method === 'OPTIONS') {
            // Cache preflight response for 24 hours
            c.header('Access-Control-Max-Age', '86400');
        }
        await next();
    };
};
