/**
 * Compression Middleware for Hono
 * Implements gzip compression for API responses to reduce bandwidth
 * Uses Node.js zlib instead of CompressionStream for Bun compiled binary compatibility
 */

import type { Context, Next } from 'hono';
import { gzipSync } from 'zlib';
import { compressionSavings, compressionRatio } from '../utils/metrics';

/**
 * Gzip compression middleware using Node.js zlib
 * Works in Bun compiled binaries (unlike CompressionStream)
 * Only compresses GET responses > 1KB
 */
export const compressionMiddleware = async (c: Context, next: Next) => {
    await next();

    // Only compress GET requests (POST/PUT responses are typically small)
    if (c.req.method !== 'GET') {
        return;
    }

    // Only compress if client accepts gzip
    const acceptEncoding = c.req.header('accept-encoding') || '';
    if (!acceptEncoding.includes('gzip')) {
        return;
    }

    // Only compress successful responses with content
    const response = c.res;
    if (!response || response.status >= 400 || !response.body) {
        return;
    }

    // Only compress JSON/text responses
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/')) {
        return;
    }

    try {
        const body = await response.clone().text();
        const originalSize = Buffer.byteLength(body, 'utf8');

        // Only compress if body > 1KB (compression overhead not worth it for small responses)
        if (originalSize < 1024) {
            // Reconstruct response with reading body to ensure stream isn't lost
            c.res = new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
            return;
        }

        const compressed = gzipSync(Buffer.from(body));
        const compressedSize = compressed.length;

        // Track compression savings metrics
        const bytesSaved = originalSize - compressedSize;
        if (bytesSaved > 0) {
            compressionSavings.inc(bytesSaved);
            compressionRatio.set(compressedSize / originalSize);
        }

        // Create new headers, preserving all existing ones
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Encoding', 'gzip');
        newHeaders.set('Content-Length', compressedSize.toString());
        newHeaders.set('Vary', 'Accept-Encoding');

        // Replace response with compressed version
        c.res = new Response(compressed, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    } catch (error) {
        // If compression fails, just return the original response
        console.error('[Compression] Error compressing response:', error);
    }
};

/**
 * Cache control middleware for API responses
 * Sets appropriate cache headers based on the endpoint type
 */
export const cacheControl = (options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    isPublic?: boolean;
    isStatic?: boolean;
}) => {
    const {
        maxAge = 300, // 5 minutes default
        staleWhileRevalidate = 60,
        isPublic = true,
        isStatic = false,
    } = options;

    return async (c: Context, next: Next) => {
        await next();

        // Only cache successful GET responses
        if (c.req.method !== 'GET' || (c.res.status >= 400)) {
            return;
        }

        // Set cache headers
        const cacheDirectives: string[] = [];

        if (isPublic) {
            cacheDirectives.push('public');
        } else {
            cacheDirectives.push('private');
        }

        if (isStatic) {
            // Static data (countries, services) - cache for 1 hour
            cacheDirectives.push(`max-age=${maxAge}`);
            cacheDirectives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
        } else {
            // Dynamic data - shorter cache with revalidation
            cacheDirectives.push(`max-age=${maxAge}`);
            cacheDirectives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
        }

        c.header('Cache-Control', cacheDirectives.join(', '));

        // Add ETag for conditional requests
        const body = await c.res.clone().text();
        if (body) {
            // Simple hash for ETag
            const hash = simpleHash(body);
            c.header('ETag', `"${hash}"`);
        }
    };
};

/**
 * Simple hash function for ETag generation
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Preset cache configurations for different endpoint types
 */
export const CachePresets = {
    // Countries and services - rarely change
    static: cacheControl({
        maxAge: 600, // 10 minutes
        staleWhileRevalidate: 300, // 5 minutes
        isPublic: true,
        isStatic: true,
    }),

    // Insights - moderate update frequency
    insights: cacheControl({
        maxAge: 1800, // 30 minutes
        staleWhileRevalidate: 300, // 5 minutes
        isPublic: true,
    }),

    // Metadata - changes occasionally
    metadata: cacheControl({
        maxAge: 900, // 15 minutes
        staleWhileRevalidate: 180, // 3 minutes
        isPublic: true,
    }),

    // No cache for form submissions, tracking, etc.
    noCache: async (c: Context, next: Next) => {
        await next();
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
        c.header('Pragma', 'no-cache');
    },
};
