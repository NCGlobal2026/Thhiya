import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thhiya';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// NOTE: Metrics plugin is registered in server.ts BEFORE importing app/routes
// This ensures the plugin middleware is attached to all schemas before they're compiled

export const connectDatabase = async (maxRetries = 5) => {
  // Connection options tuned for Atlas / SRV and short server selection time.
  // These options make failures quicker and allow retry/backoff behavior.
  const options = {
    // Time to wait for server selection before failing (ms)
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_MS) || 10000,
    // How long to allow the initial TCP connect to take
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 10000,
    // Pool sizing
    maxPoolSize: Number(process.env.MONGODB_MAX_POOLSIZE) || 10,
    // Use IPv4 where DNS may resolve to IPv6 addresses that are not reachable
    family: 4,
  } as const;

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(MONGODB_URI, options);
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      logger.db.error(error);
      attempt += 1;
      if (attempt > maxRetries) {
        logger.error('Exceeded max MongoDB connection retries', error, {
          attempts: attempt,
          maxRetries,
        });
        throw error;
      }
      const backoffMs = Math.min(30_000, 1000 * 2 ** attempt);
      logger.warn(`Retrying MongoDB connection in ${backoffMs}ms`, {
        attempt,
        maxRetries,
        backoffMs,
      });
      await sleep(backoffMs);
    }
  }
};

export default mongoose;
