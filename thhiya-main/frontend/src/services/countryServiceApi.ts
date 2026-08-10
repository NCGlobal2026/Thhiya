import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CountryServiceData {
  _id: string;
  country: string;
  countryCode: string;
  countrySlug?: string;
  region: string;
  service: string;
  serviceSlug: string;
  serviceNumber?: number;
  heroData: {
    title: string;
    subtitle: string;
    description: string;
    bestFor?: string;
  };
  sections: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    description?: string;
    order: number;
    content: any;
    styling?: {
      icon?: string;
      iconColor?: string;
    };
  }>;
  interactiveComponents?: Array<any>;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
}

export interface CountryServiceSummary {
  _id: string;
  country: string;
  countryCode: string;
  service: string;
  serviceSlug: string;
  heroData: {
    description: string;
  };
  isActive: boolean;
}

/**
 * Get all country-services (optionally filtered)
 */
export const getAllCountryServices = async (filters?: {
  country?: string;
  service?: string;
  isActive?: boolean;
}): Promise<CountryServiceSummary[]> => {
  const params = new URLSearchParams();
  if (filters?.country) params.append('country', filters.country);
  if (filters?.service) params.append('service', filters.service);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

  params.append('t', String(Date.now()));
  const response = await api.get(`/country-services?${params.toString()}`);
  return response.data.data;
};

/**
 * Get specific country-service details
 */
export const getCountryService = async (
  country: string,
  serviceSlug: string
): Promise<CountryServiceData> => {
  const response = await api.get(`/country-services/${encodeURIComponent(country)}/${encodeURIComponent(serviceSlug)}?t=${Date.now()}`);
  return response.data.data;
};

/**
 * Get all services for a specific country
 */
export const getServicesByCountry = async (country: string): Promise<CountryServiceSummary[]> => {
  const response = await api.get(`/country-services/${encodeURIComponent(country)}?t=${Date.now()}`);
  return response.data.data;
};

// Types for metadata responses
export interface CountryMetadata {
  slug: string;
  name: string;
  code: string;
  region: string;
  serviceCount: number;
}

export interface ServiceMetadata {
  slug: string;
  name: string;
  countryCount: number;
}

export interface RegionMetadata {
  name: string;
  countryCount: number;
}

export interface CountryServicesMetadataResponse {
  countries: CountryMetadata[];
  services: ServiceMetadata[];
  regions: RegionMetadata[];
  totalDocuments: number;
}

export interface RegionWithCountries {
  region: string;
  countryCount: number;
  countries: Array<{
    slug: string;
    name: string;
    code: string;
    serviceCount: number;
  }>;
}

export interface CountriesByServiceResponse {
  service: string;
  serviceSlug: string;
  count: number;
  byRegion: Record<string, CountryServiceData[]>;
  data: CountryServiceData[];
}

/**
 * Get metadata (available countries, services, and regions)
 */
export const getCountryServicesMetadata = async (): Promise<CountryServicesMetadataResponse> => {
  const response = await api.get(`/country-services/metadata?t=${Date.now()}`);
  return response.data.data;
};

/**
 * Get all regions with their countries
 */
export const getRegions = async (): Promise<RegionWithCountries[]> => {
  const response = await api.get(`/country-services/regions?t=${Date.now()}`);
  return response.data.data;
};

/**
 * Get all countries offering a specific service
 * @param serviceSlug - The service slug (e.g., 'eor-peo-aor', 'global-payroll')
 * @param region - Optional region filter
 */
export const getCountriesByService = async (
  serviceSlug: string,
  region?: string
): Promise<CountriesByServiceResponse> => {
  const params = new URLSearchParams();
  if (region) params.append('region', region);

  const queryString = params.toString();
  const url = `/country-services/service/${encodeURIComponent(serviceSlug)}${queryString ? `?${queryString}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

export default {
  getAllCountryServices,
  getCountryService,
  getServicesByCountry,
  getCountryServicesMetadata,
  getRegions,
  getCountriesByService,
};
