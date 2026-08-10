/**
 * Metrics Push Service for Grafana Cloud
 * Pushes metrics to Grafana Cloud using Influx Line Protocol
 * 
 * Required environment variables:
 * - GRAFANA_METRICS_URL: Grafana Cloud Influx endpoint (e.g., https://influx-prod-XX.grafana.net/api/v1/push/influx/write)
 * - GRAFANA_METRICS_USER: Instance ID / username
 * - GRAFANA_API_KEY: API key with MetricsPublisher role
 * 
 * NOTE: Metrics are only pushed in production environment
 * 
 * Memory Optimization:
 * - Resets histogram buckets after each push to prevent memory bloat
 * - Keeps counters intact for cumulative metrics (Grafana uses rate() on these)
 */

import { metricsRegistry } from './metrics';
import { logger } from './logger';

// Environment variables - support both naming conventions
const GRAFANA_METRICS_URL = process.env.GRAFANA_METRICS_URL ||
    (process.env.GRAFANA_PROMETHEUS_URL?.replace('/api/prom/push', '/api/v1/push/influx/write'));
const GRAFANA_METRICS_USER = process.env.GRAFANA_METRICS_USER || process.env.GRAFANA_PROMETHEUS_USER;
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;
const isProduction = process.env.NODE_ENV === 'production';

// Push interval in milliseconds (5 seconds for real-time monitoring)
const PUSH_INTERVAL_MS = 5000;

let pushIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Check if Grafana push is configured and we're in production
 */
export const isGrafanaConfigured = (): boolean => {
    return isProduction && !!(GRAFANA_METRICS_URL && GRAFANA_METRICS_USER && GRAFANA_API_KEY);
};

/**
 * Escape special characters for Influx line protocol
 */
const escapeTag = (value: string): string => {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/ /g, '\\ ')
        .replace(/,/g, '\\,')
        .replace(/=/g, '\\=');
};

const escapeMeasurement = (value: string): string => {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/ /g, '\\ ')
        .replace(/,/g, '\\,');
};

/**
 * Convert Prometheus metrics to Influx Line Protocol
 * Format: measurement,tag1=value1,tag2=value2 field1=value1,field2=value2 timestamp
 */
const convertToInfluxLineProtocol = async (): Promise<string> => {
    const metrics = await metricsRegistry.getMetricsAsJSON();
    const lines: string[] = [];
    const timestamp = Date.now() * 1000000; // nanoseconds

    for (const metric of metrics) {
        const name = escapeMeasurement(metric.name);
        const values = metric.values || [];
        const metricType = String(metric.type); // Convert to string for comparison

        for (const entry of values) {
            const labels = entry.labels || {};
            const value = entry.value;

            // Build tags from labels (skip 'le' and 'quantile' as they're for histograms/summaries)
            const tagPairs: string[] = [];
            for (const [k, v] of Object.entries(labels)) {
                if (k !== 'le' && k !== 'quantile' && v !== undefined && v !== null) {
                    tagPairs.push(`${escapeTag(k)}=${escapeTag(String(v))}`);
                }
            }
            const tags = tagPairs.length > 0 ? ',' + tagPairs.join(',') : '';

            // Handle different metric value types
            if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
                // For histogram buckets, include 'le' in measurement name
                if (metricType === 'histogram' && labels.le !== undefined) {
                    const bucketName = `${name}_bucket`;
                    const leTags = tags + `,le=${escapeTag(String(labels.le))}`;
                    lines.push(`${bucketName}${leTags} value=${value} ${timestamp}`);
                }
                // For summary quantiles, include 'quantile' in tags
                else if (metricType === 'summary' && labels.quantile !== undefined) {
                    const quantileTags = tags + `,quantile=${escapeTag(String(labels.quantile))}`;
                    lines.push(`${name}${quantileTags} value=${value} ${timestamp}`);
                }
                // Regular metrics
                else {
                    lines.push(`${name}${tags} value=${value} ${timestamp}`);
                }
            }
        }

        // Handle histogram _sum and _count which are separate from buckets
        if (metricType === 'histogram' && metric.aggregator) {
            const agg = metric.aggregator as any;
            if (agg.sum !== undefined && !isNaN(agg.sum)) {
                lines.push(`${name}_sum value=${agg.sum} ${timestamp}`);
            }
            if (agg.count !== undefined && !isNaN(agg.count)) {
                lines.push(`${name}_count value=${agg.count} ${timestamp}`);
            }
        }
    }

    return lines.join('\n');
};

