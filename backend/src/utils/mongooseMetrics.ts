/**
 * Mongoose Metrics Plugin
 * Automatically instruments all MongoDB operations for Prometheus metrics
 * 
 * Tracks:
 * - Query duration (histogram)
 * - Query count by collection, operation, and status (counter)
 */

import mongoose, { Schema } from 'mongoose';
import { trackDbQuery } from './metrics';
import { logger } from './logger';

// Symbol to store start time on query objects
const START_TIME = Symbol('queryStartTime');

/**
 * Map Mongoose operation names to simplified operation types
 */
const getOperationType = (op: string): 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'aggregate' => {
    const opLower = op.toLowerCase();

    if (opLower.includes('find')) {
        return opLower === 'findone' ? 'findOne' : 'find';
    }
    if (opLower.includes('insert') || opLower.includes('create') || opLower === 'save') {
        return 'insert';
    }
    if (opLower.includes('update') || opLower.includes('replace')) {
        return 'update';
    }
    if (opLower.includes('delete') || opLower.includes('remove')) {
        return 'delete';
    }
    if (opLower.includes('aggregate')) {
        return 'aggregate';
    }

    // Default to find for count operations
    if (opLower.includes('count')) {
        return 'find';
    }

    return 'find';
};

/**
 * Metrics plugin function that can be applied to individual schemas
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metricsPlugin = (schema: Schema<any>): void => {
    // Query middleware - handles find, findOne, findOneAndUpdate, etc.
    schema.pre(/^find|count|update|delete|remove/, function () {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)[START_TIME] = Date.now();
        } catch {
            // Silently ignore metrics errors
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema.post(/^find|count|update|delete|remove/, function (this: any) {
        try {
            const startTime = (this)[START_TIME];
            if (startTime) {
                const duration = Date.now() - startTime;
                const collection = this.model?.modelName || 'unknown';
                const op = this.op || 'find';

                trackDbQuery(collection, getOperationType(op), true, duration);
            }
        } catch {
            // Silently ignore metrics errors
        }
    });

    // Save middleware - handles document.save()
    schema.pre('save', function () {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)[START_TIME] = Date.now();
        } catch {
            // Silently ignore metrics errors
        }
    });

    schema.post('save', function () {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const startTime = (this as any)[START_TIME];
            if (startTime) {
                const duration = Date.now() - startTime;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const collection = (this.constructor as any).modelName || 'unknown';

                trackDbQuery(collection, 'insert', true, duration);
            }
        } catch {
            // Silently ignore metrics errors
        }
    });

    // Aggregate middleware - NOTE: post aggregate doesn't use next() in Mongoose 6+
    schema.pre('aggregate', function () {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)[START_TIME] = Date.now();
        } catch {
            // Silently ignore metrics errors
        }
    });

    // Post aggregate success - no next() callback in Mongoose 6+
    schema.post('aggregate', function () {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const startTime = (this as any)[START_TIME];
            if (startTime) {
                const duration = Date.now() - startTime;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const collection = (this as any)._model?.modelName || 'aggregate';

                trackDbQuery(collection, 'aggregate', true, duration);
            }
        } catch {
            // Silently ignore metrics errors
        }
    });
};

/**
 * Register the metrics plugin globally on Mongoose
 * Should be called before connecting to the database
 */
export const registerMetricsPlugin = (): void => {
    logger.info('[Metrics] Registering Mongoose metrics plugin');
    mongoose.plugin(metricsPlugin);
};
