import { Hono } from 'hono';
import { apiReference } from '@scalar/hono-api-reference';
import insightsRoutes from './routes/insights';
import countriesRoutes from './routes/countries';
import servicesRoutes from './routes/services';
import providersRoutes from './routes/providers';
import countryServicesRoutes from './routes/countryServices';
import bantRoutes from './routes/bant';
import contactRoutes from './routes/contact';
import emailTrackingRoutes from './routes/emailTracking';
import blogsRoutes from './routes/blogs';
import authRoutes from './routes/auth';
import listingsRoutes from './routes/listings';
import { generalRateLimiter, compressionMiddleware } from './middleware';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import { logger } from './utils/logger';
import { startMetricsPush, getMetricsText, getMetricsContentType } from './utils/metricsPush';
import { openApiDocument } from './openapi';

const isProduction = process.env.NODE_ENV === 'production';

// CORS origins from environment
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsOrigins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);

const app = new Hono();

// =============================================================================
// CORS MIDDLEWARE - Must be first, handles all CORS headers
// =============================================================================
app.use('*', async (c, next) => {
  const origin = c.req.header('origin');

  // Set CORS headers for valid origins
  if (origin && (corsOrigins.includes(origin) || corsOrigins.includes('*'))) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID, Authorization');
    c.header('Access-Control-Max-Age', '86400');
  }

  // Handle preflight immediately
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
});

// =============================================================================
// GLOBAL ERROR HANDLER - Catches all errors with CORS headers
// =============================================================================
app.onError((err, c) => {
  const requestId = c.req.header('x-request-id') || 'unknown';

  // Always log full error details for debugging, even in production
  // The error message in logs is NOT sent to clients
  console.error(`[ERROR] ${c.req.method} ${new URL(c.req.url).pathname} [${requestId}]`);
  console.error(`  Message: ${err.message}`);
  console.error(`  Stack: ${err.stack}`);

  logger.error('Unhandled request error', err, {
    requestId,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
  });

  // Ensure CORS headers on error responses
  const origin = c.req.header('origin');
  if (origin && (corsOrigins.includes(origin) || corsOrigins.includes('*'))) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  return c.json({
    success: false,
    error: 'Internal server error',
    message: isProduction ? 'Something went wrong' : err.message,
  }, 500);
});

// =============================================================================
// SIMPLE SECURITY HEADERS - Basic protection, nothing fancy
// =============================================================================
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  if (isProduction) {
    c.header('Strict-Transport-Security', 'max-age=31536000');
  }
  await next();
});

// =============================================================================
// COMPRESSION - Uses Node.js zlib for Bun compiled binary compatibility
// =============================================================================
app.use('/api/*', compressionMiddleware);

// =============================================================================
// RATE LIMITING - Uses proper middleware with headers and cleanup
// =============================================================================
app.use('/api/*', generalRateLimiter as any);

// =============================================================================
// METRICS MIDDLEWARE - Track all API requests
// =============================================================================
app.use('/api/*', metricsMiddleware());

// Start metrics push to Grafana Cloud
startMetricsPush();

// =============================================================================
// HEALTH ENDPOINTS - No rate limiting
// =============================================================================
app.get('/', (c) => {
  return c.json({
    message: 'Thhiya API v2',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'thhiya-api',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Prometheus /metrics endpoint for debugging (optional, not used by Grafana push)
app.get('/metrics', async (c) => {
  const metrics = await getMetricsText();
  return c.text(metrics, 200, {
    'Content-Type': getMetricsContentType(),
  });
});

app.get('/openapi.json', (c) => c.json(openApiDocument));

app.get('/docs', apiReference({
  theme: 'kepler',
  layout: 'modern',
  url: '/openapi.json',
}));

// =============================================================================
// API ROUTES
// =============================================================================
app.route('/api/insights', insightsRoutes);
app.route('/api/countries', countriesRoutes);
app.route('/api/services', servicesRoutes);
app.route('/api/providers', providersRoutes);
app.route('/api/country-services', countryServicesRoutes);
app.route('/api/bant', bantRoutes);
app.route('/api/contact', contactRoutes);
app.route('/api/email/track', emailTrackingRoutes);
app.route('/api/blogs', blogsRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/listings', listingsRoutes);

// =============================================================================
// 404 HANDLER
// =============================================================================
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    message: `Route ${c.req.method} ${c.req.path} not found`,
  }, 404);
});

export default app;