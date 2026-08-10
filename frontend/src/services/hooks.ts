import { useQuery } from '@tanstack/react-query';
import { insightsApi } from './api';
import { getAllCountries, getCountryByCode } from './countryService';
import { getAllServices, getServiceBySlug, getServicesByCategory } from './serviceService';
import {
  getAllInsights,
  getInsightsByService,
  getInsightsByCountry,
  getInsightByServiceAndCountry
} from './insightService';
import {
  getAllCountryServices,
  getCountryService,
  getServicesByCountry as getCountryServicesByCountry,
  getCountryServicesMetadata,
  getRegions,
  getCountriesByService as getCountriesByServiceApi,
  RegionWithCountries,
  CountriesByServiceResponse,
  ServiceMetadata,
  CountryMetadata,
  CountryServicesMetadataResponse
} from './countryServiceApi';
import { CANONICAL_SERVICES, TOP_13_SERVICES } from '../constants/canonicalServices';
import slugify from '../utils/slugify';

// Insight Hooks
export const useInsightsMetadata = () => {
  const oldMetadata = useQuery({
    queryKey: ['insights-metadata'],
    queryFn: () => insightsApi.getMetadata(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const newMetadata = useQuery<CountryServicesMetadataResponse>({
    queryKey: ['country-services', 'metadata'],
    queryFn: () => getCountryServicesMetadata(),
    staleTime: 10 * 60 * 1000,
  });

  // Merge both metadata sources
  return useQuery({
    queryKey: ['combined-metadata', oldMetadata.data, newMetadata.data],
    queryFn: () => {
      const oldData = oldMetadata.data;
      const newData = newMetadata.data;

      if (!oldData && !newData) {
        return null;
      }

      // Merge countries (unique values) - prefer new metadata country names
      const allCountries = new Set<string>();
      // Add new metadata countries first (they have proper names)
      newData?.countries?.forEach((c: CountryMetadata) => allCountries.add(c.name));
      oldData?.countries?.forEach((c: string) => allCountries.add(c));

      // Merge services (unique values) - prefer new metadata service names
      const allServices = new Set<string>();
      newData?.services?.forEach((s: ServiceMetadata) => allServices.add(CANONICAL_SERVICES.find(c => c.slug === s.slug)?.name || s.name));
      oldData?.services?.forEach((s: string) => allServices.add(CANONICAL_SERVICES.find(c => slugify(c.name) === slugify(s))?.name || s));

      // Build servicesDetail from new metadata or use old format
      let servicesDetail: any[] = newData?.services?.map((s: ServiceMetadata) => ({
        name: CANONICAL_SERVICES.find(c => c.slug === s.slug)?.name || s.name,
        slug: s.slug,
        countryCount: s.countryCount
      })) || oldData?.servicesDetail || [];

      // Enforce strict 12-service limit
      servicesDetail = servicesDetail.filter((s: any) => TOP_13_SERVICES.includes(s.slug));
      const filteredServices = Array.from(new Set(servicesDetail.map((s: any) => s.name))).sort();

      // Enforce strict 195-country limit
      const filteredCountriesDetail = (newData?.countries || []).slice(0, 192);
      const filteredCountryNames = Array.from(new Set([
        ...filteredCountriesDetail.map((c: CountryMetadata) => c.name),
        ...(oldData?.countries || []).slice(0, 192)
      ])).sort().slice(0, 192);

      return {
        services: filteredServices,
        servicesDetail: servicesDetail as any,
        countries: filteredCountryNames,
        // Include new structured data
        countriesDetail: filteredCountriesDetail,
        regions: newData?.regions || [],
        totalDocuments: newData?.totalDocuments || 0,
      };
    },
    enabled: !oldMetadata.isLoading || !newMetadata.isLoading,
    staleTime: 10 * 60 * 1000,
  });
};

export const useInsight = (service: string, country: string) => {
  // We depend on metadata to avoid firing /insights/pair for services that
  // are not yet seeded on the backend. This reduces noisy 404s and keeps the
  // UX consistent by only querying when the canonical slug or service is
  // available. When metadata is still loading we'll hold the request until
  // it's ready.
  const { data: metadata, isLoading: metadataLoading } = useInsightsMetadata();

  // If metadata is present, enable only when the selected service is known
  // (either human-friendly or slug). If metadata isn't loaded, don't enable
  // the query to avoid making a blind request.
  const enabled = Boolean(
    service &&
    country &&
    !metadataLoading &&
    (metadata?.services.includes(service) ||
      metadata?.servicesDetail?.some((s: ServiceMetadata) => s.slug === service) ||
      metadata?.servicesDetail?.some((s: ServiceMetadata) => s.name === service))
  );

  return useQuery({
    queryKey: ['insight', service, country],
    queryFn: () => insightsApi.getInsight(service, country),
    // Only run when we have the expected inputs and metadata has been
    // resolved (so we don't spam the backend with unknown service queries).
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


export const useCountriesByService = (service: string) => {
  return useQuery({
    queryKey: ['countries', service],
    queryFn: () => insightsApi.getCountriesByService(service),
    enabled: Boolean(service),
    staleTime: 10 * 60 * 1000,
  });
};

export const useAllInsights = () => {
  return useQuery({
    queryKey: ['insights', 'all'],
    queryFn: () => getAllInsights(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInsightsByService = (service: string) => {
  return useQuery({
    queryKey: ['insights', 'service', service],
    queryFn: () => getInsightsByService(service),
    enabled: Boolean(service),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInsightsByCountry = (country: string) => {
  return useQuery({
    queryKey: ['insights', 'country', country],
    queryFn: () => getInsightsByCountry(country),
    enabled: Boolean(country),
    staleTime: 5 * 60 * 1000,
  });
};

// Country Hooks
export const useAllCountries = () => {
  const query = useQuery<any[]>({
    queryKey: ['countries', 'all'],
    queryFn: () => getAllCountries(),
    staleTime: 10 * 60 * 1000, // Countries don't change often
  });

  return {
    ...query,
    data: query.data ? query.data.slice(0, 192) : undefined
  };
};

export const useCountryByCode = (code: string) => {
  return useQuery({
    queryKey: ['country', code],
    queryFn: () => getCountryByCode(code),
    enabled: Boolean(code),
    staleTime: 10 * 60 * 1000,
  });
};

// Service Hooks
export const useAllServices = () => {
  return useQuery({
    queryKey: ['services', 'all'],
    queryFn: () => getAllServices(),
    staleTime: 10 * 60 * 1000, // Services don't change often
  });
};

export const useServiceBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: () => getServiceBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
};

export const useServicesByCategory = (category: string) => {
  return useQuery({
    queryKey: ['services', 'category', category],
    queryFn: () => getServicesByCategory(category),
    enabled: Boolean(category),
    staleTime: 10 * 60 * 1000,
  });
};

// New Country-Services Hooks (v2 API)
export const useAllCountryServices = (filters?: {
  country?: string;
  service?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['country-services', 'all', filters],
    queryFn: () => getAllCountryServices(filters),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCountryService = (country: string, serviceSlug: string) => {
  return useQuery({
    queryKey: ['country-service', country, serviceSlug],
    queryFn: () => getCountryService(country, serviceSlug),
    enabled: Boolean(country && serviceSlug),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCountryServicesByCountry = (country: string) => {
  const query = useQuery<any[]>({
    queryKey: ['country-services', 'country', country],
    queryFn: () => getCountryServicesByCountry(country),
    enabled: Boolean(country),
    staleTime: 10 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ? query.data.filter((s: any) => TOP_13_SERVICES.includes(s.serviceSlug)) : undefined
  };
};

export const useCountryServicesMetadata = () => {
  return useQuery<CountryServicesMetadataResponse>({
    queryKey: ['country-services', 'metadata'],
    queryFn: () => getCountryServicesMetadata(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch all regions with their associated countries
 */
export const useRegions = () => {
  return useQuery<RegionWithCountries[]>({
    queryKey: ['country-services', 'regions'],
    queryFn: () => getRegions(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch all countries that offer a specific service
 * @param serviceSlug - The service slug (e.g., 'eor-peo-aor')
 * @param region - Optional region filter
 */
export const useCountriesForService = (serviceSlug: string, region?: string) => {
  return useQuery<CountriesByServiceResponse>({
    queryKey: ['country-services', 'service', serviceSlug, region],
    queryFn: () => getCountriesByServiceApi(serviceSlug, region),
    enabled: Boolean(serviceSlug),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Convenience hook that returns enhanced metadata with proper typing
 * This replaces the old merged metadata approach with the new API structure
 */
export const useEnhancedMetadata = () => {
  const { data: newMetadata, isLoading, error } = useCountryServicesMetadata();

  // Transform to be compatible with existing components
  const transformedData = newMetadata ? {
    // Country names for dropdowns - limited to 195
    countries: newMetadata.countries.map((c: CountryMetadata) => c.name).slice(0, 192),
    // Service names for dropdowns - limited to TOP_13_SERVICES
    services: newMetadata.services
      .filter((s: ServiceMetadata) => TOP_13_SERVICES.includes(s.slug))
      .map((s: ServiceMetadata) => CANONICAL_SERVICES.find(c => c.slug === s.slug)?.name || s.name),
    // Full country details - limited to 195
    countriesDetail: newMetadata.countries.slice(0, 192),
    // Full service details with slug - limited to TOP_13_SERVICES
    servicesDetail: newMetadata.services
      .filter((s: ServiceMetadata) => TOP_13_SERVICES.includes(s.slug))
      .map((s: ServiceMetadata) => ({ ...s, name: CANONICAL_SERVICES.find(c => c.slug === s.slug)?.name || s.name })),
    // Regions
    regions: newMetadata.regions,
    // Total documents
    totalDocuments: newMetadata.totalDocuments,
  } : null;

  return {
    data: transformedData,
    isLoading,
    error,
  };
};
