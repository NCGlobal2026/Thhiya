/**
 * Prometheus Metrics for Grafana Cloud
 * Defines all metrics for backend monitoring
 */

import {
    Registry,
    Counter,
    Histogram,
    Gauge,
    collectDefaultMetrics,
} from 'prom-client';
import { logger } from './logger';

// Create a custom registry
export const metricsRegistry = new Registry();

// Add default labels
metricsRegistry.setDefaultLabels({
    app: 'thhiya-backend',
    env: process.env.NODE_ENV || 'development',
});

// Collect default metrics (CPU, memory, event loop, etc.)
try {
    collectDefaultMetrics({
        register: metricsRegistry,
        prefix: 'thhiya_',
    });
} catch (error) {
    logger.warn('Failed to initialize default metrics (likely Bun/perf_hooks incompatibility):', error);
}

// =============================================================================
// HTTP METRICS
// =============================================================================

export const httpRequestsTotal = new Counter({
    name: 'thhiya_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [metricsRegistry],
});

export const httpRequestDuration = new Histogram({
    name: 'thhiya_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [metricsRegistry],
});

export const httpActiveRequests = new Gauge({
    name: 'thhiya_http_active_requests',
    help: 'Currently active HTTP requests',
    registers: [metricsRegistry],
});

export const httpErrors = new Counter({
    name: 'thhiya_http_errors_total',
    help: 'Total HTTP errors (4xx and 5xx)',
    labelNames: ['method', 'route', 'status_code', 'error_type'],
    registers: [metricsRegistry],
});

export const httpResponseSize = new Histogram({
    name: 'thhiya_http_response_size_bytes',
    help: 'HTTP response size in bytes',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
    registers: [metricsRegistry],
});

export const httpSuccessTotal = new Counter({
    name: 'thhiya_http_success_total',
    help: 'Total successful HTTP responses (2xx)',
    labelNames: ['method', 'route'],
    registers: [metricsRegistry],
});

export const httpClientErrors = new Counter({
    name: 'thhiya_http_client_errors_total',
    help: 'Total client error responses (4xx)',
    labelNames: ['method', 'route', 'status_code'],
    registers: [metricsRegistry],
});

export const httpServerErrors = new Counter({
    name: 'thhiya_http_server_errors_total',
    help: 'Total server error responses (5xx)',
    labelNames: ['method', 'route', 'status_code'],
    registers: [metricsRegistry],
});

export const httpBandwidthBytes = new Counter({
    name: 'thhiya_http_bandwidth_bytes_total',
    help: 'Total bytes transferred in responses',
    labelNames: ['method', 'direction'],
    registers: [metricsRegistry],
});

export const apiRequestsPerRoute = new Counter({
    name: 'thhiya_api_requests_per_route_total',
    help: 'API requests by route for detailed tracking',
    labelNames: ['route', 'method', 'status_class'],
    registers: [metricsRegistry],
});

// =============================================================================
// PRODUCTION METRICS - Throughput & Performance
// =============================================================================

export const requestThroughput = new Gauge({
    name: 'thhiya_request_throughput_per_second',
    help: 'Current request throughput (requests per second)',
    registers: [metricsRegistry],
});

export const avgResponseTime = new Gauge({
    name: 'thhiya_avg_response_time_ms',
    help: 'Average response time in milliseconds',
    registers: [metricsRegistry],
});

export const p99ResponseTime = new Gauge({
    name: 'thhiya_p99_response_time_ms',
    help: '99th percentile response time in milliseconds',
    registers: [metricsRegistry],
});

export const concurrentConnections = new Gauge({
    name: 'thhiya_concurrent_connections',
    help: 'Number of concurrent connections being handled',
    registers: [metricsRegistry],
});

// =============================================================================
// PRODUCTION METRICS - Error Tracking
// =============================================================================

export const errorsByRoute = new Counter({
    name: 'thhiya_errors_by_route_total',
    help: 'Errors broken down by route and type',
    labelNames: ['route', 'status_code', 'error_type'],
    registers: [metricsRegistry],
});

export const validationErrorsByField = new Counter({
    name: 'thhiya_validation_errors_by_field_total',
    help: 'Validation errors by field name',
    labelNames: ['form_type', 'field', 'error_type'],
    registers: [metricsRegistry],
});

// =============================================================================
// PRODUCTION METRICS - Resource Utilization
// =============================================================================

export const heapFragmentation = new Gauge({
    name: 'thhiya_heap_fragmentation_ratio',
    help: 'Heap memory fragmentation ratio',
    registers: [metricsRegistry],
});

export const gcDuration = new Histogram({
    name: 'thhiya_gc_duration_seconds',
    help: 'Garbage collection duration',
    labelNames: ['gc_type'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1],
    registers: [metricsRegistry],
});

export const openFileDescriptors = new Gauge({
    name: 'thhiya_open_file_descriptors',
    help: 'Number of open file descriptors',
    registers: [metricsRegistry],
});

// =============================================================================
// PRODUCTION METRICS - Business KPIs
// =============================================================================

export const conversionFunnel = new Counter({
    name: 'thhiya_conversion_funnel_total',
    help: 'User journey through conversion funnel',
    labelNames: ['step', 'source'],
    registers: [metricsRegistry],
});

export const userEngagement = new Counter({
    name: 'thhiya_user_engagement_total',
    help: 'User engagement events',
    labelNames: ['event_type', 'page'],
    registers: [metricsRegistry],
});

