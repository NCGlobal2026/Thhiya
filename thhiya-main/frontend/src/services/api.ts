import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Country } from './countryService';
import type { Service } from './serviceService';
import {
  getAllInsights,
  getInsightsByService,
  getInsightsByCountry,
  getInsightByServiceAndCountry,
  type Insight,
  type SalaryBreakdownItem,
  type PayrollInsightItem,
  type EmploymentRequirementPoint,
  type BusinessGuideSection
} from './insightService';
import { wakeUpBackend, isBackendReady } from './healthService';
import { getToastRef } from '../contexts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const isProduction = import.meta.env.PROD;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

// Custom error types
export interface ApiError extends Error {
  isRateLimit?: boolean;
  retryAfter?: number;
  isNetworkError?: boolean;
  isColdStart?: boolean;
  statusCode?: number;
}

// Create axios instance with production-ready defaults
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for cold starts
});

/**
 * Check if error is retryable
 */
const isRetryableError = (error: AxiosError): boolean => {
  // Retry on network errors
  if (!error.response) return true;

  // Retry on server errors (5xx) except 501
  const status = error.response.status;
  if (status >= 500 && status !== 501) return true;

  // Retry on 408 Request Timeout
  if (status === 408) return true;

  // NOTE: Do NOT retry 429 (Rate Limit) errors automatically - this defeats
  // the purpose of rate limiting and causes cascading 429s. Let the caller
  // handle it with user-facing messaging instead.

  return false;
};

/**
 * Calculate retry delay with exponential backoff
 */
const getRetryDelay = (attempt: number, retryAfter?: number): number => {
  if (retryAfter) {
    return Math.min(retryAfter * 1000, MAX_RETRY_DELAY);
  }
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
};

/**
 * Sleep utility
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add a unique request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if backend needs wakeup before first real API call
    if (!isBackendReady()) {
      await wakeUpBackend(2); // Quick wake-up attempt with 2 retries
    }

    // Inject Auth Token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (!originalRequest) {
      throw createApiError('Request configuration error', error);
    }

    // Initialize retry count
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Check if we should retry
    if (isRetryableError(error) && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount++;

      const retryAfter = error.response?.headers?.['retry-after'];
      const delay = getRetryDelay(originalRequest._retryCount, retryAfter ? parseInt(retryAfter) : undefined);

      if (!isProduction) {
        console.info(`🔄 Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) in ${delay}ms`);
      }

      // For 5xx errors, try waking up the backend first
      if (error.response?.status && error.response.status >= 500) {
        await wakeUpBackend(1);
      }

      await sleep(delay);
      return api(originalRequest);
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data, headers } = error.response as { status: number; data: any; headers: any };

      // Rate limiting (429)
      if (status === 429) {
        const retryAfter = headers['retry-after'] || (data as any)?.retryAfter || 60;
        const rateLimitError = createApiError(
          (data as any)?.message || `Too many requests. Please wait ${retryAfter} seconds.`,
          error
        );
        rateLimitError.isRateLimit = true;
        rateLimitError.retryAfter = retryAfter;
        rateLimitError.statusCode = 429;

        // Show toast notification
        getToastRef()?.rateLimit(retryAfter);

        throw rateLimitError;
      }

      // Server errors (5xx) - likely cold start
      if (status >= 500) {
        const serverError = createApiError(
          (data as any)?.message || 'Server is starting up. Please try again in a moment.',
          error
        );
        serverError.isColdStart = true;
        serverError.statusCode = status;
        throw serverError;
      }

      // Client errors (4xx)
      if (status >= 400) {
        const clientError = createApiError(
          (data as any)?.message || (data as any)?.error || 'Request failed',
          error
        );
        clientError.statusCode = status;
        throw clientError;
      }
    }

    // Network errors (no response)
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = createApiError(
        'Request timed out. The server may be starting up - please try again.',
        error
      );
      timeoutError.isColdStart = true;
      throw timeoutError;
    }

    if (!error.response) {
      const networkError = createApiError(
        'Network error. Please check your connection or try again.',
        error
      );
      networkError.isNetworkError = true;

      // Show toast notification
      getToastRef()?.networkError();

      throw networkError;
    }

    throw error;
  }
);

/**
 * Create a standardized API error
 */
function createApiError(message: string, originalError?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  if (originalError instanceof Error) {
    error.stack = originalError.stack;
  }
  return error;
}

// Re-export types
export type {
  Country,
  Service,
  Insight,
  SalaryBreakdownItem,
  PayrollInsightItem,
  EmploymentRequirementPoint,
  BusinessGuideSection
};

export interface InsightMetadata {
  services: string[];
  servicesDetail?: Service[]; // canonical service list with slug
  countries: string[];
}

const encode = (value: string) => encodeURIComponent(value.trim());

export const insightsApi = {
  getInsight: async (service: string, country: string): Promise<Insight> => {
    return getInsightByServiceAndCountry(service, country);
  },

  getAllInsights: async (): Promise<Insight[]> => {
    return getAllInsights();
  },

  getMetadata: async (): Promise<InsightMetadata> => {
    const response = await api.get<{ success: boolean; data: InsightMetadata; message?: string }>(
      '/insights/metadata'
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Unable to load insights metadata');
  },

  getCountriesByService: async (service: string): Promise<string[]> => {
    const cleanedService = service.replace(/\s+services?$/i, '').trim();
    const response = await api.get<{ success: boolean; data: string[]; message?: string }>(
      `/insights/countries/by-service/${encode(cleanedService)}`
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Unable to load countries for service');
  },
};

export interface PurpleListingsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  country?: string;
  feature?: string;
  sortBy?: 'name' | 'rating' | 'reviews';
}

export interface PurpleListingsResponse<T = any> {
  data: T[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: PurpleListingsQueryParams;
}

export interface PurpleListingMetaCategory {
  slug: string;
  companyCount: number;
}

export interface PurpleListingMetaResponse {
  total: number;
  categories: PurpleListingMetaCategory[];
  countries: string[];
  features: string[];
}

export const listingsApi = {
  submitRequest: async (data: any): Promise<any> => {
    const response = await api.post('/listings/request', data);
    return response.data;
  },
  upsertMyRequest: async (data: any): Promise<any> => {
    const response = await api.put('/listings/my-request', data);
    return response.data;
  },
  getMyRequest: async (): Promise<any> => {
    const response = await api.get('/listings/my-request');
    return response.data;
  },
  updateMyRequestPlan: async (selectedPlan: string): Promise<any> => {
    const response = await api.patch('/listings/my-request/plan', { selectedPlan });
    return response.data;
  },
  getPurpleListings: async (params: PurpleListingsQueryParams = {}): Promise<PurpleListingsResponse> => {
    const response = await api.get('/listings/purple', { params });
    return response.data;
  },
  getPurpleListingMeta: async (): Promise<PurpleListingMetaResponse> => {
    const response = await api.get('/listings/purple/meta');
    return response.data.data;
  },
  getPurpleListingBySlug: async (slug: string): Promise<any> => {
    const response = await api.get(`/listings/purple/${slug}`);
    return response.data.data;
  },
  seedPurpleListings: async (listings: any[]): Promise<any> => {
    const response = await api.post('/listings/seed-purple', { listings });
    return response.data;
  }
};
