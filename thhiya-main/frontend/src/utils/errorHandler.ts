/**
 * Error Handling Utilities
 * Provides consistent error handling across the application
 */

export interface ApiError {
    message: string;
    isRateLimit?: boolean;
    retryAfter?: number;
    isNetworkError?: boolean;
    isTimeout?: boolean;
    isColdStart?: boolean;
    statusCode?: number;
    validationErrors?: Array<{ field: string; message: string }>;
}

/**
 * Parse an error and return a standardized ApiError object
 */
export function parseError(error: unknown): ApiError {
    // Handle rate limit errors (from our API error type)
    if (error && typeof error === 'object' && 'isRateLimit' in error) {
        const rateLimitError = error as { isRateLimit: boolean; retryAfter?: number; message?: string };
        return {
            message: rateLimitError.message || `Too many requests. Please wait ${rateLimitError.retryAfter || 60} seconds.`,
            isRateLimit: true,
            retryAfter: rateLimitError.retryAfter || 60,
        };
    }

    // Handle cold start errors (server waking up)
    if (error && typeof error === 'object' && 'isColdStart' in error) {
        const coldStartError = error as { isColdStart: boolean; message?: string };
        return {
            message: coldStartError.message || 'Server is starting up. Please wait a moment and try again.',
            isColdStart: true,
        };
    }

    // Handle axios/fetch errors with response
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: any } };
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        if (status === 429) {
            return {
                message: data?.message || 'Too many requests. Please try again later.',
                isRateLimit: true,
                retryAfter: data?.retryAfter || 60,
                statusCode: 429,
            };
        }

        if (status === 413) {
            return {
                message: 'Request too large. Please reduce the size of your submission.',
                statusCode: 413,
            };
        }

        if (status === 422 || (data?.validationErrors && Array.isArray(data.validationErrors))) {
            return {
                message: data?.message || 'Validation failed. Please check your input.',
                validationErrors: data?.validationErrors,
                statusCode: status,
            };
        }

        if (status && status >= 500) {
            return {
                message: 'Server is starting up or temporarily unavailable. Please try again.',
                statusCode: status,
                isColdStart: true,
            };
        }

        if (status && status >= 400) {
            return {
                message: data?.message || data?.error || 'Request failed. Please try again.',
                statusCode: status,
            };
        }
    }

    // Handle network errors
    if (error && typeof error === 'object') {
        const err = error as { code?: string; message?: string; isNetworkError?: boolean };

        if (err.isNetworkError) {
            return {
                message: err.message || 'Network error. Please check your connection.',
                isNetworkError: true,
            };
        }

        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            return {
                message: 'Request timed out. Server may be starting up - please try again.',
                isTimeout: true,
                isColdStart: true,
            };
        }

        if (err.message?.includes('Network') || err.message?.includes('network')) {
            return {
                message: 'Network error. Please check your internet connection.',
                isNetworkError: true,
            };
        }

        if (err.message?.includes('CORS') || err.message?.includes('cross-origin')) {
            return {
                message: 'Server is starting up. Please wait a moment and try again.',
                isColdStart: true,
            };
        }
    }

    // Handle Error objects
    if (error instanceof Error) {
        return {
            message: error.message || 'An unexpected error occurred.',
        };
    }

    // Handle string errors
    if (typeof error === 'string') {
        return { message: error };
    }

    // Default fallback
    return {
        message: 'An unexpected error occurred. Please try again.',
    };
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    const parsed = parseError(error);
    return parsed.message;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
    const parsed = parseError(error);
    return parsed.isRateLimit === true;
}

/**
 * Check if error is a cold start error (server waking up)
 */
export function isColdStartError(error: unknown): boolean {
    const parsed = parseError(error);
    return parsed.isColdStart === true;
}

/**
 * Get retry after seconds for rate limit errors
 */
export function getRetryAfter(error: unknown): number | null {
    const parsed = parseError(error);
    return parsed.retryAfter ?? null;
}

/**
 * Format seconds into a human-readable string
 */
export function formatRetryTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
