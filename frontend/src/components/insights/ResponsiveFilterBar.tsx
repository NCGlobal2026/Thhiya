import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    X,
    MapPin,
    Briefcase,
    Languages,
    SortAsc,
    Grid3X3,
    List,
    Check,
    RotateCcw,
    Filter
} from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';

// Types
export type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'services-desc'
    | 'services-asc'
    | 'updated-desc'
    | 'updated-asc'
    | 'region-asc';

export type ViewMode = 'grid' | 'list';

export interface ServiceOption {
    slug: string;
    name: string;
}

export interface ResponsiveFilterBarProps {
    // Filter values
    searchQuery: string;
    selectedRegion: string;
    selectedService: string;
    selectedLanguage?: string;
    sortOption: SortOption;
    viewMode: ViewMode;

    // Change handlers
    onSearchChange: (query: string) => void;
    onRegionChange: (region: string) => void;
    onServiceChange: (service: string) => void;
    onLanguageChange?: (language: string) => void;
    onSortChange: (sort: SortOption) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onClearFilters: () => void;

    // Options
    availableRegions: string[];
    availableServices: ServiceOption[];
    availableLanguages?: string[];

    // Display options
    showLanguageFilter?: boolean;
    showViewToggle?: boolean;
    resultCount?: number;
    totalCount?: number;
    placeholder?: string;
    isLoading?: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'services-desc', label: 'Most Services' },
    { value: 'services-asc', label: 'Least Services' },
    { value: 'updated-desc', label: 'Recently Updated' },
    { value: 'updated-asc', label: 'Oldest Updated' },
    { value: 'region-asc', label: 'By Region' },
];

// Mobile Filter Button
const MobileFilterButton: React.FC<{
    onClick: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
}> = React.memo(({ onClick, hasActiveFilters, activeFilterCount }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center gap-1.5 xxs:gap-2 px-2.5 xxs:px-3 xs:px-4 py-2.5 xxs:py-3 bg-gray-100 text-gray-700 rounded-lg xxs:rounded-xl font-medium hover:bg-gray-200 transition-all relative text-xs xxs:text-sm"
    >
        <Filter className="w-3.5 h-3.5 xxs:w-4 xxs:h-4" />
        <span className="hidden xxs:inline">Filters</span>
        {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 xxs:w-5 xxs:h-5 bg-red-600 text-white text-[10px] xxs:text-xs font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
            </span>
        )}
    </button>
));

