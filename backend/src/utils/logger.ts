/**
 * Production-ready Logger Utility
 * 
 * Features:
 * - Configurable log levels via LOG_LEVEL env variable
 * - Colored output in development for better readability
 * - Structured JSON logging option for production (LOG_FORMAT=json)
 * - Context-aware logging with request tracking
 * - Specialized logging for different services (email, database, api)
 */

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (isProduction ? 'warn' : 'debug');
const LOG_FORMAT = process.env.LOG_FORMAT || (isProduction ? 'json' : 'pretty');

// Log level priorities (lower = more verbose)
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Get current log level priority
const currentLogLevel = LOG_LEVELS[LOG_LEVEL as LogLevel] ?? LOG_LEVELS.info;

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',

    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
};

// Level-specific colors and labels
const levelConfig = {
    debug: { color: colors.gray, label: 'DEBUG', icon: '[D]' },
    info: { color: colors.cyan, label: 'INFO', icon: '[I]' },
    warn: { color: colors.yellow, label: 'WARN', icon: '[W]' },
    error: { color: colors.red, label: 'ERROR', icon: '[E]' },
    startup: { color: colors.green, label: 'STARTUP', icon: '[>]' },
    shutdown: { color: colors.magenta, label: 'SHUTDOWN', icon: '[X]' },
    email: { color: colors.blue, label: 'EMAIL', icon: '[M]' },
    db: { color: colors.green, label: 'DATABASE', icon: '[DB]' },
    api: { color: colors.cyan, label: 'API', icon: '[API]' },
};

interface LogContext {
    requestId?: string;
    method?: string;
    path?: string;
    duration?: number;
    statusCode?: number;
    service?: string;
    action?: string;
    userId?: string;
    ip?: string;
    [key: string]: unknown;
}

/**
 * Format timestamp for logs
 */
const timestamp = (): string => new Date().toISOString();

/**
 * Sanitize sensitive data from objects
 */
