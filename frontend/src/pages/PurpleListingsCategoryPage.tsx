import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { FilterSidebar } from '../features/purple-listings/components/FilterSidebar';
import { CompanyCard } from '../features/purple-listings/components/CompanyCard';
import { CompanyCardSkeleton } from '../features/purple-listings/components/CompanyCardSkeleton';
import { useCompanies } from '../features/purple-listings/hooks/useCompanies';
import { CATEGORIES } from '../features/purple-listings/data/categories';
import { useEnhancedMetadata } from '../services/hooks';
import { Search, SlidersHorizontal, ArrowLeft, Briefcase, ArrowUpDown, ChevronDown, Globe, X } from 'lucide-react';
import { useRegions } from '../services/hooks';

// Language to Country Mapping
const LANGUAGE_TO_COUNTRIES: Record<string, string[]> = {
    'hi': ['India'],
    'en': ['United States', 'United Kingdom', 'Canada', 'Australia', 'India'],
    'es': ['Spain', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru'],
    'fr': ['France', 'Canada', 'Belgium', 'Switzerland', 'Luxembourg'],
    'de': ['Germany', 'Austria', 'Switzerland', 'Luxembourg'],
    'it': ['Italy', 'Switzerland'],
    'pt': ['Brazil', 'Portugal'],
    'ar': ['United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Qatar', 'Kuwait', 'Jordan'],
    'zh': ['China', 'Taiwan', 'Singapore', 'Hong Kong'],
    'ja': ['Japan'],
    'ko': ['South Korea'],
    'ru': ['Russia', 'Kazakhstan', 'Belarus'],
    'nl': ['Netherlands', 'Belgium'],
    'tr': ['Turkey'],
    'vi': ['Vietnam'],
    'th': ['Thailand']
};

export const PurpleListingsCategoryPage: React.FC = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCountry = queryParams.get('country');

    useEngagementTracking(`purple_listings_category_${categorySlug}`);

    const { data: metadata } = useEnhancedMetadata();
    const { data: regions } = useRegions();

    // Create country to region mapping
    const countryToRegionMap = useMemo(() => {
        const map = new Map<string, string>();
        regions?.forEach(r => {
            r.countries.forEach(c => map.set(c.name, r.region));
        });
        return map;
    }, [regions]);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
    const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountry ? [initialCountry] : []);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const currentCategory = CATEGORIES.find(cat => cat.slug === categorySlug);

    // Redirect if category not found
    useEffect(() => {
        if (!currentCategory) {
            navigate('/purple-listings');
        }
    }, [currentCategory, navigate]);

    // Simulate loading on mount or filter change
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, [categorySlug, selectedCountries, selectedFeatures, sortBy]);

    // Initial Companies (filtered by category only)
    const categoryCompanies = useCompanies({ categorySlug, limit: 1000 });

    // Extract available filters from the companies in this category
    const availableCountries = useMemo(() => {
        const countries = new Set<string>();
        categoryCompanies.forEach(c => c.supportedCountries?.forEach(country => countries.add(country)));
        return Array.from(countries).sort();
    }, [categoryCompanies]);

    const availableFeatures = useMemo(() => {
        const features = new Set<string>();
        categoryCompanies.forEach(c => c.serviceFeatures?.forEach(feature => features.add(feature)));
        return Array.from(features).sort();
    }, [categoryCompanies]);

    // Apply Client-Side Filtering
    const filteredCompanies = useMemo(() => {
        return categoryCompanies.filter(company => {
            // Search Filter
            const matchesSearch = !searchQuery ||
                company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

            // Country Filter
            const matchesCountry = selectedCountries.length === 0 ||
                company.supportedCountries?.some(c => selectedCountries.includes(c));

            // Feature Filter (now Category Filter)
            const matchesFeature = selectedFeatures.length === 0 ||
                company.categories?.some(cat => selectedFeatures.includes(cat));

            // Language Filter
            const targetCountries = selectedLanguage ? LANGUAGE_TO_COUNTRIES[selectedLanguage] : [];
            const matchesLanguage = !selectedLanguage || 
                (company as any).languages?.includes(selectedLanguage) ||
                company.supportedCountries?.some((c: string) => targetCountries.includes(c));

            return matchesSearch && matchesCountry && matchesFeature && matchesLanguage;
        });
    }, [categoryCompanies, searchQuery, selectedCountries, selectedFeatures, selectedLanguage]);

    // Sort
    const sortedCompanies = useMemo(() => {
        const sorted = [...filteredCompanies];
        switch (sortBy) {
            case 'rating':
                return sorted.sort((a, b) => (b.intentScore || b.rating) - (a.intentScore || a.rating));
            case 'reviews':
                return sorted.sort((a, b) => {
                    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
                    return (b.intentScore || b.rating) - (a.intentScore || a.rating);
                });
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    }, [filteredCompanies, sortBy]);

    // Handler helpers
    const toggleCountry = (country: string) => {
        setSelectedCountries(prev =>
            prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
        );
    };

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
        );
    };

    if (!currentCategory) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden bg-linear-to-br from-navy-900 via-navy-800 to-red-900">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                </div>

                <Container className="relative z-10">
                    {/* Breadcrumb */}
                    <Link
                        to="/purple-listings"
                        className="inline-flex items-center text-navy-100 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to categories
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                            {currentCategory.name}
                        </h1>
                        <p className="text-xl text-navy-100 max-w-3xl leading-relaxed">
                            {currentCategory.description}
                        </p>
                    </motion.div>
                </Container>
            </section>

            {/* Main Content */}
            <section className="py-12 flex-1">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Sidebar - Filters */}
                        <div className="lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <FilterSidebar
                                    selectedCountries={selectedCountries}
                                    onCountryChange={toggleCountry}
                                    onSetSelectedCountries={setSelectedCountries}
                                    availableCountries={availableCountries}
                                    
                                    // New dropdown props
                                    selectedService={categorySlug || ""}
                                    onServiceChange={(s) => {
                                        if (s) navigate(`/purple-listings/c/${s}`);
                                    }}
                                    availableServices={CATEGORIES}
                                    
                                    selectedLanguage={selectedLanguage}
                                    onLanguageChange={setSelectedLanguage}
                                    
                                    sortBy={sortBy}
                                    onSortChange={(val) => setSortBy(val as any)}
                                />
                            </motion.div>
                        </div>

                        {/* Right Section - Results */}
                        <div className="lg:col-span-9">

                            {/* Controls Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-24 z-20"
                            >
                                {/* Search Bar */}
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${currentCategory.name} providers...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    />
                                </div>

                                {/* Active Filters Summary */}
                                {(selectedCountries.length > 0 || selectedLanguage || sortBy !== 'rating') && (
                                    <div className="flex flex-wrap items-center gap-2 pt-2 mt-4 border-t border-gray-100">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active:</span>
                                        
                                        {/* Service (Category) Chip - Always shown as it's the current page */}
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy-50 text-navy-700 rounded-full text-xs font-medium border border-navy-100">
                                            {currentCategory.name}
                                        </div>

                                        {/* Country Groups */}
                                        {Object.entries(
                                            selectedCountries.reduce((acc, country) => {
                                                const region = countryToRegionMap.get(country) || 'Other';
                                                if (!acc[region]) acc[region] = [];
                                                acc[region].push(country);
                                                return acc;
                                            }, {} as Record<string, string[]>)
                                        ).map(([region, countries]) => (
                                            <button
                                                key={region}
                                                onClick={() => {
                                                    const newSelection = selectedCountries.filter(c => !countries.includes(c));
                                                    setSelectedCountries(newSelection);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100 hover:bg-red-100 transition-colors group"
                                            >
                                                {region}
                                                <span className="opacity-60 group-hover:opacity-100">({countries.length})</span>
                                                <X className="w-3 h-3" />
                                            </button>
                                        ))}

                                        {/* Language Chip */}
                                        {selectedLanguage && (
                                            <button
                                                onClick={() => setSelectedLanguage("")}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                                            >
                                                Language: {
                                                    ({
                                                        'hi': 'Hindi', 'en': 'English', 'es': 'Spanish', 'fr': 'French',
                                                        'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'ar': 'Arabic',
                                                        'zh': 'Mandarin', 'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian',
                                                        'nl': 'Dutch', 'tr': 'Turkish', 'vi': 'Vietnamese', 'th': 'Thai'
                                                    } as any)[selectedLanguage] || selectedLanguage
                                                }
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}

                                        {/* Sort Chip */}
                                        {sortBy !== 'rating' && (
                                            <button
                                                onClick={() => setSortBy('rating')}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium border border-amber-100 hover:bg-amber-100 transition-colors"
                                            >
                                                Sort: {sortBy === 'reviews' ? 'Most Reviews' : 'Name'}
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                setSelectedCountries([]);
                                                setSelectedLanguage("");
                                                setSortBy('rating');
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline px-2"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Results Grid */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{isLoading ? '...' : sortedCompanies.length}</span> results
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoading ? (
                                    // Skeletons
                                    [...Array(6)].map((_, i) => (
                                        <CompanyCardSkeleton key={i} />
                                    ))
                                ) : (
                                    // Live Data with Animations
                                    <AnimatePresence mode="popLayout">
                                        {sortedCompanies.length > 0 ? (
                                            sortedCompanies.map((company) => (
                                                <CompanyCard key={company.id} company={company} />
                                            ))
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed"
                                            >
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers match</h3>
                                                <p className="text-gray-500">Try clearing some filters.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </div>
    );
};
