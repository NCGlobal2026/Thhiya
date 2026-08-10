// final lint refresh
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Globe2,
  TrendingUp,
  BookOpen,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Container } from '../components/Container';
import { BANTCTA } from '../components/bant';
import { FAQSection } from '../components/insights/FAQSection';
import { ResponsiveCountryGrid } from '../components/insights/ResponsiveCountryGrid';
import { ResponsiveFilterBar, SortOption, ViewMode } from '../components/insights/ResponsiveFilterBar';
import { Link, useNavigate } from 'react-router-dom';
import slugify from '../utils/slugify';
import {
  useAllCountries,
  useEnhancedMetadata,
  useRegions,
  useCountryServicesMetadata
} from '../services/hooks';
import { PayrollModal } from '../components/PayrollModal';
import { GA4Events, trackEvent } from '../services/analytics';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { TOP_13_SERVICES } from '../constants/canonicalServices';

const FAQ_DATA = [
  {
    question: 'What are the legal requirements for hiring employees in different countries?',
    answer: 'When hiring employees internationally, you must consider employment contracts, wage and hour laws, tax obligations, employee classification, and mandatory benefits. An Employer of Record (EOR) helps manage these complexities by acting as the legal employer and ensuring compliance with local regulations.',
  },
  {
    question: 'How do payroll and taxes work when hiring internationally?',
    answer: 'International payroll involves managing different tax systems, social security contributions, and payment methods for each country. Each country has unique requirements for payroll processing, tax withholding, and reporting. Using an EOR or global payroll platform streamlines this process.',
  },
  {
    question: 'Can I hire employees in countries where I do not have an entity?',
    answer: 'Yes, through an Employer of Record (EOR) service. An EOR acts as the legal employer in countries where you do not have a registered entity, handling all compliance, payroll, and HR administration while you manage the employee day-to-day work.',
  },
  {
    question: 'What is the difference between hiring contractors vs. employees globally?',
    answer: 'Contractors are self-employed and manage their own taxes and benefits, while employees require payroll processing, benefits administration, and employer contributions. Misclassifying workers can lead to significant penalties. The distinction varies by country based on local labor laws.',
  },
  {
    question: 'How do I determine the best countries to hire remote talent?',
    answer: 'Consider factors like talent availability, time zone alignment, language proficiency, labor costs, regulatory environment, and cultural fit. Our insights guides provide comprehensive information on employment costs, regulations, and workforce characteristics for each country.',
  },
];

const POPULAR_SEARCHES = ['UK', 'United States', 'Singapore', 'Germany', 'India', 'Australia'];

