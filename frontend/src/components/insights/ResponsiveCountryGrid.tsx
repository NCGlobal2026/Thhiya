import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, Search, MapPin } from 'lucide-react';
import { CountryCard } from './CountryCard';
import { CountryListCard, CountryListCardMobile, CountryListCardTablet, CountryListCardDesktop } from './CountryListCard';

export interface CountryData {
    country: string;
    slug?: string;
    code?: string;
    flagUrl?: string;
    employmentCost: string;
    languages: string[];
    currency: string;
    annualLeave?: string;
    service?: string;
    serviceSummary?: { service: string; count: number }[];
    insightCount?: number;
    servicesOffered?: string[];
    region?: string;
    updatedAt?: string;
}

interface ResponsiveCountryGridProps {
    countries: CountryData[];
    viewMode: 'grid' | 'list';
    isLoading?: boolean;
    onClearFilters?: () => void;
    groupByRegion?: boolean;
}

// Mobile Grid Component - Enhanced visual design with proper spacing and stagger animation
const MobileCountryGrid: React.FC<{ countries: CountryData[] }> = React.memo(({ countries }) => (
    <div className="space-y-3 xxs:space-y-4">
        {/* Section Header for mobile */}
        <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                    <Globe2 className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-navy-900">Browse Countries</h3>
                    <p className="text-[10px] text-gray-500">{countries.length} destinations available</p>
                </div>
            </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 gap-3 xxs:gap-4">
            {countries.map((country, index) => (
                <motion.div
                    key={country.country}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.4,
                        delay: Math.min(index * 0.05, 0.5),
                        ease: "easeOut"
                    }}
                >
                    <CountryCard {...country} />
                </motion.div>
            ))}
        </div>
    </div>
));

// Tablet Grid Component - 2 columns
const TabletCountryGrid: React.FC<{ countries: CountryData[] }> = React.memo(({ countries }) => (
    <div className="grid grid-cols-2 gap-4">
        {countries.map((country, index) => (
            <motion.div
                key={country.country}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
            >
                <CountryCard {...country} />
            </motion.div>
        ))}
    </div>
));

// Desktop Grid Component - 3-4 columns
const DesktopCountryGrid: React.FC<{ countries: CountryData[] }> = React.memo(({ countries }) => (
    <div className="grid grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
        {countries.map((country, index) => (
            <motion.div
                key={country.country}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
            >
                <CountryCard {...country} />
            </motion.div>
        ))}
    </div>
));