export const apiLatencyByEndpoint = new Histogram({
    name: 'thhiya_api_latency_by_endpoint_seconds',
    help: 'API latency broken down by endpoint',
    labelNames: ['endpoint', 'method'],
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
    registers: [metricsRegistry],
});

// =============================================================================
// PRODUCTION METRICS - Cache & Optimization
// =============================================================================

export const cacheHitRatio = new Counter({
    name: 'thhiya_cache_operations_total',
    help: 'Cache operations (hits and misses)',
    labelNames: ['operation', 'cache_name'],
    registers: [metricsRegistry],
});

export const compressionSavings = new Counter({
    name: 'thhiya_compression_savings_bytes_total',
    help: 'Bytes saved through compression',
    registers: [metricsRegistry],
});

export const compressionRatio = new Gauge({
    name: 'thhiya_compression_ratio',
    help: 'Current compression ratio (compressed/original)',
    registers: [metricsRegistry],
});

// =============================================================================
// FORM SUBMISSION METRICS
// =============================================================================

export const formSubmissions = new Counter({
    name: 'thhiya_form_submissions_total',
    help: 'Total form submissions',
    labelNames: ['form_type', 'status', 'source'],
    registers: [metricsRegistry],
});

export const formSubmissionDuration = new Histogram({
    name: 'thhiya_form_submission_duration_seconds',
    help: 'Time to process form submission',
    labelNames: ['form_type'],
    buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [metricsRegistry],
});

export const formValidationErrors = new Counter({
    name: 'thhiya_form_validation_errors_total',
    help: 'Form validation errors by field',
    labelNames: ['form_type', 'field_name'],
    registers: [metricsRegistry],
});

// =============================================================================
// EMAIL METRICS
// =============================================================================

export const emailsSent = new Counter({
    name: 'thhiya_emails_sent_total',
    help: 'Total emails sent',
    labelNames: ['type', 'status'],
    registers: [metricsRegistry],
});

export const emailSendDuration = new Histogram({
    name: 'thhiya_email_send_duration_seconds',
    help: 'Time to send email via Mailgun',
    labelNames: ['type'],
    buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10],
    registers: [metricsRegistry],
});

export const emailEvents = new Counter({
    name: 'thhiya_email_events_total',
    help: 'Email tracking events',
    labelNames: ['event_type', 'email_type'],
    registers: [metricsRegistry],
});

// =============================================================================
// DATABASE METRICS
// =============================================================================

export const dbQueryDuration = new Histogram({
    name: 'thhiya_db_query_duration_seconds',
    help: 'MongoDB query duration',
    labelNames: ['collection', 'operation'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [metricsRegistry],
});

export const dbQueries = new Counter({
    name: 'thhiya_db_queries_total',
    help: 'Total database queries',
    labelNames: ['collection', 'operation', 'status'],
    registers: [metricsRegistry],
});

// =============================================================================
// RATE LIMITING METRICS
// =============================================================================

export const rateLimitHits = new Counter({
    name: 'thhiya_rate_limit_hits_total',
    help: 'Requests that hit rate limits',
    labelNames: ['limiter_type', 'route'],
    registers: [metricsRegistry],
});

export const rateLimitBlocked = new Counter({
    name: 'thhiya_rate_limit_blocked_total',
    help: 'Requests blocked by rate limiting',
    labelNames: ['limiter_type', 'route'],
    registers: [metricsRegistry],
});

// =============================================================================
// BUSINESS METRICS
// =============================================================================

export const leadsGenerated = new Counter({
    name: 'thhiya_leads_generated_total',
    help: 'Total qualified leads generated',
    labelNames: ['source', 'service_interest', 'target_country'],
    registers: [metricsRegistry],
});

export const contentViews = new Counter({
    name: 'thhiya_content_views_total',
    help: 'Content page views via API',
    labelNames: ['content_type', 'country', 'service'],
    registers: [metricsRegistry],
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Track a successful form submission
 */
export const trackFormSubmission = (
    formType: 'bant' | 'contact',
    status: 'success' | 'validation_error' | 'server_error',
    source: string,
    durationMs?: number
) => {
    formSubmissions.inc({ form_type: formType, status, source });
    if (durationMs && status === 'success') {
        formSubmissionDuration.observe({ form_type: formType }, durationMs / 1000);
    }
};

/**
 * Track a lead generation event
 */
export const trackLeadGenerated = (
    source: string,
    services: string[],
    targetCountry: string
) => {
    // Track with first service for simplicity (can be expanded)
    const primaryService = services[0] || 'unknown';
    leadsGenerated.inc({
        source,
        service_interest: primaryService,
        target_country: targetCountry,
    });
};

/**
 * Track email sending
 */
export const trackEmailSent = (
    type: 'user_acknowledgement' | 'admin_notification' | 'contact_acknowledgement' | 'contact_notification',
    success: boolean,
    durationMs?: number
) => {
    emailsSent.inc({ type, status: success ? 'success' : 'failed' });
    if (durationMs) {
        emailSendDuration.observe({ type }, durationMs / 1000);
    }
};

/**
 * Track database query
 */
export const trackDbQuery = (
    collection: string,
    operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'aggregate',
    success: boolean,
    durationMs: number
) => {
    dbQueries.inc({ collection, operation, status: success ? 'success' : 'error' });
    dbQueryDuration.observe({ collection, operation }, durationMs / 1000);
    
    // Debug log (sampled at 10%) to verify metrics are being captured
    if (Math.random() < 0.1) {
        logger.debug(`[Metrics] DB Query: ${collection}.${operation} (${durationMs}ms) - ${success ? 'success' : 'error'}`);
    }
};