// Mobile Filter Panel (Slide-over)
const MobileFilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    resultCount?: number;
}> = React.memo(({ isOpen, onClose, children, onClearFilters, hasActiveFilters, resultCount }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-50"
                />
                {/* Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-[280px] xxs:max-w-xs xs:max-w-sm bg-white z-50 shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 xxs:px-4 py-3 xxs:py-4 border-b border-gray-200">
                        <div className="flex items-center gap-1.5 xxs:gap-2">
                            <Filter className="w-4 h-4 xxs:w-5 xxs:h-5 text-red-600" />
                            <h2 className="text-base xxs:text-lg font-bold text-gray-900">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 xxs:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 xxs:w-5 xxs:h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-3 xxs:px-4 py-3 xxs:py-4">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="px-3 xxs:px-4 py-3 xxs:py-4 border-t border-gray-200 bg-white space-y-2 xxs:space-y-3">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="w-full flex items-center justify-center gap-1.5 xxs:gap-2 py-2 xxs:py-2.5 text-red-600 font-medium bg-red-50 rounded-lg xxs:rounded-xl hover:bg-red-100 transition-colors text-sm"
                            >
                                <RotateCcw className="w-3.5 h-3.5 xxs:w-4 xxs:h-4" />
                                Clear All Filters
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 xxs:py-3 bg-red-600 text-white font-semibold rounded-lg xxs:rounded-xl hover:bg-red-700 transition-colors text-sm xxs:text-base"
                        >
                            Show {resultCount !== undefined ? `${resultCount} ` : ''}Results
                        </button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
));

// Active Filter Tags
const ActiveFilterTags: React.FC<{
    searchQuery: string;
    selectedRegion: string;
    selectedService: string;
    selectedLanguage?: string;
    availableServices: ServiceOption[];
    onClearSearch: () => void;
    onClearRegion: () => void;
    onClearService: () => void;
    onClearLanguage?: () => void;
    showLanguageFilter?: boolean;
}> = React.memo(({
    searchQuery,
    selectedRegion,
    selectedService,
    selectedLanguage,
    availableServices,
    onClearSearch,
    onClearRegion,
    onClearService,
    onClearLanguage,
    showLanguageFilter = false,
}) => {
    const hasActiveFilters = searchQuery ||
        selectedRegion !== 'all' ||
        selectedService !== 'all' ||
        (showLanguageFilter && selectedLanguage !== 'all');

    if (!hasActiveFilters) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5 xxs:gap-2 mt-2 xxs:mt-3">
            <span className="text-[10px] xxs:text-xs text-gray-500">Active:</span>
            {searchQuery && (
                <span className="inline-flex items-center gap-0.5 xxs:gap-1 px-1.5 xxs:px-2.5 py-0.5 xxs:py-1 bg-red-50 text-red-700 text-[10px] xxs:text-xs font-medium rounded-full">
                    "{searchQuery.length > 10 ? searchQuery.slice(0, 10) + '...' : searchQuery}"
                    <button onClick={onClearSearch} className="hover:text-red-900">
                        <X className="w-2.5 h-2.5 xxs:w-3 xxs:h-3" />
                    </button>
                </span>
            )}
            {selectedRegion !== 'all' && (
                <span className="inline-flex items-center gap-0.5 xxs:gap-1 px-1.5 xxs:px-2.5 py-0.5 xxs:py-1 bg-navy-50 text-navy-700 text-[10px] xxs:text-xs font-medium rounded-full">
                    {selectedRegion.length > 12 ? selectedRegion.slice(0, 12) + '...' : selectedRegion}
                    <button onClick={onClearRegion} className="hover:text-navy-900">
                        <X className="w-2.5 h-2.5 xxs:w-3 xxs:h-3" />
                    </button>
                </span>
            )}
            {selectedService !== 'all' && (
                <span className="inline-flex items-center gap-0.5 xxs:gap-1 px-1.5 xxs:px-2.5 py-0.5 xxs:py-1 bg-navy-50 text-navy-700 text-[10px] xxs:text-xs font-medium rounded-full">
                    {(() => {
                        const name = availableServices.find(s => s.slug === selectedService)?.name || selectedService;
                        return name.length > 12 ? name.slice(0, 12) + '...' : name;
                    })()}
                    <button onClick={onClearService} className="hover:text-navy-900">
                        <X className="w-2.5 h-2.5 xxs:w-3 xxs:h-3" />
                    </button>
                </span>
            )}
            {showLanguageFilter && selectedLanguage && selectedLanguage !== 'all' && (
                <span className="inline-flex items-center gap-0.5 xxs:gap-1 px-1.5 xxs:px-2.5 py-0.5 xxs:py-1 bg-navy-50 text-navy-700 text-[10px] xxs:text-xs font-medium rounded-full">
                    {selectedLanguage}
                    <button onClick={() => onClearLanguage?.()} className="hover:text-navy-900">
                        <X className="w-2.5 h-2.5 xxs:w-3 xxs:h-3" />
                    </button>
                </span>
            )}
        </div>
    );
});

// Main Responsive Filter Bar
export const ResponsiveFilterBar: React.FC<ResponsiveFilterBarProps> = React.memo(({
    searchQuery,
    selectedRegion,
    selectedService,
    selectedLanguage = 'all',
    sortOption,
    viewMode,
    onSearchChange,
    onRegionChange,
    onServiceChange,
    onLanguageChange,
    onSortChange,
    onViewModeChange,
    onClearFilters,
    availableRegions,
    availableServices,
    availableLanguages = [],
    showLanguageFilter = false,
    showViewToggle = true,
    resultCount,
    totalCount,
    placeholder = 'Search countries, regions, services...',
    isLoading = false,
}) => {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const hasActiveFilters = Boolean(searchQuery) ||
        selectedRegion !== 'all' ||
        selectedService !== 'all' ||
        (showLanguageFilter && selectedLanguage !== 'all');

    const activeFilterCount = [
        Boolean(searchQuery),
        selectedRegion !== 'all',
        selectedService !== 'all',
        showLanguageFilter && selectedLanguage !== 'all',
    ].filter(Boolean).length;

    const regionOptions = [
        { value: 'all', label: 'All Regions' },
        ...availableRegions.map(r => ({ value: r, label: r }))
    ];

    const serviceOptions = [
        { value: 'all', label: 'All Services' },
        ...availableServices.map(s => ({ value: s.slug, label: s.name }))
    ];

    const languageOptions = [
        { value: 'all', label: 'All Languages' },
        ...availableLanguages.map(l => ({ value: l, label: l }))
    ];

    const sortOptions = SORT_OPTIONS.map(s => ({ value: s.value, label: s.label }));

    return (
        <div className="space-y-2 xxs:space-y-3">
            {/* Search Row */}
            <div className="flex gap-2 xxs:gap-3">
                {/* Search Input */}
                <div className="flex-1 relative min-w-0">
                    <Search className="absolute left-2.5 xxs:left-3 xs:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xxs:w-5 xxs:h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8 xxs:pl-10 xs:pl-12 pr-3 xxs:pr-4 py-2.5 xxs:py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg xxs:rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all text-xs xxs:text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 xxs:right-4 top-1/2 -translate-y-1/2 p-0.5 xxs:p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-3.5 h-3.5 xxs:w-4 xxs:h-4" />
                        </button>
                    )}
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                    <MobileFilterButton
                        onClick={() => setShowMobileFilters(true)}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFilterCount}
                    />
                </div>

                {/* Desktop View Toggle */}
                {showViewToggle && (
                    <div className="hidden lg:flex items-center bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid'
                                ? 'bg-white shadow-sm text-red-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            title="Grid view"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list'
                                ? 'bg-white shadow-sm text-red-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Desktop Filters Row */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
                <FilterDropdown
                    label="Region"
                    placeholder="All Regions"
                    selectedValue={selectedRegion}
                    onSelect={onRegionChange}
                    options={regionOptions}
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    variant="gray"
                    className="flex-1 lg:min-w-[160px]"
                />

                <FilterDropdown
                    label="Service"
                    placeholder="All Services"
                    selectedValue={selectedService}
                    onSelect={onServiceChange}
                    options={serviceOptions}
                    icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                    variant="gray"
                    className="flex-1 lg:min-w-[180px]"
                />

                {showLanguageFilter && availableLanguages.length > 0 && (
                    <FilterDropdown
                        label="Language"
                        placeholder="All Languages"
                        selectedValue={selectedLanguage}
                        onSelect={onLanguageChange || (() => { })}
                        options={languageOptions}
                        icon={<Languages className="w-4 h-4 text-gray-400" />}
                        variant="gray"
                        className="flex-1 lg:min-w-[150px]"
                    />
                )}

                <FilterDropdown
                    label="Sort"
                    placeholder="Sort By"
                    selectedValue={sortOption}
                    onSelect={(v) => onSortChange(v as SortOption)}
                    options={sortOptions}
                    icon={<SortAsc className="w-4 h-4 text-gray-400" />}
                    variant="gray"
                    className="flex-1 lg:min-w-[160px]"
                />

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1.5 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Clear
                    </button>
                )}

                {/* Results Count */}
                {isLoading ? (
                    <div className="ml-auto h-5 w-32 bg-gray-100 animate-pulse rounded-lg" />
                ) : resultCount !== undefined && totalCount !== undefined && (
                    <div className="ml-auto text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">{resultCount}</span> of{' '}
                        <span className="font-semibold text-gray-700">{totalCount}</span>
                    </div>
                )}
            </div>

            {/* Mobile Filter Panel */}
            <MobileFilterPanel
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={resultCount}
            >
                <div className="space-y-4">
                    <FilterDropdown
                        label="Region"
                        placeholder="All Regions"
                        selectedValue={selectedRegion}
                        onSelect={onRegionChange}
                        options={regionOptions}
                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                        variant="gray"
                    />

                    <FilterDropdown
                        label="Service"
                        placeholder="All Services"
                        selectedValue={selectedService}
                        onSelect={onServiceChange}
                        options={serviceOptions}
                        icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                        variant="gray"
                    />

                    {showLanguageFilter && availableLanguages.length > 0 && (
                        <FilterDropdown
                            label="Language"
                            placeholder="All Languages"
                            selectedValue={selectedLanguage}
                            onSelect={onLanguageChange || (() => { })}
                            options={languageOptions}
                            icon={<Languages className="w-4 h-4 text-gray-400" />}
                            variant="gray"
                        />
                    )}

                    <FilterDropdown
                        label="Sort By"
                        placeholder="Sort Options"
                        selectedValue={sortOption}
                        onSelect={(v) => onSortChange(v as SortOption)}
                        options={sortOptions}
                        icon={<SortAsc className="w-4 h-4 text-gray-400" />}
                        variant="gray"
                    />

                    {showViewToggle && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">View Mode</label>
                            <div className="flex items-center bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => onViewModeChange('grid')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid'
                                        ? 'bg-white shadow-sm text-red-600'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => onViewModeChange('list')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list'
                                        ? 'bg-white shadow-sm text-red-600'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    List
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </MobileFilterPanel>

            {/* Active Filter Tags (Desktop) */}
            <div className="hidden lg:block">
                <ActiveFilterTags
                    searchQuery={searchQuery}
                    selectedRegion={selectedRegion}
                    selectedService={selectedService}
                    selectedLanguage={selectedLanguage}
                    availableServices={availableServices}
                    onClearSearch={() => onSearchChange('')}
                    onClearRegion={() => onRegionChange('all')}
                    onClearService={() => onServiceChange('all')}
                    onClearLanguage={() => onLanguageChange?.('all')}
                    showLanguageFilter={showLanguageFilter}
                />
            </div>

            {/* Mobile Results Count */}
            {resultCount !== undefined && totalCount !== undefined && (
                <div className="lg:hidden text-[10px] xxs:text-xs xs:text-sm text-gray-500 text-center">
                    <span className="font-semibold text-gray-700">{resultCount}</span> of{' '}
                    <span className="font-semibold text-gray-700">{totalCount}</span> countries
                </div>
            )}
        </div>
    );
});

export default ResponsiveFilterBar;
