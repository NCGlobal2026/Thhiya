import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Cache for provider data
const providerCache = new Map<string, { data: Provider, timestamp: number }>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

export interface Provider {
  _id: string;
  name: string;
  slug?: string;
  country: string;
  service: string;
  logo?: string;
  matchingScore?: string;
  rating?: string;
  productBudget?: string;
  averageSatisfaction?: string;
  clientType?: string;
  badges?: string[];
  intentScore?: number;
  scoringFactors?: {
    marketMomentum: string;
    userSentiment: string;
    featureInnovation: string;
    transparency: string;
  };
  sentimentAnalysis?: {
    positiveReviews: string[];
    negativeReviews: string[];
    lastUpdated: Date;
  };
}

export const getProvidersByServiceAndCountry = async (service: string, country?: string): Promise<Provider[]> => {
  try {
    const params: Record<string, string> = { service };
    if (country) params.country = country;
    const response = await axios.get<{ success: boolean; data: Provider[]; message?: string }>(`${API_BASE_URL}/providers/match`, { params });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Unable to fetch providers');
  } catch (err) {
    console.error('Error fetching providers', err);
    throw err;
  }
};

export const getProviderBySlug = async (slug: string): Promise<Provider | null> => {
  try {
    // 1. Check in-memory Map first for instant access
    const cached = providerCache.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return cached.data;
    }

    // 2. Check localStorage so cache persists across route changes, reloads, and closed tabs (24 hours)
    const localCacheStr = localStorage.getItem(`provider_${slug}`);
    if (localCacheStr) {
      const localCache = JSON.parse(localCacheStr);
      if (Date.now() - localCache.timestamp < CACHE_DURATION_MS) {
        providerCache.set(slug, localCache);
        return localCache.data;
      }
    }

    const response = await axios.get<{ success: boolean; data: Provider; message?: string }>(`${API_BASE_URL}/providers/slug/${slug}`);
    if (response.data.success) {
      const data = response.data.data;
      // 3. Save to cache
      const cacheEntry = { data, timestamp: Date.now() };
      providerCache.set(slug, cacheEntry);
      localStorage.setItem(`provider_${slug}`, JSON.stringify(cacheEntry));
      return data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching provider by slug ${slug}`, err);
    return null;
  }
};