export const InsightsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTrackedInitialView = useRef(false);

  // Track engagement (scroll depth, time on page)
  useEngagementTracking('insights_hub');

  // Data fetching hooks
  const { data: countries, isLoading: countriesLoading, refetch: refetchCountries } = useAllCountries();
  const { data: metadata, isLoading: metadataLoading } = useEnhancedMetadata();
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: csMetadata, isLoading: csMetadataLoading } = useCountryServicesMetadata();


  // Get unique regions from metadata
  const availableRegions = useMemo(() => {
    // Verified regions from DB as of Jan 30 2026
    const STABLE_REGION_LIST = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

    if (regionsData && regionsData.length > 0) {
      const regions = new Set(regionsData.map(r => r.region).filter(Boolean));
      return Array.from(regions).sort();
    }
    if (metadata?.regions && metadata.regions.length > 0) {
      return metadata.regions.map(r => r.name).filter(Boolean).sort();
    }
    // Fallback to stable list to prevent layout shift of the filter row
    return STABLE_REGION_LIST;
  }, [regionsData, metadata]);

  // Get unique services from metadata - limited to top 12 canonical services
  const availableServices = useMemo(() => {
    let services: { slug: string; name: string }[] = [];
    if (metadata?.servicesDetail) {
      services = metadata.servicesDetail.map(s => ({ slug: s.slug, name: s.name }));
    } else if (csMetadata?.services) {
      services = csMetadata.services.map(s => ({ slug: s.slug, name: s.name }));
    }

    // Always ensure we only show the canonical 12 unless "all services" is selected elsewhere?
    // The requirement says frontend selections are limited to 12.
    return services.filter(s => TOP_13_SERVICES.includes(s.slug));
  }, [metadata, csMetadata]);

  // Get unique languages from countries or regions data
  const availableLanguages = useMemo(() => {
    // Try from countries first
    if (countries && countries.length > 0) {
      const languageSet = new Set<string>();
      countries.forEach(country => {
        if (country.languages && Array.isArray(country.languages)) {
          country.languages.forEach((lang: string) => languageSet.add(lang));
        }
      });
      if (languageSet.size > 0) return Array.from(languageSet).sort();
    }
    // Default languages if no data
    return ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese', 'Japanese', 'Hindi'].sort();
  }, [countries]);

  // Transform countries data with region info - with fallback to regionsData
  const COUNTRY_DATA = useMemo(() => {
    // Build a region lookup and service count lookup from regionsData
    const regionLookup: Record<string, string> = {};
    const serviceCountLookup: Record<string, number> = {};

    if (regionsData) {
      regionsData.forEach(region => {
        region.countries.forEach(c => {
          regionLookup[c.name] = region.region;
          regionLookup[c.slug] = region.region;
          serviceCountLookup[c.name] = c.serviceCount || 0;
          serviceCountLookup[c.slug] = c.serviceCount || 0;
        });
      });
    } else if (metadata?.countriesDetail) {
      metadata.countriesDetail.forEach(c => {
        if (c.region) {
          regionLookup[c.name] = c.region;
          regionLookup[c.slug] = c.region;
        }
        if (c.serviceCount) {
          serviceCountLookup[c.name] = c.serviceCount;
          serviceCountLookup[c.slug] = c.serviceCount;
        }
      });
    }

    // Primary source: countries from /api/countries
    if (countries && countries.length > 0) {
      return countries.map((country) => {
        const fallbackService = country.defaultService
          || country.serviceSummary?.[0]?.service
          || country.servicesOffered?.[0]
          || 'EOR/PEO Services';

        const region = regionLookup[country.name] || regionLookup[country.slug] || country.region || 'Other';

        // Use insightCount from country, or serviceCount from lookup, or serviceSummary length
        const insightCount = country.insightCount
          || serviceCountLookup[country.name]
          || serviceCountLookup[country.slug]
          || country.serviceSummary?.length
          || country.servicesOffered?.length
          || 0;

        const serviceSlugs = new Set<string>();
        if (country.servicesOffered) {
          country.servicesOffered.forEach((s: string) => {
            if (s) serviceSlugs.add(slugify(s));
          });
        }
        if (country.serviceSummary) {
          country.serviceSummary.forEach((s: { service: string; count: number }) => {
            if (s.service) serviceSlugs.add(slugify(s.service));
          });
        }
        if (country.service) {
          serviceSlugs.add(slugify(country.service));
        }

        const searchString = [
          country.name,
          region,
          ...(country.languages || []),
          fallbackService,
          ...(country.servicesOffered || []),
        ].join(' ').toLowerCase();

        return {
          country: country.name,
          slug: country.slug,
          code: country.code,
          flagUrl: country.flag,
          employmentCost: country.employmentCost || 'Varies',
          languages: country.languages && country.languages.length > 0 ? country.languages : ['English'],
          currency: country.currency || 'Local Currency',
          annualLeave: country.annualLeave || 'Varies',
          service: fallbackService,
          serviceSummary: country.serviceSummary ?? [],
          insightCount,
          servicesOffered: country.servicesOffered ?? [],
          region,
          updatedAt: country.updatedAt || country.createdAt || new Date().toISOString(),
          serviceSlugs: Array.from(serviceSlugs),
          searchString,
        };
      });
    }
    // Return empty while loading to avoid double UI shits
    return [];
  }, [countries, regionsData, metadata, csMetadata]);

  // Stats derived from API metadata or COUNTRY_DATA - limited to canonical counts
  const stats = useMemo(() => {
    // Stable defaults that match final data to prevent layout shift
    // UPDATED: Strictly matched to DB counts as of Jan 30, 2026
    const STABLE_COUNTRIES = 192;
    const STABLE_SERVICES = 12;
    const STABLE_DOCUMENTS = 2324; // Updated to 2324 per user request
    const STABLE_REGIONS = 5;      // Corrected from 6

    // Use actual data if available and valid, otherwise stick to stable defaults
    const totalCount = COUNTRY_DATA.length > 0 ? COUNTRY_DATA.length : STABLE_COUNTRIES;

    return {
      // Force stability: If we have data, use it. If not, use stable. 
      // But actually, for visual stability, we want to AVOID jumps.
      // Since we know the DB has 195/1393/5, we can be very sticky with these defaults
      // to avoid "flicker" if the API returns something slightly different during a partial load.
      totalCountries: totalCount > 0 ? totalCount : STABLE_COUNTRIES,
      totalServices: STABLE_SERVICES,
      totalDocuments: metadata?.totalDocuments || STABLE_DOCUMENTS,
      regions: availableRegions.length || (metadata?.regions?.length || STABLE_REGIONS),
    };
  }, [COUNTRY_DATA.length, metadata, availableRegions]);

  const displayDocuments = useMemo(() => {
    const n = stats.totalDocuments;
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString();
  }, [stats.totalDocuments]);

  // Filter and sort countries
  const filteredAndSortedCountries = useMemo(() => {
    // Start with all countries derived from our data sources
    let result = [...COUNTRY_DATA];

    // Filter results based on search, region, service, language
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((country) => country.searchString.includes(query));
    }

    if (selectedRegion !== 'all') {
      result = result.filter((country) => country.region === selectedRegion);
    }

    if (selectedService !== 'all') {
      const serviceSlug = selectedService.toLowerCase();
      result = result.filter((country) =>
        country.serviceSlugs.includes(serviceSlug) ||
        country.serviceSlugs.some(s => s.replace(/-/g, ' ').includes(serviceSlug.replace(/-/g, ' ')))
      );
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      result = result.filter((country) =>
        country.languages.some((l: string) => l.toLowerCase() === selectedLanguage.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.country.localeCompare(b.country);
        case 'name-desc':
          return b.country.localeCompare(a.country);
        case 'services-desc':
          return (b.serviceSummary?.length || 0) - (a.serviceSummary?.length || 0);
        case 'services-asc':
          return (a.serviceSummary?.length || 0) - (b.serviceSummary?.length || 0);
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'updated-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'region-asc':
          const regionCompare = a.region.localeCompare(b.region);
          return regionCompare !== 0 ? regionCompare : a.country.localeCompare(b.country);
        default:
          return a.country.localeCompare(b.country);
      }
    });

    // Apply 195 limit unless "all services" is selected
    if (selectedService !== 'all') {
      result = result.slice(0, 195);
    }

    return result;
  }, [debouncedSearchQuery, sortOption, selectedRegion, selectedService, selectedLanguage, COUNTRY_DATA]);

  // Track country list view when data loads
  useEffect(() => {
    if (!hasTrackedInitialView.current && filteredAndSortedCountries.length > 0) {
      GA4Events.viewItemList({
        itemListId: 'insights_hub_countries',
        itemListName: 'Insights Hub Country Grid',
        items: filteredAndSortedCountries.slice(0, 20).map((country, index) => ({
          itemId: country.slug,
          itemName: country.country,
          index,
        })),
      });
      hasTrackedInitialView.current = true;
    }
  }, [filteredAndSortedCountries]);

  // Track search with debouncing
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    // Filter debounce - separate from tracking debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(query);
    }, 300); // 300ms debounce for UI performance

    // GA4 Tracking debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Track search after 500ms of no typing
    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        GA4Events.search({
          searchTerm: query,
          searchCategory: 'insights_hub',
        });
      }, 500);
    }
  }, []);

  // Track filter changes
  const handleRegionChange = useCallback((region: string) => {
    setSelectedRegion(region);
    if (region !== 'all') {
      GA4Events.selectContent({
        contentType: 'filter_region',
        contentId: region,
      });
    }
  }, []);

  const handleServiceChange = useCallback((service: string) => {
    setSelectedService(service);
    if (service !== 'all') {
      GA4Events.selectContent({
        contentType: 'filter_service',
        contentId: service,
      });
    }
  }, []);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    if (language !== 'all') {
      GA4Events.selectContent({
        contentType: 'filter_language',
        contentId: language,
      });
    }
  }, []);

  // Group countries by region for list view
  const countriesByRegion = useMemo(() => {
    const grouped: Record<string, typeof filteredAndSortedCountries> = {};
    filteredAndSortedCountries.forEach(country => {
      const region = country.region || 'Other';
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push(country);
    });
    return grouped;
  }, [filteredAndSortedCountries]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedRegion('all');
    setSelectedService('all');
    setSelectedLanguage('all');
    setSortOption('name-asc');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedRegion !== 'all' || selectedService !== 'all' || selectedLanguage !== 'all';

  // Loading state - show loading only if ALL data sources are loading and we have no data
  // Loading state - true if any essential source is loading and we have no data yet
  const isLoading = (countriesLoading || regionsLoading || csMetadataLoading || metadataLoading) && COUNTRY_DATA.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Modern Asymmetric Design */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-14 md:pb-16 lg:pb-20 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #E63946 1px, transparent 1px),
                linear-gradient(to bottom, #E63946 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Floating Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 right-[10%] w-96 h-96 bg-red-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 left-[5%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl"
          />
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Content */}
            <div className="relative">
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600/10 backdrop-blur-sm border border-red-600/20 rounded-full mb-4 sm:mb-5 md:mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                <span className="text-xs sm:text-sm font-semibold text-red-600">Global Employment Intelligence</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight"
              >
                Hire Globally,
                <br />
                <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
                  Expand Confidently
                </span>
              </h1>

              <p
                className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-7 md:mb-8 leading-relaxed max-w-xl"
              >
                Navigate international employment with data-driven insights. Access comprehensive guides
                covering payroll, compliance, and local regulations across {stats.totalCountries || '180+'}  countries.
              </p>

              {/* Stats */}
              <div
                className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10"
              >
                {[
                  { value: stats.totalCountries > 0 ? `${stats.totalCountries}` : '195', label: 'Countries' },
                  { value: stats.totalServices > 0 ? `${stats.totalServices}` : '12', label: 'Services' },
                  { value: displayDocuments, label: 'Insights' },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
              >
                <button className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-red-600 text-white font-semibold rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/40 transition-all text-sm sm:text-base">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Explore Guides
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-6 py-3 sm:px-8 sm:py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm sm:text-base">
                  Talk to Expert
                </button>
              </div>
            </div>

            {/* Right Visual Element */}
            <div
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <Globe2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Global Coverage</div>
                      <div className="text-gray-400 text-sm">{stats.totalCountries || 26} Countries</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '85%' }}
                      animate={{ width: '85%' }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-500"
                    />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-10 left-0 w-56 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div className="text-white font-semibold text-sm">{stats.totalServices || 12} Services</div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{displayDocuments}</div>
                  <div className="text-gray-400 text-sm">Country-Service Insights</div>
                </motion.div>

                {/* Central Globe Illustration */}
                <div className="relative w-80 h-80 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-red-600/30"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 rounded-full border border-white/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl">
                      <Globe2 className="w-20 h-20 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Access Bar */}
      <section className="py-4 sm:py-5 md:py-6 bg-gray-50 border-b border-gray-200">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* Popular Countries Row */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <span className="text-sm sm:text-base text-gray-700 font-semibold">Popular:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {POPULAR_SEARCHES.map((search, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery(search)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all shadow-sm ${searchQuery === search
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-600 hover:text-red-600'
                      }`}
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Region Chips Row */}
            {availableRegions.length > 0 && (
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <span className="text-sm sm:text-base text-gray-700 font-semibold">Regions:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRegion('all')}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all shadow-sm ${selectedRegion === 'all'
                      ? 'bg-navy-900 text-white border-navy-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-navy-600 hover:text-navy-600'
                      }`}
                  >
                    All Regions
                  </motion.button>
                  {availableRegions.slice(0, 6).map((region, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all shadow-sm ${selectedRegion === region
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-600 hover:text-red-600'
                        }`}
                    >
                      {region}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Count & Refresh Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => refetchCountries()}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${countriesLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="text-xs sm:text-sm text-gray-500">
                  {isLoading ? (
                    <span className="text-gray-400">Loading countries...</span>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-700">{filteredAndSortedCountries.length}</span> of{' '}
                      <span className="font-semibold text-gray-700">{stats.totalCountries}</span> Countries
                    </>
                  )}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Advanced Filter & Search Section */}
      <section className="py-4 xxs:py-5 xs:py-6 sm:py-8 md:py-10 bg-white border-b border-gray-100">
        <Container>
          <ResponsiveFilterBar
            searchQuery={searchQuery}
            selectedRegion={selectedRegion}
            selectedService={selectedService}
            selectedLanguage={selectedLanguage}
            sortOption={sortOption}
            viewMode={viewMode}
            onSearchChange={handleSearchChange}
            onRegionChange={handleRegionChange}
            onServiceChange={handleServiceChange}
            onLanguageChange={handleLanguageChange}
            onSortChange={setSortOption}
            onViewModeChange={setViewMode}
            onClearFilters={clearFilters}
            availableRegions={availableRegions}
            availableServices={availableServices}
            availableLanguages={availableLanguages}
            showLanguageFilter={true}
            showViewToggle={true}
            resultCount={filteredAndSortedCountries.length}
            totalCount={stats.totalCountries}
            isLoading={isLoading}
            placeholder="Search by country, region, language, or service..."
          />
        </Container>
      </section>

      {/* Country Grid / List */}
      <section className="py-6 xxs:py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <Container>
          <ResponsiveCountryGrid
            countries={filteredAndSortedCountries}
            viewMode={viewMode}
            isLoading={isLoading}
            onClearFilters={clearFilters}
            groupByRegion={viewMode === 'list'}
          />

          {/* Results Summary */}
          {!isLoading && filteredAndSortedCountries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8"
            >
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filteredAndSortedCountries.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{stats.totalCountries}</span> countries
                {selectedRegion !== 'all' && ` in ${selectedRegion}`}
                {selectedService !== 'all' && ` offering ${availableServices.find(s => s.slug === selectedService)?.name || selectedService}`}
                {selectedLanguage !== 'all' && ` speaking ${selectedLanguage}`}
              </p>
            </motion.div>
          )}
        </Container>
      </section>

      {/* Interactive Resources Grid */}
      <section className="py-14 sm:py-16 md:py-18 lg:py-20 bg-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 2px 2px, rgb(230, 57, 70) 1px, transparent 0)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 rounded-full mb-6 border border-red-200"
            >
              <Zap className="w-4 h-4 text-red-600" />
              <span className="text-red-700 font-semibold text-sm">Powerful Resources</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-4 sm:mb-5 md:mb-6">
              Tools Built For Scale
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Access enterprise-grade tools designed to streamline your global hiring operations
            </p>
          </motion.div>

          {/* Primary Feature - Cost Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 sm:mb-7 md:mb-8"
          >
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-white relative overflow-hidden shadow-2xl">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-7 md:gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 sm:mb-5 md:mb-6">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-semibold">Featured Tool</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                    Global Cost Calculator
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                    Get instant estimates for employment costs including salaries, benefits, taxes,
                    and compliance expenses across any market.
                  </p>
                  <button
                    onClick={() => setIsPayrollModalOpen(true)}
                    className="group flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-red-600 font-semibold rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-lg text-sm sm:text-base"
                  >
                    Try Calculator
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-white/10 rounded-full blur-2xl"
                    />
                    <div className="relative w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
                      <DollarSign className="w-32 h-32 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secondary Tools Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[
              {
                icon: <BarChart3 className="w-7 h-7" />,
                title: 'Salary Benchmarking',
                description: 'Compare compensation packages with real market data from 26 countries',
                gradient: 'from-navy-600 to-navy-700',
                iconBg: 'bg-navy-600',
              },
              {
                icon: <FileText className="w-7 h-7" />,
                title: 'Compliance Guides',
                description: 'Stay compliant with up-to-date labor law documentation and requirements',
                gradient: 'from-red-600 to-red-700',
                iconBg: 'bg-red-600',
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: 'Risk Assessment',
                description: 'Identify and mitigate employment risks before expanding to new markets',
                gradient: 'from-navy-700 to-navy-800',
                iconBg: 'bg-navy-700',
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: 'Workforce Planning',
                description: 'Strategic tools for building and managing distributed teams globally',
                gradient: 'from-red-700 to-red-800',
                iconBg: 'bg-red-700',
              },
              {
                icon: <BookOpen className="w-7 h-7" />,
                title: 'Immigration Support',
                description: 'Navigate visa processes with country-specific guides and checklists',
                gradient: 'from-navy-500 to-navy-600',
                iconBg: 'bg-navy-500',
              },
              {
                icon: <Briefcase className="w-7 h-7" />,
                title: 'Benefits Builder',
                description: 'Design competitive benefit packages that attract top global talent',
                gradient: 'from-red-500 to-red-600',
                iconBg: 'bg-red-500',
              },
            ].map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-transparent hover:shadow-2xl transition-all cursor-pointer"
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity -z-10`} />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 bg-gradient-to-br ${tool.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:bg-white/20 transition-all`}
                  >
                    <span className="text-white">
                      {tool.icon}
                    </span>
                  </motion.div>

                  <h3 className="text-xl font-bold text-navy-900 mb-3 group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-white/90 transition-colors">
                    {tool.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center gap-2 text-red-600 group-hover:text-white font-semibold opacity-0 group-hover:opacity-100 transition-all">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-10 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">
                Need Custom Solutions?
              </h3>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Our team can help you build tailored strategies for your global expansion plans
              </p>
              <button className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-xl">
                Schedule Consultation
              </button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-14 sm:py-16 md:py-18 lg:py-20 bg-gray-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about global hiring
            </p>
          </motion.div>
          <FAQSection faqs={FAQ_DATA} />
        </Container>
      </section>

      {/* BANT/MEDDIC/INTENT(BMI) CTA Section */}
      <section className="py-10 sm:py-12 md:py-14 bg-white">
        <Container>
          <BANTCTA variant="banner" source="insights-hub" />
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 sm:py-18 md:py-20 lg:py-24 bg-gradient-to-br from-navy-900 via-navy-800 to-red-900 text-white overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -80, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-600 rounded-full blur-3xl"
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8"
              >
                <Sparkles className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold">Start Your Global Journey Today</span>
              </motion.div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 sm:mb-7 md:mb-8 leading-tight">
                Ready to Build Your
                <br />
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                  Global Team?
                </span>
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto">
                Join industry leaders who trust Thhiya to manage their international workforce.
                Get compliant, onboard faster, and scale without borders.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-14 md:mb-16">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/"
                    className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 bg-red-600 text-white px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg overflow-hidden shadow-2xl shadow-red-600/50 hover:shadow-red-600/70 transition-all"
                  >
                    <span className="relative z-10">Book Your Demo</span>
                    <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/purple-listings"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl text-white px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-5 rounded-xl sm:rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/40 transition-all font-bold text-base sm:text-lg"
                  >
                    <MapPin className="w-6 h-6" />
                    Explore Providers
                  </Link>
                </motion.div>
              </div>

              {/* Trust Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10"
              >
                {[
                  { icon: <Globe2 className="w-6 h-6 mb-2" />, value: `${stats.totalCountries || 26}`, label: 'Countries' },
                  { icon: <Users className="w-6 h-6 mb-2" />, value: `${stats.totalServices || 12}`, label: 'Services' },
                  { icon: <Shield className="w-6 h-6 mb-2" />, value: `${stats.regions || 6}`, label: 'Regions' },
                  { icon: <Zap className="w-6 h-6 mb-2" />, value: displayDocuments, label: 'Insights' },
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center text-red-400 mb-2">
                      {metric.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                      {metric.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-12 pt-8 border-t border-white/10"
              >
                <p className="text-gray-400 text-sm">
                  Trusted by startups to enterprises. No credit card required to get started.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Floating Payroll Calculator Button */}
      <motion.button
        onClick={() => setIsPayrollModalOpen(true)}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold text-sm transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Know your payroll
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Payroll Calculator Modal */}
      <PayrollModal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} />

      <Footer />
    </div>
  );

};

export default InsightsHubPage;