// Mobile List Component - Enhanced with visual region headers
const MobileCountryList: React.FC<{ countries: CountryData[]; groupByRegion?: boolean }> = React.memo(({ countries, groupByRegion }) => {
    if (groupByRegion) {
        const grouped = groupCountriesByRegion(countries);
        return (
            <div className="space-y-5 xxs:space-y-6 xs:space-y-8">
                {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, regionCountries]) => (
                    <motion.div
                        key={region}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative"
                    >
                        {/* Enhanced Region Header */}
                        <div className="flex items-center gap-2 xxs:gap-2.5 mb-3 xxs:mb-4 px-1">
                            <div className="w-8 h-8 xxs:w-9 xxs:h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                                <MapPin className="w-4 h-4 xxs:w-4.5 xxs:h-4.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm xxs:text-base font-bold text-navy-900 truncate">{region}</h3>
                                <p className="text-[10px] xxs:text-xs text-gray-500">{regionCountries.length} countries</p>
                            </div>
                            <span className="px-2 xxs:px-2.5 py-1 bg-red-50 text-red-600 text-xs xxs:text-sm font-bold rounded-full flex-shrink-0">
                                {regionCountries.length}
                            </span>
                        </div>

                        {/* Countries List */}
                        <div className="space-y-2 xxs:space-y-2.5">
                            {regionCountries.map((country, index) => (
                                <motion.div
                                    key={country.country}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                                >
                                    <CountryListCardMobile {...country} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2 xxs:space-y-2.5">
            {countries.map((country, index) => (
                <motion.div
                    key={country.country}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                >
                    <CountryListCardMobile {...country} />
                </motion.div>
            ))}
        </div>
    );
});

// Tablet List Component
const TabletCountryList: React.FC<{ countries: CountryData[]; groupByRegion?: boolean }> = React.memo(({ countries, groupByRegion }) => {
    if (groupByRegion) {
        const grouped = groupCountriesByRegion(countries);
        return (
            <div className="space-y-8">
                {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, regionCountries]) => (
                    <div key={region}>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-red-600" />
                            <h3 className="text-base font-bold text-navy-900">{region}</h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                {regionCountries.length} countries
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {regionCountries.map((country, index) => (
                                <motion.div
                                    key={country.country}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: index * 0.02 }}
                                >
                                    <CountryListCardTablet {...country} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {countries.map((country, index) => (
                <motion.div
                    key={country.country}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                >
                    <CountryListCardTablet {...country} />
                </motion.div>
            ))}
        </div>
    );
});

// Desktop List Component
const DesktopCountryList: React.FC<{ countries: CountryData[]; groupByRegion?: boolean }> = React.memo(({ countries, groupByRegion }) => {
    if (groupByRegion) {
        const grouped = groupCountriesByRegion(countries);
        return (
            <div className="space-y-10">
                {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, regionCountries]) => (
                    <div key={region}>
                        <div className="flex items-center gap-3 mb-5">
                            <MapPin className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-bold text-navy-900">{region}</h3>
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                {regionCountries.length} countries
                            </span>
                        </div>
                        <div className="space-y-3">
                            {regionCountries.map((country, index) => (
                                <motion.div
                                    key={country.country}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.02 }}
                                >
                                    <CountryListCardDesktop {...country} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {countries.map((country, index) => (
                <motion.div
                    key={country.country}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                    <CountryListCardDesktop {...country} />
                </motion.div>
            ))}
        </div>
    );
});

// Helper function to group countries by region
const groupCountriesByRegion = (countries: CountryData[]): Record<string, CountryData[]> => {
    const grouped: Record<string, CountryData[]> = {};
    countries.forEach(country => {
        const region = country.region || 'Other';
        if (!grouped[region]) {
            grouped[region] = [];
        }
        grouped[region].push(country);
    });
    return grouped;
};

const ShimmerCard: React.FC = () => (
    <>
        {/* Mobile Shimmer (< 640px) - Matches MobileCountryCard */}
        <div className="sm:hidden bg-white rounded-2xl border border-gray-100 p-3 shadow-sm animate-pulse h-[160px] flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="h-10 bg-gray-50 rounded-xl"></div>
                <div className="h-10 bg-gray-50 rounded-xl"></div>
            </div>
            <div className="mt-auto pt-2 border-t border-gray-50 flex justify-between">
                <div className="h-4 w-20 bg-gray-100 rounded"></div>
                <div className="h-8 w-8 bg-gray-100 rounded-xl"></div>
            </div>
        </div>

        {/* Desktop Shimmer (>= 640px) - Matches DesktopCountryCard */}
        <div className="hidden sm:block bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm animate-pulse h-[480px] flex flex-col overflow-hidden">
            {/* Hero Section Placeholder - Matches h-40 md:h-44 */}
            <div className="h-40 md:h-44 bg-gray-100 w-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
            {/* Content Section - Matches p-4 md:p-5 lg:p-6 */}
            <div className="p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-5">
                    <div className="h-6 md:h-7 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>

                {/* Stats Grid - Matches space-y-2.5 */}
                <div className="space-y-3 mb-5 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-16 bg-gray-50 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-16 bg-gray-50 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-16 bg-gray-50 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                    <div className="h-5 w-24 bg-gray-100 rounded"></div>
                    <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        </div>
    </>
);

const ShimmerList: React.FC = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
            </div>
            <div className="w-20 h-8 bg-gray-100 rounded-lg flex-shrink-0"></div>
        </div>
    </div>
);

const LoadingState: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => (
    <div className="w-full">
        {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(12)].map((_, i) => (
                    <ShimmerCard key={i} />
                ))}
            </div>
        ) : (
            <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                    <ShimmerList key={i} />
                ))}
            </div>
        )}
    </div>
);

// Empty State Component
const EmptyState: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center py-8 xxs:py-10 xs:py-12 sm:py-16 md:py-20"
    >
        <div className="w-12 h-12 xxs:w-14 xxs:h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 xxs:mb-4 sm:mb-6">
            <Search className="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
        </div>
        <h3 className="text-base xxs:text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 xxs:mb-2 sm:mb-3">
            No Countries Found
        </h3>
        <p className="text-xs xxs:text-sm sm:text-base text-gray-600 mb-3 xxs:mb-4 sm:mb-6">
            Try adjusting your filters or search query
        </p>
        {onClearFilters && (
            <button
                onClick={onClearFilters}
                className="px-4 py-2 xxs:px-5 xxs:py-2.5 sm:px-6 sm:py-3 bg-red-600 text-white text-xs xxs:text-sm sm:text-base font-semibold rounded-lg xxs:rounded-xl hover:bg-red-700 transition-all"
            >
                Clear All Filters
            </button>
        )}
    </motion.div>
);

// Main Responsive Country Grid Component
export const ResponsiveCountryGrid: React.FC<ResponsiveCountryGridProps> = React.memo(({
    countries,
    viewMode,
    isLoading = false,
    onClearFilters,
    groupByRegion = true,
}) => {
    if (isLoading) {
        return <LoadingState viewMode={viewMode} />;
    }

    if (countries.length === 0) {
        return <EmptyState onClearFilters={onClearFilters} />;
    }

    return (
        <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
                <motion.div
                    key="country-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Mobile: < 640px */}
                    <div className="block sm:hidden">
                        <MobileCountryGrid countries={countries} />
                    </div>
                    {/* Tablet: 640px - 1024px */}
                    <div className="hidden sm:block lg:hidden">
                        <TabletCountryGrid countries={countries} />
                    </div>
                    {/* Desktop: > 1024px */}
                    <div className="hidden lg:block">
                        <DesktopCountryGrid countries={countries} />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="country-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Mobile: < 640px */}
                    <div className="block sm:hidden">
                        <MobileCountryList countries={countries} groupByRegion={groupByRegion} />
                    </div>
                    {/* Tablet: 640px - 1024px */}
                    <div className="hidden sm:block lg:hidden">
                        <TabletCountryList countries={countries} groupByRegion={groupByRegion} />
                    </div>
                    {/* Desktop: > 1024px */}
                    <div className="hidden lg:block">
                        <DesktopCountryList countries={countries} groupByRegion={groupByRegion} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default ResponsiveCountryGrid;
