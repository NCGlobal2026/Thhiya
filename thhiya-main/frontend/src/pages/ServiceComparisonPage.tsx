import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Globe2,
    MapPin,
    Filter,
    ChevronDown,
    ArrowRight,
    Search,
    Layers,
    TrendingUp,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Container } from '../components/Container';
import { useCountriesForService, useEnhancedMetadata } from '../services/hooks';
import { CountryServiceCard } from '../components/insights/CountryServiceCard';
import slugify from '../utils/slugify';
import { GA4Events } from '../services/analytics';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { TOP_13_SERVICES } from '../constants/canonicalServices';

export const ServiceComparisonPage: React.FC = () => {
    const { serviceSlug } = useParams<{ serviceSlug: string }>();
    const navigate = useNavigate();
    const [selectedRegion, setSelectedRegion] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { data: serviceData, isLoading, error } = useCountriesForService(serviceSlug || '');
    const { data: metadata } = useEnhancedMetadata();
    const hasTrackedView = useRef(false);

    // Track page view when data loads
    useEffect(() => {
        if (!hasTrackedView.current && serviceData && serviceSlug) {
            GA4Events.viewItem({
                itemId: serviceSlug,
                itemName: serviceData.service,
                itemCategory: 'service_comparison',
            });
            hasTrackedView.current = true;
        }
    }, [serviceData, serviceSlug]);

    // Track engagement (scroll depth, time on page)
    useEngagementTracking(`service_comparison_${serviceSlug}`, !!serviceData);

    // Get unique regions from the data
    const regions = useMemo(() => {
        if (!serviceData?.byRegion) return [];
        return Object.keys(serviceData.byRegion).sort();
    }, [serviceData]);

    // Filter countries by region and search
    const filteredCountries = useMemo(() => {
        if (!serviceData?.data) return [];

        let filtered = [...serviceData.data];

        // Filter by region
        if (selectedRegion !== 'all') {
            filtered = filtered.filter(c => c.region === selectedRegion);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.country.toLowerCase().includes(query) ||
                c.countryCode.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [serviceData, selectedRegion, searchQuery]);

    // Group filtered countries by region for display
    const countriesByRegion = useMemo(() => {
        const grouped: Record<string, typeof filteredCountries> = {};

        filteredCountries.forEach(country => {
            if (!grouped[country.region]) {
                grouped[country.region] = [];
            }
            grouped[country.region].push(country);
        });

        return grouped;
    }, [filteredCountries]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mb-4"
                        />
                        <p className="text-gray-600">Loading service data...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !serviceData) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md px-4">
                        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Info className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-navy-900 mb-4">Service Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find any countries offering this service. Try selecting a different service.
                        </p>
                        <Link
                            to="/insights/hub"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Insights Hub
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-10 sm:pb-12 md:pb-14 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(230, 57, 70) 1px, transparent 0)',
                            backgroundSize: '48px 48px'
                        }}
                    />
                </div>

                <Container className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link
                            to="/insights/hub"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group text-sm sm:text-base"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Insights Hub
                        </Link>

                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/20 rounded-full mb-4">
                                <Layers className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-medium text-red-400">Service Comparison</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                {serviceData.service}
                            </h1>

                            <p className="text-lg sm:text-xl text-white/80 mb-6">
                                Compare {serviceData.service} across {serviceData.count} countries worldwide.
                                Find the best fit for your business expansion needs.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                    <Globe2 className="w-4 h-4 text-white" />
                                    <span className="text-sm text-white font-medium">{serviceData.count} Countries</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                    <MapPin className="w-4 h-4 text-white" />
                                    <span className="text-sm text-white font-medium">{regions.length} Regions</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Filters Section - Now scrolls with body */}
            <section className="py-4 sm:py-5 md:py-6 bg-gray-50 border-b border-gray-200">
                <Container>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search countries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-sm"
                            />
                        </div>

                        {/* Region Filter */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Region:</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedRegion('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedRegion === 'all'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-red-600'
                                        }`}
                                >
                                    All ({serviceData.count})
                                </button>
                                {regions.map((region) => (
                                    <button
                                        key={region}
                                        onClick={() => setSelectedRegion(region)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedRegion === region
                                            ? 'bg-red-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-red-600'
                                            }`}
                                    >
                                        {region} ({serviceData.byRegion[region]?.length || 0})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Countries Grid */}
            <section className="py-10 sm:py-12 md:py-16 bg-white">
                <Container>
                    {filteredCountries.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-navy-900 mb-2">No countries found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(countriesByRegion).sort(([a], [b]) => a.localeCompare(b)).map(([region, countries]) => (
                                <motion.div
                                    key={region}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <MapPin className="w-5 h-5 text-red-600" />
                                        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{region}</h2>
                                        <span className="px-2.5 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                                            {countries.length} countries
                                        </span>
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                        {countries.map((country) => (
                                            <motion.div
                                                key={country._id}
                                                whileHover={{ y: -4 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Link
                                                    to={`/insights?country=${encodeURIComponent(country.country)}&service=${encodeURIComponent(country.serviceSlug)}`}
                                                    className="block"
                                                >
                                                    <div className="bg-white rounded-xl border-2 border-gray-100 p-5 hover:border-red-600 hover:shadow-lg transition-all h-full">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="text-3xl">{getFlagEmoji(country.countryCode)}</div>
                                                            <div>
                                                                <h3 className="font-semibold text-navy-900">{country.country}</h3>
                                                                <p className="text-sm text-gray-500">{country.countryCode}</p>
                                                            </div>
                                                        </div>

                                                        {country.heroData?.description && (
                                                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                                                {country.heroData.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center text-red-600 text-sm font-medium group">
                                                            View Details
                                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Container>
            </section>

            {/* Other Services Section */}
            {metadata?.servicesDetail && metadata.servicesDetail.length > 0 && (
                <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
                    <Container>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">Explore Other Services</h2>
                            <p className="text-gray-600">Compare countries across different service categories</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {metadata.servicesDetail
                                .filter(s => s.slug !== serviceSlug && TOP_13_SERVICES.includes(s.slug))
                                .slice(0, 11)
                                .map((service) => (
                                    <Link
                                        key={service.slug}
                                        to={`/insights/service/${service.slug}`}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-red-600 hover:text-red-600 transition-all"
                                    >
                                        {service.name}
                                        <span className="text-xs text-gray-400">({service.countryCount})</span>
                                    </Link>
                                ))}
                        </div>
                    </Container>
                </section>
            )}

            <Footer />
        </div>
    );
};

function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export default ServiceComparisonPage;
