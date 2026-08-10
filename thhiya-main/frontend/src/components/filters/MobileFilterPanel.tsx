import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronDown,
    Filter,
    MapPin,
    Briefcase,
    Languages,
    Calendar,
    SortAsc,
    Check,
    RotateCcw
} from 'lucide-react';

// Types
export type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'services-desc'
    | 'services-asc'
    | 'updated-desc'
    | 'updated-asc'
    | 'region-asc';

export type DateRange = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

interface MobileFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    // Filter values
    searchQuery: string;
    selectedRegion: string;
    selectedService: string;
    selectedLanguage?: string;
    selectedDateRange?: string;
    sortOption: SortOption;
    // Change handlers
    onSearchChange: (query: string) => void;
    onRegionChange: (region: string) => void;
    onServiceChange: (service: string) => void;
    onLanguageChange?: (language: string) => void;
    onDateRangeChange?: (dateRange: string) => void;
    onSortChange: (sort: SortOption) => void;
    onClearFilters: () => void;
    // Options
    availableRegions: string[];
    availableServices: { slug: string; name: string }[];
    availableLanguages?: string[];
    // Display options
    showLanguageFilter?: boolean;
    showDateFilter?: boolean;
    resultCount?: number;
    totalCount?: number;
}

const DATE_RANGE_OPTIONS = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'services-desc', label: 'Most Services' },
    { value: 'services-asc', label: 'Least Services' },
    { value: 'updated-desc', label: 'Recently Updated' },
    { value: 'updated-asc', label: 'Oldest Updated' },
    { value: 'region-asc', label: 'By Region' },
];

// Collapsible filter section component
const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 px-1"
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    {icon}
                    {title}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pb-3"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Radio button option component
const FilterOption: React.FC<{
    label: string;
    value: string;
    selected: boolean;
    onChange: () => void;
    count?: number;
}> = ({ label, value, selected, onChange, count }) => (
    <button
        onClick={onChange}
        className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all ${selected
            ? 'bg-red-50 text-red-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <span className="truncate">{label}</span>
        <div className="flex items-center gap-2">
            {count !== undefined && (
                <span className={`text-xs ${selected ? 'text-red-500' : 'text-gray-400'}`}>
                    ({count})
                </span>
            )}
            {selected && <Check className="w-4 h-4 text-red-600" />}
        </div>
    </button>
);

export const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
    isOpen,
    onClose,
    searchQuery,
    selectedRegion,
    selectedService,
    selectedLanguage = 'all',
    selectedDateRange = 'all',
    sortOption,
    onSearchChange,
    onRegionChange,
    onServiceChange,
    onLanguageChange,
    onDateRangeChange,
    onSortChange,
    onClearFilters,
    availableRegions,
    availableServices,
    availableLanguages = [],
    showLanguageFilter = false,
    showDateFilter = false,
    resultCount,
    totalCount,
}) => {
    const hasActiveFilters = searchQuery ||
        selectedRegion !== 'all' ||
        selectedService !== 'all' ||
        (showLanguageFilter && selectedLanguage !== 'all') ||
        (showDateFilter && selectedDateRange !== 'all');

    const activeFilterCount = [
        searchQuery,
        selectedRegion !== 'all',
        selectedService !== 'all',
        showLanguageFilter && selectedLanguage !== 'all',
        showDateFilter && selectedDateRange !== 'all',
    ].filter(Boolean).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-red-600" />
                                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                                {activeFilterCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Results count */}
                        {resultCount !== undefined && totalCount !== undefined && (
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{resultCount}</span> of{' '}
                                    <span className="font-semibold text-gray-900">{totalCount}</span> results
                                </p>
                            </div>
                        )}

                        {/* Filter content */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            {/* Region Filter */}
                            <FilterSection
                                title="Region"
                                icon={<MapPin className="w-4 h-4 text-gray-500" />}
                            >
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    <FilterOption
                                        label="All Regions"
                                        value="all"
                                        selected={selectedRegion === 'all'}
                                        onChange={() => onRegionChange('all')}
                                    />
                                    {availableRegions.map((region) => (
                                        <FilterOption
                                            key={region}
                                            label={region}
                                            value={region}
                                            selected={selectedRegion === region}
                                            onChange={() => onRegionChange(region)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Service Filter */}
                            <FilterSection
                                title="Service"
                                icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                            >
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    <FilterOption
                                        label="All Services"
                                        value="all"
                                        selected={selectedService === 'all'}
                                        onChange={() => onServiceChange('all')}
                                    />
                                    {availableServices.map((service) => (
                                        <FilterOption
                                            key={service.slug}
                                            label={service.name}
                                            value={service.slug}
                                            selected={selectedService === service.slug}
                                            onChange={() => onServiceChange(service.slug)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Language Filter */}
                            {showLanguageFilter && availableLanguages.length > 0 && (
                                <FilterSection
                                    title="Language"
                                    icon={<Languages className="w-4 h-4 text-gray-500" />}
                                    defaultOpen={false}
                                >
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                        <FilterOption
                                            label="All Languages"
                                            value="all"
                                            selected={selectedLanguage === 'all'}
                                            onChange={() => onLanguageChange?.('all')}
                                        />
                                        {availableLanguages.map((language) => (
                                            <FilterOption
                                                key={language}
                                                label={language}
                                                value={language}
                                                selected={selectedLanguage === language}
                                                onChange={() => onLanguageChange?.(language)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Date Range Filter */}
                            {showDateFilter && (
                                <FilterSection
                                    title="Last Updated"
                                    icon={<Calendar className="w-4 h-4 text-gray-500" />}
                                    defaultOpen={false}
                                >
                                    <div className="space-y-1">
                                        {DATE_RANGE_OPTIONS.map((option) => (
                                            <FilterOption
                                                key={option.value}
                                                label={option.label}
                                                value={option.value}
                                                selected={selectedDateRange === option.value}
                                                onChange={() => onDateRangeChange?.(option.value)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Sort Options */}
                            <FilterSection
                                title="Sort By"
                                icon={<SortAsc className="w-4 h-4 text-gray-500" />}
                            >
                                <div className="space-y-1">
                                    {SORT_OPTIONS.map((option) => (
                                        <FilterOption
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                            selected={sortOption === option.value}
                                            onChange={() => onSortChange(option.value)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>
                        </div>

                        {/* Footer actions */}
                        <div className="px-4 py-4 border-t border-gray-200 bg-white space-y-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={onClearFilters}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Show {resultCount ?? ''} Results
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileFilterPanel;
