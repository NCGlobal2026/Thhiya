/**
 * Metrics Middleware for Hono
 * Automatically tracks HTTP request metrics
 */

import type { Context, Next } from 'hono';
import {
    httpRequestsTotal,
    httpRequestDuration,
    httpActiveRequests,
    httpErrors,
    httpResponseSize,
    httpSuccessTotal,
    httpClientErrors,
    httpServerErrors,
    httpBandwidthBytes,
    apiRequestsPerRoute,
    errorsByRoute,
    apiLatencyByEndpoint,
} from '../utils/metrics';

/**
 * Middleware to track HTTP request metrics
 */
export const metricsMiddleware = () => {
    return async (c: Context, next: Next) => {
        const start = Date.now();

        // Get the route pattern or path
        // Normalize route to avoid high cardinality
        const route = normalizeRoute(c.req.path);
        const method = c.req.method;

        // Increment active requests
        httpActiveRequests.inc();

        try {
            await next();
        } finally {
            const duration = (Date.now() - start) / 1000;
            const statusCode = c.res.status.toString();
            const statusClass = `${Math.floor(c.res.status / 100)}xx`;

            // Record request
            httpRequestsTotal.inc({ method, route, status_code: statusCode });
            httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);

            // Track by status class for dashboard panels
            apiRequestsPerRoute.inc({ route, method, status_class: statusClass });

            // Track response size (if available)
            try {
                const contentLength = c.res.headers.get('content-length');
                if (contentLength) {
                    const bytes = parseInt(contentLength, 10);
                    if (!isNaN(bytes)) {
                        httpResponseSize.observe({ method, route, status_code: statusCode }, bytes);
                        httpBandwidthBytes.inc({ method, direction: 'out' }, bytes);
                    }
                } else if (c.res.body) {
                    // Clone and read body for size if no content-length header
                    // Commented out to prevent stream consumption issues causing empty responses
                    /*
                    const clonedRes = c.res.clone();
                    const bodyText = await clonedRes.text();
                    const bytes = Buffer.byteLength(bodyText, 'utf8');
                    httpResponseSize.observe({ method, route, status_code: statusCode }, bytes);
                    httpBandwidthBytes.inc({ method, direction: 'out' }, bytes);
                    */
                }
            } catch {
                // Ignore response size tracking errors
            }

            // Track success/error breakdowns
            if (c.res.status >= 200 && c.res.status < 300) {
                httpSuccessTotal.inc({ method, route });
            } else if (c.res.status >= 400 && c.res.status < 500) {
                httpClientErrors.inc({ method, route, status_code: statusCode });
                httpErrors.inc({ method, route, status_code: statusCode, error_type: 'client_error' });
                errorsByRoute.inc({ route, status_code: statusCode, error_type: 'client_error' });
            } else if (c.res.status >= 500) {
                httpServerErrors.inc({ method, route, status_code: statusCode });
                httpErrors.inc({ method, route, status_code: statusCode, error_type: 'server_error' });
                errorsByRoute.inc({ route, status_code: statusCode, error_type: 'server_error' });
            }

            // Track endpoint-specific latency for detailed analysis
            apiLatencyByEndpoint.observe({ endpoint: route, method }, duration);

            // Decrement active requests
            httpActiveRequests.dec();
        }
    };
};

/**
 * Normalize route paths to prevent high cardinality
 * e.g., /api/country-services/india/eor -> /api/country-services/:country/:service
 */
function normalizeRoute(path: string): string {
    // Normalize known dynamic routes
    const patterns = [
        { regex: /\/api\/country-services\/[^/]+\/[^/]+/, replacement: '/api/country-services/:country/:service' },
        { regex: /\/api\/countries\/[^/]+/, replacement: '/api/countries/:country' },
        { regex: /\/api\/services\/[^/]+/, replacement: '/api/services/:service' },
        { regex: /\/api\/bant\/[^/]+/, replacement: '/api/bant/:id' },
        { regex: /\/api\/contact\/[^/]+/, replacement: '/api/contact/:id' },
        { regex: /\/api\/insights\/[^/]+/, replacement: '/api/insights/:slug' },
        { regex: /\/api\/providers\/[^/]+/, replacement: '/api/providers/:id' },
        { regex: /\/api\/email-tracking\/[^/]+\/[^/]+/, replacement: '/api/email-tracking/:trackingId/:action' },
    ];

    for (const pattern of patterns) {
        if (pattern.regex.test(path)) {
            return pattern.replacement;
        }
    }

    return path;
}

export default metricsMiddleware;
