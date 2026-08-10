import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIES } from '../data/categories';
import { CategoryWithCount } from '../types/category.types';
import { listingsApi } from '../../../services/api';

export const useCategories = (): CategoryWithCount[] => {
    const { data } = useQuery({
        queryKey: ['purple-listing-meta'],
        queryFn: () => listingsApi.getPurpleListingMeta(),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    return useMemo(() => {
        const countsBySlug = new Map(
            (data?.categories ?? []).map((category) => [category.slug, category.companyCount])
        );

        return CATEGORIES.map((category) => ({
            ...category,
            companyCount: countsBySlug.get(category.slug) ?? 0,
        }));
    }, [data]);
};
