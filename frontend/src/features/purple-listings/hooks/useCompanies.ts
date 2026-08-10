import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Company } from '../types/company.types';
import { normalizeSupportedCountries } from '../utils/normalizeSupportedCountries';
import { listingsApi } from '../../../services/api';

interface UseCompaniesOptions {
    categorySlug?: string;
    searchQuery?: string;
    country?: string;
    feature?: string;
    sortBy?: 'name' | 'rating' | 'reviews';
    page?: number;
    limit?: number;
}

const normalizeCompany = (company: any): Company => ({
    id: company.id ?? company._id ?? company.slug,
    slug: company.slug,
    name: company.name,
    logo: company.logo ?? '',
    shortDescription: company.shortDescription ?? '',
    fullDescription: company.fullDescription ?? '',
    rating: Number(company.rating ?? 0),
    reviewCount: Number(company.reviewCount ?? 0),
    categories: Array.isArray(company.categories) ? company.categories : [],
    tags: Array.isArray(company.tags) ? company.tags : [],
    foundedYear: Number(company.foundedYear ?? 0),
    headquarters: company.headquarters ?? '',
    website: company.website ?? '',
    pricing: {
        startingAt: company.pricing?.startingAt ?? '',
        model: company.pricing?.model ?? '',
        freeTrial: Boolean(company.pricing?.freeTrial ?? false),
    },
    features: Array.isArray(company.features) ? company.features : [],
    pros: Array.isArray(company.pros) ? company.pros : [],
    cons: Array.isArray(company.cons) ? company.cons : [],
    screenshots: Array.isArray(company.screenshots) ? company.screenshots : [],
    featured: Boolean(company.featured ?? false),
    verifiedAt: company.verifiedAt,
    supportedCountries: normalizeSupportedCountries(company.supportedCountries ?? []),
    serviceFeatures: Array.isArray(company.serviceFeatures) ? company.serviceFeatures : [],
    intentScore: company.intentScore,
    scoringFactors: company.scoringFactors,
    sentimentAnalysis: company.sentimentAnalysis,
});

export const useCompanies = (options: UseCompaniesOptions = {}): Company[] => {
    const {
        categorySlug,
        searchQuery,
        country,
        feature,
        sortBy = 'name',
        page = 1,
        limit = 24,
    } = options;

    const { data: response } = useQuery({
        queryKey: ['purple-listings', { categorySlug, searchQuery, country, feature, sortBy, page, limit }],
        queryFn: async () => {
            const result = await listingsApi.getPurpleListings({
                category: categorySlug,
                search: searchQuery,
                country,
                feature,
                sortBy,
                page,
                limit,
            });

            return {
                ...result,
                data: Array.isArray(result.data) ? result.data.map(normalizeCompany) : [],
            };
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    return useMemo(() => response?.data ?? [], [response]);
};
