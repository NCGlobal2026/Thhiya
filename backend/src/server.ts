import { serve } from '@hono/node-server';

// CRITICAL: Register mongoose metrics plugin BEFORE importing app/routes
// This ensures the plugin middleware is attached to all schemas before they're compiled
import { registerMetricsPlugin } from './utils/mongooseMetrics';
registerMetricsPlugin();

import app from './index';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { startProviderIntentRefreshCron } from './cron/dailyUpdate';

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

async function start() {
  const startTime = Date.now();

  logger.startup('Starting Thhiya API server...', {
    environment: isProduction ? 'production' : 'development',
    port,
    hostname,
    logLevel: logger.getLevel(),
  });

  try {
    logger.info('Connecting to database...');
    await connectDatabase();
    logger.db.connected(process.env.MONGODB_URI);
    startProviderIntentRefreshCron();
  } catch (err) {
    logger.error('FATAL: Database connection failed', err);
    process.exit(1);
  }

  serve({
    // app may be cast to `any` in index.ts to accomodate Hono types — use runtime fetch
    fetch: app.fetch,
    port,
    hostname,
  });

  const startupTime = Date.now() - startTime;

  // Log CORS origins for debugging
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

  logger.startup(`Server ready on http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${port}`, {
    startupTime: `${startupTime}ms`,
    corsOrigins: corsOrigin.split(',').map(o => o.trim()),
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.shutdown('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.shutdown('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', reason as Error, { promise: String(promise) });
});

start();
