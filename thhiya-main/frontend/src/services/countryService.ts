import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const encode = (value: string) => encodeURIComponent(value.trim());

export interface CountryServiceSummary {
  service: string;
  count: number;
}

export interface Country {
  _id: string;
  name: string;
  code: string;
  slug: string;
  flag: string;
  region?: string;
  languages: string[];
  currency?: string;
  employmentCost?: string;
  annualLeave?: string;
  defaultService?: string;
  servicesOffered?: string[];
  metadata?: Record<string, unknown>;
  serviceSummary?: CountryServiceSummary[];
  insightCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CountryResponse {
  success: boolean;
  data: Country | Country[];
  count?: number;
  message?: string;
  error?: string;
}

/**
 * Get all countries
 */
/**
 * Get all countries
 */
export const getAllCountries = async (): Promise<Country[]> => {
  try {
    // Prefer live API so preview fields (employmentCost/annualLeave/etc.) stay fresh.
    const response = await axios.get<CountryResponse>(`${API_BASE_URL}/countries?t=${Date.now()}`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // Fallback: static index for resilience when API is unavailable
    try {
      const response = await axios.get<any[]>('/data/country-index.json', {
        headers: { 'Cache-Control': 'no-cache' } // Ensure fresh index
      });
      if (response.data && Array.isArray(response.data)) {
        // Map index data to Country interface
        return response.data.map((item: any) => ({
          _id: item.id || item.slug,
          name: item.name,
          code: item.code,
          slug: item.id || item.slug,
          flag: item.flag,
          region: item.region,
          languages: item.languages,
          currency: item.currency,
          employmentCost: item.employmentCost,
          annualLeave: item.annualLeave,
          servicesOffered: item.services,
          insightCount: item.count,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (idxError) {
      console.warn('Failed to load static index, falling back to API', idxError);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

/**
 * Get country by code
 */
export const getCountryByCode = async (code: string): Promise<Country> => {
  try {
    const response = await axios.get<CountryResponse>(`${API_BASE_URL}/countries/${encode(code)}`);
    if (response.data.success && !Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Country not found');
  } catch (error) {
    console.error(`Error fetching country ${code}:`, error);
    throw error;
  }
};
