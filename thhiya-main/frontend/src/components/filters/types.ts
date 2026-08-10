// Shared types for filter components

export type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'services-desc'
    | 'services-asc'
    | 'updated-desc'
    | 'updated-asc'
    | 'region-asc'
    | 'cost-asc'
    | 'cost-desc';

export type ViewMode = 'grid' | 'list';

export type DateRange = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface FilterState {
    searchQuery: string;
    selectedRegion: string;
    selectedService: string;
    selectedLanguage: string;
    selectedCountry: string;
    selectedDateRange: DateRange;
    sortOption: SortOption;
    viewMode: ViewMode;
}

export interface ServiceOption {
    slug: string;
    name: string;
    count?: number;
}

export interface CountryOption {
    value: string;
    label: string;
    count?: number;
}

export interface BaseFilterProps {
    searchQuery: string;
    selectedRegion: string;
    selectedService: string;
    sortOption: SortOption;
    onSearchChange: (query: string) => void;
    onRegionChange: (region: string) => void;
    onServiceChange: (service: string) => void;
    onSortChange: (sort: SortOption) => void;
    onClearFilters: () => void;
    availableRegions: string[];
    availableServices: ServiceOption[];
}

export const SORT_OPTIONS: { value: SortOption; label: string; description?: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)', description: 'Alphabetical order' },
    { value: 'name-desc', label: 'Name (Z-A)', description: 'Reverse alphabetical' },
    { value: 'services-desc', label: 'Most Services', description: 'Countries with most services first' },
    { value: 'services-asc', label: 'Least Services', description: 'Countries with least services first' },
    { value: 'updated-desc', label: 'Recently Updated', description: 'Most recently updated first' },
    { value: 'updated-asc', label: 'Oldest Updated', description: 'Oldest updates first' },
    { value: 'region-asc', label: 'By Region', description: 'Grouped by geographic region' },
];

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
];