/**
 * Push metrics to Grafana Cloud
 */
export const pushMetrics = async (): Promise<void> => {
    if (!isGrafanaConfigured()) {
        return;
    }

    try {
        const lineProtocol = await convertToInfluxLineProtocol();

        if (!lineProtocol.trim()) {
            return;
        }

        const authHeader = `Basic ${Buffer.from(`${GRAFANA_METRICS_USER}:${GRAFANA_API_KEY}`).toString('base64')}`;

        const response = await fetch(GRAFANA_METRICS_URL!, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'text/plain',
            },
            body: lineProtocol,
        });

        if (!response.ok && response.status !== 204) {
            const text = await response.text().catch(() => '');
            logger.warn(`[Metrics] Push failed: ${response.status} - ${text.substring(0, 200)}`);
        } else {
            // Memory optimization: Reset histogram observations after successful push
            // This prevents memory bloat from accumulating histogram buckets
            await resetHistogramMetrics();
        }
    } catch (error) {
        logger.warn('[Metrics] Push error', { error: (error as Error).message });
    }
};

/**
 * Reset histogram metrics after pushing to save memory
 * Only resets histograms - counters are kept for cumulative metrics
 */
const resetHistogramMetrics = async (): Promise<void> => {
    try {
        const metrics = await metricsRegistry.getMetricsAsJSON();
        for (const metric of metrics) {
            if (String(metric.type) === 'histogram') {
                // Get the metric instance and reset it
                const metricInstance = metricsRegistry.getSingleMetric(metric.name);
                if (metricInstance && typeof (metricInstance as any).reset === 'function') {
                    (metricInstance as any).reset();
                }
            }
        }
    } catch (error) {
        // Silently ignore reset errors - not critical
    }
};

/**
 * Start the metrics push loop
 */
export const startMetricsPush = (): void => {
    if (!isProduction) {
        logger.info('[Metrics] Development mode - metrics push disabled');
        return;
    }

    if (!isGrafanaConfigured()) {
        logger.warn('[Metrics] Grafana credentials not configured');
        logger.warn('[Metrics] Need: GRAFANA_METRICS_URL, GRAFANA_METRICS_USER, GRAFANA_API_KEY');
        return;
    }

    if (pushIntervalId) {
        logger.warn('[Metrics] Metrics push already started');
        return;
    }

    logger.info(`[Metrics] Starting metrics push to Grafana Cloud (every ${PUSH_INTERVAL_MS / 1000}s)`);
    logger.info(`[Metrics] Endpoint: ${GRAFANA_METRICS_URL?.substring(0, 50)}...`);

    // Push immediately
    pushMetrics();

    // Then push every interval
    pushIntervalId = setInterval(pushMetrics, PUSH_INTERVAL_MS);
};

/**
 * Stop the metrics push loop
 */
export const stopMetricsPush = (): void => {
    if (pushIntervalId) {
        clearInterval(pushIntervalId);
        pushIntervalId = null;
        logger.info('[Metrics] Stopped metrics push');
    }
};

/**
 * Get metrics as Prometheus text format (for /metrics endpoint)
 */
export const getMetricsText = async (): Promise<string> => {
    return await metricsRegistry.metrics();
};

/**
 * Get content type for Prometheus metrics
 */
export const getMetricsContentType = (): string => {
    return metricsRegistry.contentType;
};