const sanitizeData = (data: unknown): unknown => {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeData(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Sanitize error for production (remove sensitive details)
 */
const sanitizeError = (error: unknown): { message: string; name: string; stack?: string } => {
    if (error instanceof Error) {
        return {
            name: error.name || 'Error',
            message: isProduction ? 'An error occurred' : error.message,
            stack: isProduction ? undefined : error.stack,
        };
    }
    return { name: 'Error', message: String(error) };
};

/**
 * Format context for pretty printing
 */
const formatContextPretty = (context?: LogContext): string => {
    if (!context) return '';

    const parts: string[] = [];

    if (context.requestId) parts.push(`${colors.dim}[${context.requestId}]${colors.reset}`);
    if (context.service) parts.push(`${colors.bright}${context.service}${colors.reset}`);
    if (context.action) parts.push(`${colors.dim}→${colors.reset} ${context.action}`);
    if (context.method && context.path) {
        parts.push(`${colors.bright}${context.method}${colors.reset} ${context.path}`);
    }
    if (context.statusCode) {
        const statusColor = context.statusCode >= 500 ? colors.red :
            context.statusCode >= 400 ? colors.yellow : colors.green;
        parts.push(`${statusColor}${context.statusCode}${colors.reset}`);
    }
    if (context.duration !== undefined) {
        const durationColor = context.duration > 1000 ? colors.red :
            context.duration > 500 ? colors.yellow : colors.green;
        parts.push(`${durationColor}${context.duration}ms${colors.reset}`);
    }

    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
};

/**
 * Format log entry as JSON
 */
const formatJSON = (level: string, message: string, context?: LogContext, error?: unknown): string => {
    const entry: Record<string, unknown> = {
        timestamp: timestamp(),
        level,
        message,
        ...(context ? sanitizeData(context) as Record<string, unknown> : {}),
    };

    if (error) {
        entry.error = sanitizeError(error);
    }

    return JSON.stringify(entry);
};

/**
 * Format log entry for pretty printing
 */
const formatPretty = (
    level: keyof typeof levelConfig,
    message: string,
    context?: LogContext,
    error?: unknown,
    data?: unknown
): string => {
    const config = levelConfig[level];
    const ts = `${colors.dim}${timestamp()}${colors.reset}`;
    const levelStr = `${config.color}${config.label.padEnd(8)}${colors.reset}`;
    const contextStr = formatContextPretty(context);

    let output = `${ts} ${config.icon} ${levelStr}${contextStr} ${message}`;

    if (data && !isProduction) {
        output += `\n${colors.dim}${JSON.stringify(sanitizeData(data), null, 2)}${colors.reset}`;
    }

    if (error && !isProduction) {
        const errInfo = sanitizeError(error);
        output += `\n${colors.red}${errInfo.name}: ${errInfo.message}${colors.reset}`;
        if (errInfo.stack) {
            output += `\n${colors.dim}${errInfo.stack}${colors.reset}`;
        }
    }

    return output;
};

/**
 * Check if log level should be output
 */
const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= currentLogLevel;
};

/**
 * Main log function
 */
const log = (
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown,
    data?: unknown
): void => {
    if (!shouldLog(level)) return;

    const output = LOG_FORMAT === 'json'
        ? formatJSON(level, message, context, error)
        : formatPretty(level as keyof typeof levelConfig, message, context, error, data);

    if (level === 'error') {
        console.error(output);
    } else if (level === 'warn') {
        console.warn(output);
    } else {
        console.log(output);
    }
};

/**
 * Production-ready logger
 */
export const logger = {
    /**
     * Debug level - for detailed debugging info
     */
    debug: (message: string, data?: unknown, context?: LogContext) => {
        log('debug', message, context, undefined, data);
    },

    /**
     * Info level - for general operational info
     */
    info: (message: string, data?: unknown, context?: LogContext) => {
        log('info', message, context, undefined, data);
    },

    /**
     * Warning level - for potential issues
     */
    warn: (message: string, data?: unknown, context?: LogContext) => {
        log('warn', message, context, undefined, data);
    },

    /**
     * Error level - for errors and exceptions
     */
    error: (message: string, error?: unknown, context?: LogContext) => {
        log('error', message, context, error);
    },

    /**
     * Log API request with timing
     */
    request: (context: LogContext & { level?: LogLevel }) => {
        const { level = 'info', ...ctx } = context;
        const status = ctx.statusCode || 0;
        const duration = ctx.duration || 0;

        // Determine log level based on response status
        let logLevel: LogLevel = level;
        if (status >= 500) logLevel = 'error';
        else if (status >= 400) logLevel = 'warn';
        else if (duration > 1000) logLevel = 'warn';

        // In production, only log errors and slow requests
        if (isProduction && status < 400 && duration < 1000) {
            return;
        }

        const message = `${ctx.method} ${ctx.path}`;
        log(logLevel, message, { ...ctx, service: 'api' });
    },

    /**
     * Log startup event (always logs)
     */
    startup: (message: string, data?: unknown) => {
        const config = levelConfig.startup;
        if (LOG_FORMAT === 'json') {
            console.log(formatJSON('info', message, { service: 'startup', ...data as object }));
        } else {
            const ts = `${colors.dim}${timestamp()}${colors.reset}`;
            const dataStr = data ? `\n${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}` : '';
            console.log(`${ts} ${config.icon} ${config.color}${config.label}${colors.reset}  ${message}${dataStr}`);
        }
    },

    /**
     * Log shutdown event (always logs)
     */
    shutdown: (message: string) => {
        const config = levelConfig.shutdown;
        if (LOG_FORMAT === 'json') {
            console.log(formatJSON('info', message, { service: 'shutdown' }));
        } else {
            const ts = `${colors.dim}${timestamp()}${colors.reset}`;
            console.log(`${ts} ${config.icon} ${config.color}${config.label}${colors.reset} ${message}`);
        }
    },

    /**
     * Email-specific logging
     */
    email: {
        sending: (to: string | string[], subject: string) => {
            if (!shouldLog('info')) return;
            const recipients = Array.isArray(to) ? to.join(', ') : to;
            log('info', `Sending email to ${recipients}`, { service: 'email', action: 'send' }, undefined, { subject });
        },

        sent: (to: string | string[], subject: string, messageId?: string) => {
            if (!shouldLog('info')) return;
            const recipients = Array.isArray(to) ? to.join(', ') : to;
            log('info', `Email sent successfully to ${recipients}`, { service: 'email', action: 'sent' }, undefined, { subject, messageId });
        },

        failed: (to: string | string[], subject: string, error: unknown) => {
            const recipients = Array.isArray(to) ? to.join(', ') : to;
            log('error', `Failed to send email to ${recipients}`, { service: 'email', action: 'failed' }, error, { subject });
        },

        disabled: (to: string | string[], subject: string) => {
            if (!shouldLog('debug')) return;
            const recipients = Array.isArray(to) ? to.join(', ') : to;
            log('debug', `Email sending disabled - would send to ${recipients}`, { service: 'email', action: 'disabled' }, undefined, { subject });
        },
    },

    /**
     * Database-specific logging
     */
    db: {
        connected: (uri?: string) => {
            const safeUri = uri ? uri.replace(/:\/\/[^@]+@/, '://***:***@') : 'unknown';
            log('info', `Connected to database`, { service: 'database', action: 'connected' }, undefined, { uri: safeUri });
        },

        disconnected: () => {
            log('warn', 'Disconnected from database', { service: 'database', action: 'disconnected' });
        },

        error: (error: unknown) => {
            log('error', 'Database error', { service: 'database', action: 'error' }, error);
        },

        query: (collection: string, operation: string, duration?: number) => {
            if (!shouldLog('debug')) return;
            log('debug', `${operation} on ${collection}`, { service: 'database', action: operation, duration });
        },
    },

    /**
     * Create a child logger with preset context
     */
    child: (context: LogContext) => ({
        debug: (message: string, data?: unknown) => logger.debug(message, data, context),
        info: (message: string, data?: unknown) => logger.info(message, data, context),
        warn: (message: string, data?: unknown) => logger.warn(message, data, context),
        error: (message: string, error?: unknown) => logger.error(message, error, context),
    }),

    /**
     * Get current log level
     */
    getLevel: (): string => LOG_LEVEL,

    /**
     * Check if a level would be logged
     */
    isLevelEnabled: (level: LogLevel): boolean => shouldLog(level),
};

export default logger;
