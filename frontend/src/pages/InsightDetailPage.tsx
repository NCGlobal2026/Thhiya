import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useInsightsMetadata, useCountryService, useCountryServicesByCountry } from '../services/hooks';
import { InsightsFilterBar } from '../components/insights/InsightsFilterBar';
import { TableOfContents } from '../components/insights/TableOfContents';
import { MobileTableOfContents } from '../components/insights/MobileTableOfContents';
import { ServiceSection } from '../components/insights/ServiceSection';
import { ServiceNavigationTabs } from '../components/insights/ServiceNavigationTabs';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Info,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ContactModal } from '../components/contact';
import slugify from '../utils/slugify';
import { COUNTRY_GUIDES } from '../data/countryGuides';
import { getCountryService, CountryServiceData } from '../services/countryServiceApi';
import { PayrollModal } from '../components/PayrollModal';
import { GA4Events, trackEvent } from '../services/analytics';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { TOP_13_SERVICES } from '../constants/canonicalServices';

// Generate fallback flag URL using flagcdn.com
const getFlagUrl = (code?: string): string => {
  if (code) {
    return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  }
  return '';
};

export const InsightDetailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const rawService = searchParams.get('service') || '';
  const service = slugify(rawService);
  const rawCountry = searchParams.get('country') || '';
  const { data: metadata } = useInsightsMetadata();
  // If metadata is available, try to find the canonical country label that
  // matches the rawCountry via slug comparison. This supports incoming
  // URLs that use slugs like 'usa' or 'united-kingdom' while preserving the
  // display label (e.g., 'United States'). Fall back to the raw value if
  // no metadata match is found.
  const country = (metadata?.countries || []).find(c => slugify(c) === slugify(rawCountry)) || rawCountry;

  // Track engagement (scroll depth, time on page)
  useEngagementTracking(country ? `insights_${slugify(country)}` : 'insights_page');


  const {
    data: singleServiceData,
    isLoading: singleServiceLoading,
    error: singleServiceError
  } = useCountryService(country, service);
  const {
    data: servicesInCountry,
    isLoading: servicesListLoading
  } = useCountryServicesByCountry(country);

  const serviceDetailQueries = useQueries({
    queries: (servicesInCountry ?? []).map(summary => ({
      queryKey: ['country-service', country, summary.serviceSlug],
      queryFn: () => getCountryService(country, summary.serviceSlug),
      enabled: Boolean(country && summary.serviceSlug),
      staleTime: 5 * 60 * 1000
    }))
  });

  const multiServiceData = useMemo(
    () => serviceDetailQueries.map(query => query.data).filter(Boolean) as CountryServiceData[],
    [serviceDetailQueries]
  );

  const guideConfig = country ? COUNTRY_GUIDES[slugify(country)] : undefined;
  const serviceOrder = guideConfig?.serviceOrder ?? [];

  const orderedServices = useMemo(() => {
    if (!multiServiceData.length) return [] as CountryServiceData[];
    if (!serviceOrder.length) {
      return [...multiServiceData].sort((a, b) => a.service.localeCompare(b.service));
    }

    return [...multiServiceData].sort((a, b) => {
      const indexA = serviceOrder.indexOf(a.serviceSlug);
      const indexB = serviceOrder.indexOf(b.serviceSlug);
      if (indexA === -1 && indexB === -1) {
        return a.service.localeCompare(b.service);
      }
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [multiServiceData, serviceOrder]);

  const guideLoading = Boolean(
    country && (servicesListLoading || serviceDetailQueries.some(query => query.isLoading))
  );
  const hasGuideData = Boolean(country && orderedServices.length);
  const fallbackServiceCollection = useMemo(() => {
    if (hasGuideData) return [];

    // If we have a single service selected, prefer its full detail if available
    if (service && singleServiceData && !singleServiceError) {
      return [singleServiceData];
    }

    // If we're in "All Services" mode or specific detail failed, 
    // fall back to whatever summaries we have for this country
    if (servicesInCountry && servicesInCountry.length > 0) {
      return servicesInCountry.map(summary => ({
        ...summary,
        sections: [],
        heroData: summary.heroData || {
          title: summary.service,
          description: `Learn more about ${summary.service} in ${country}.`
        }
      })) as unknown as CountryServiceData[];
    }

    return [];
  }, [hasGuideData, service, singleServiceData, singleServiceError, servicesInCountry, country]);

  // Filter services to display - show all if no service selected, or only selected one
  const displayedServices = useMemo(() => {
    // If no service is selected, show all services for the country
    if (!service) {
      if (hasGuideData) {
        return orderedServices;
      }
      return fallbackServiceCollection;
    }

    // If a specific service is selected, show only that one
    if (hasGuideData) {
      const normalize = (slug: string) =>
        slug
          .toLowerCase()
          .replace(/-services$/i, '')
          .replace(/\s+services?$/i, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const selected = orderedServices.find(s => {
        const normalizedSlug = normalize(s.serviceSlug);
        const normalizedService = normalize(service);
        return s.serviceSlug === service ||
          normalizedSlug === normalizedService ||
          s.service === service ||
          normalizedSlug.includes(normalizedService) ||
          normalizedService.includes(normalizedSlug);
      });
      return selected ? [selected] : orderedServices; // Fall back to all services if none match
    }
    return fallbackServiceCollection;
  }, [service, hasGuideData, orderedServices, fallbackServiceCollection]);

  const guideServiceOptions = hasGuideData
    ? orderedServices.map(entry => ({ value: entry.serviceSlug, label: entry.service }))
    : [];

  const metadataServiceOptions = useMemo(() => {
    let base = metadata?.servicesDetail
      ? metadata.servicesDetail.map((s: any) => ({ value: slugify(s.slug || s.slug), label: s.name }))
      : metadata?.services?.map((s: any) => ({ value: slugify(s.slug || s), label: s.name || s })) ?? [];
    return base.filter((s: { value: string; label: string }) => TOP_13_SERVICES.includes(s.value));
  }, [metadata]);

  const serviceOptions = guideServiceOptions.length ? guideServiceOptions : metadataServiceOptions;

  const countryOptions = useMemo(() => {
    let base = metadata?.countries?.map(c => ({ value: c, label: c })) ?? [];
    return base.slice(0, 192);
  }, [metadata]);



  const handleServiceChange = (newService: string) => {
    const params = new URLSearchParams(searchParams);
    // Ensure we store canonical slug in URL
    params.set('service', slugify(newService));
    setSearchParams(params);
    // Track service selection
    if (newService) {
      GA4Events.selectContent({
        contentType: 'insights_service_filter',
        contentId: newService,
      });
    }
  };

  // Canonicalize service value in URL on load (if user used a non-slug
  // human-friendly service label). This keeps the filter selects in sync
  // with canonical slug values used across the UI.
  useEffect(() => {
    if (rawService && rawService !== service) {
      const params = new URLSearchParams(searchParams);
      params.set('service', service);
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawService, service]);

  const handleCountryChange = (newCountry: string) => {
    const params = new URLSearchParams(searchParams);
    // Use canonical country label (if possible). We'll attempt to find a
    // metadata match and set the URL to the canonical label.
    const canonical = (metadata?.countries || []).find(c => slugify(c) === slugify(newCountry)) || newCountry;
    params.set('country', canonical);
    setSearchParams(params);
    // Track country selection
    if (newCountry) {
      GA4Events.selectContent({
        contentType: 'insights_country_filter',
        contentId: newCountry,
      });
    }
  };

  // Canonicalize the country parameter in the URL if it doesn't match the
  // expected metadata label. This makes the selected option consistent with
  // the values returned by `metadata.countries` and ensures the FilterBar
  // displays the chosen country correctly.
  useEffect(() => {
    if (!rawCountry) return;
    const canonical = (metadata?.countries || []).find(c => slugify(c) === slugify(rawCountry));
    if (canonical && canonical !== rawCountry) {
      const params = new URLSearchParams(searchParams);
      params.set('country', canonical);
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCountry, metadata]);

  useEffect(() => {
    if (!service || (!hasGuideData && !fallbackServiceCollection.length)) {
      return;
    }
    const target = document.getElementById(`service-${service}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [service, hasGuideData, fallbackServiceCollection.length]);

  const heroTitle = (hasGuideData && guideConfig)
    ? guideConfig.heroTitle
    : country
      ? `${country} Employment Guide`
      : 'Global Employment Insights';

  const heroSubtitle = (hasGuideData && guideConfig)
    ? guideConfig.heroSubtitle
    : service
      ? `Detailed ${service.replace(/-/g, ' ')} insights and requirements.`
      : `Complete expansion and employment roadmap for ${country}.`;

  const heroDescription = (hasGuideData && guideConfig)
    ? guideConfig.description
    : displayedServices.length > 0 && displayedServices[0].heroData?.description
      ? displayedServices[0].heroData.description
      : 'Access independent market data, vetted local partners, and on-the-ground expertise for your global expansion.';

  // Use displayedServices for table of contents to match what's shown
  const tableOfContentsItems = hasGuideData
    ? [
      {
        id: 'guide-overview',
        title: guideConfig?.heroTitle || `${country} Business Guide`,
        icon: <BookOpen className="w-4 h-4" />
      },
      ...(guideConfig
        ? [
          {
            id: 'who-we-help',
            title: guideConfig.audienceHeading,
            icon: <Users className="w-4 h-4" />
          }
        ]
        : []),
      ...displayedServices.map(entry => ({
        id: `service-${entry.serviceSlug}`,
        title: entry.heroData?.title || entry.service,
        icon: <BookOpen className="w-4 h-4" />
      })),
      ...(guideConfig
        ? [
          {
            id: 'country-cta',
            title: guideConfig.outroTitle,
            icon: <Target className="w-4 h-4" />
          }
        ]
        : [])
    ]
    : fallbackServiceCollection.length
      ? fallbackServiceCollection.map(entry => ({
        id: `service-${entry.serviceSlug}`,
        title: entry.heroData?.title || entry.service,
        icon: <BookOpen className="w-4 h-4" />
      }))
      : [];

  // Use the ServiceSection component for rendering sections
  const renderSectionContent = (section: CountryServiceData['sections'][number], index: number, delayOffset = 0) => (
    <ServiceSection
      key={`${section.id}-${index}`}
      section={section as any}
      animationDelay={delayOffset}
    />
  );

  // Build service tabs for navigation
  const serviceTabs = useMemo(() => {
    if (!hasGuideData) return [];
    return orderedServices.map(entry => ({
      slug: entry.serviceSlug,
      name: entry.heroData?.title || entry.service,
    }));
  }, [hasGuideData, orderedServices]);

  const renderServiceCollection = (collection: CountryServiceData[]) => (
    <section className="py-6 xs:py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-b from-gray-50/50 to-white" id="guide-content">
      <Container>
        {/* Service Navigation Tabs */}
        {serviceTabs.length > 1 && (
          <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8">
            <ServiceNavigationTabs
              services={serviceTabs}
              activeService={service}
              onServiceChange={handleServiceChange}
              variant="default"
            />
          </div>
        )}

        <MobileTableOfContents sections={tableOfContentsItems} />
        <div className="grid lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
          <div className="lg:col-span-3 space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10">
            {hasGuideData && guideConfig && (
              <motion.section
                id="guide-overview"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-5">
                  <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BookOpen className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-red-600 uppercase tracking-wide sm:tracking-[0.2em] mb-0.5 xs:mb-1">Country Playbook</p>
                    <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-900 break-words">{guideConfig.heroTitle}</h2>
                  </div>
                </div>
                <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-navy-700 mb-2 xs:mb-3 sm:mb-4 md:mb-6">{guideConfig.heroSubtitle}</p>
                <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">{guideConfig.description}</p>
              </motion.section>
            )}

            {hasGuideData && guideConfig && (
              <motion.section
                id="who-we-help"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                  <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl sm:rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0 shadow-md">
                    <Users className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-red-600 uppercase tracking-wide mb-0.5 xs:mb-1">Audience</p>
                    <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-navy-900 break-words">{guideConfig.audienceHeading}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-5">
                  {guideConfig.audience.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-lg xs:rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white p-3 xs:p-4 sm:p-5 md:p-6 hover:border-red-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-2 xs:gap-3">
                        <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-navy-500 flex-shrink-0 mt-0.5 group-hover:text-navy-600 transition-colors" />
                        <p className="text-xs xs:text-sm sm:text-base text-gray-700 break-words">{item}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {collection.map((entry, index) => {
              const isHighlighted = service && entry.serviceSlug === service;
              return (
                <motion.section
                  key={`${entry.serviceSlug}-${index}`}
                  id={`service-${entry.serviceSlug}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl border-2 bg-white p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all ${isHighlighted ? 'border-red-500 shadow-red-100 ring-2 ring-red-100' : 'border-gray-200'
                    }`}
                >
                  <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 text-[10px] xs:text-xs sm:text-sm font-semibold text-red-600 uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1 xs:gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-2 xs:px-3 py-0.5 xs:py-1 sm:px-4 sm:py-1.5 text-white shadow-md">
                        <Sparkles className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />
                        Key Service
                      </span>
                      {entry.heroData.bestFor && (
                        <span className="rounded-full bg-gray-100 px-2 xs:px-3 py-0.5 xs:py-1 sm:px-4 sm:py-1.5 text-gray-700 text-[10px] xs:text-xs sm:text-sm">
                          Best for: {entry.heroData.bestFor}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-navy-900 break-words">{entry.heroData.title || entry.service}</h3>
                    {entry.heroData.subtitle && (
                      <p className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-red-600">{entry.heroData.subtitle}</p>
                    )}
                    {entry.heroData.description && (
                      <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">{entry.heroData.description}</p>
                    )}
                  </div>

                  {entry.sections && entry.sections.length > 0 && (
                    <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-10 space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
                      {entry.sections
                        .slice()
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((section, sectionIndex) => renderSectionContent(section, sectionIndex, sectionIndex * 0.05))}
                    </div>
                  )}

                  {(!entry.sections || entry.sections.length === 0) && (
                    <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-center gap-2 xs:gap-3">
                        <Info className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                        <p className="text-gray-600 text-center text-xs xs:text-sm sm:text-base">Detailed content for this service is being prepared. Check back soon!</p>
                      </div>
                    </div>
                  )}

                  {entry.ctaText && entry.ctaLink && (
                    <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-10">
                      <button
                        onClick={() => navigate(entry.ctaLink!)}
                        className="inline-flex items-center gap-2 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all text-xs xs:text-sm sm:text-base"
                      >
                        {entry.ctaText}
                        <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4" />
                      </button>
                    </div>
                  )}
                </motion.section>
              );
            })}

            {hasGuideData && guideConfig && (
              <motion.section
                id="country-cta"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-red-900 text-white p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl"
              >
                <div className="flex flex-col items-start gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                  <div className="inline-flex items-center gap-1.5 xs:gap-2 rounded-full border border-white/30 px-2 xs:px-3 py-1 xs:py-1.5 sm:px-4 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-semibold">
                    <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />
                    Expansion Partner
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-words">{guideConfig.outroTitle}</h3>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg text-white/80">{guideConfig.outroDescription}</p>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3">
                    {guideConfig.outroActions.map((cta, index) => (
                      <span key={index} className="rounded-full bg-white/10 px-2 xs:px-3 py-1 xs:py-1.5 sm:px-4 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-semibold">
                        {cta}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col xs:flex-row flex-wrap gap-2 xs:gap-3 sm:gap-4 w-full xs:w-auto">
                    <Link
                      to="/purple-listings"
                      className="inline-flex items-center justify-center gap-2 rounded-lg xs:rounded-xl sm:rounded-2xl bg-red-600 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 font-semibold text-white shadow-lg hover:bg-red-500 text-xs xs:text-sm sm:text-base"
                    >
                      Browse Providers
                      <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4" />
                    </Link>
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-2 rounded-lg xs:rounded-xl sm:rounded-2xl border border-white/40 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 font-semibold text-white hover:bg-white/10 text-xs xs:text-sm sm:text-base"
                    >
                      <Calendar className="w-3 h-3 xs:w-4 xs:h-4" />
                      Talk to Expert
                    </Link>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-1">
            {tableOfContentsItems.length > 0 && <TableOfContents sections={tableOfContentsItems} />}
          </div>
        </div>
      </Container>
    </section>
  );


  const showGuide = hasGuideData || fallbackServiceCollection.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative pt-16 xs:pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 xs:pb-10 sm:pb-12 md:pb-14 lg:pb-16 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(230, 57, 70) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />
        </div>
        <Container className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link
              to="/insights/hub"
              className="inline-flex items-center gap-1.5 xs:gap-2 text-gray-400 hover:text-white mb-4 xs:mb-5 sm:mb-6 md:mb-8 transition-colors group text-xs xs:text-sm sm:text-base"
            >
              <ArrowLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Insights Hub
            </Link>

            {country && (
              <div className="flex items-center gap-3 xs:gap-4 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                {(() => {
                  const countryDetail = (metadata as any)?.countriesDetail?.find((c: any) => c.name === country);
                  // Prioritize DB flag (Golden Source), fallback to computed CDN URL
                  const goldenFlag = countryDetail?.flag;
                  const cdnFlag = getFlagUrl(countryDetail?.code);
                  const effectiveFlag = goldenFlag || cdnFlag;

                  if (!effectiveFlag) return null;

                  return (
                    <img
                      src={effectiveFlag}
                      alt={`${country} flag`}
                      className="w-12 h-8 xs:w-14 xs:h-10 sm:w-16 sm:h-12 object-cover rounded-lg shadow-lg border-2 border-white/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  );
                })()}
              </div>
            )}

            <div className="max-w-4xl">
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 xs:mb-3 sm:mb-4 leading-tight break-words">{heroTitle}</h1>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-2 xs:mb-3 sm:mb-4">{heroSubtitle}</p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-white/70 leading-relaxed">{heroDescription}</p>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="py-3 xs:py-4 sm:py-5 md:py-6 bg-white border-b border-gray-200 relative z-30 overflow-visible">
        <Container className="overflow-visible">
          <InsightsFilterBar
            selectedService={service}
            selectedCountry={country}
            onServiceChange={handleServiceChange}
            onCountryChange={handleCountryChange}
            services={serviceOptions}
            countries={countryOptions}
          />
        </Container>
      </section>

      {!country ? (
        <section className="py-10 xs:py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto px-2 xs:px-4"
            >
              <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 xs:mb-5 sm:mb-6 md:mb-8 shadow-2xl">
                <Target className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900 mb-2 xs:mb-3 sm:mb-4">Choose Your Destination</h2>
              <p className="text-sm xs:text-base sm:text-lg text-gray-600 mb-4 xs:mb-5 sm:mb-6 md:mb-8 leading-relaxed">
                Select a country to access comprehensive employment guides,
                cost breakdowns, and compliance requirements.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-4 xs:mb-5 sm:mb-6 md:mb-8">
                {[
                  { service: 'eor-peo-aor', country: 'Australia' },
                  { service: 'eor-peo-aor', country: 'United Kingdom' },
                  { service: 'global-payroll', country: 'India' },
                  { service: '', country: 'Germany' },
                  { service: '', country: 'Japan' }
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (suggestion.service) {
                        handleServiceChange(suggestion.service);
                      }
                      handleCountryChange(suggestion.country);
                    }}
                    className="px-2.5 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-2.5 bg-white border-2 border-gray-200 rounded-lg xs:rounded-xl text-[10px] xs:text-xs sm:text-sm font-medium text-gray-700 hover:border-red-600 hover:text-red-600 transition-all shadow-sm hover:shadow-md"
                  >
                    {suggestion.service ? `${suggestion.service.replace(/-/g, ' ').toUpperCase()} in ${suggestion.country}` : `All in ${suggestion.country}`}
                  </button>
                ))}
              </div>
              <Link
                to="/insights/hub"
                className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors text-sm xs:text-base"
              >
                <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4" />
                Browse All Countries
              </Link>
            </motion.div>
          </Container>
        </section>
      ) : null}

      {country && guideLoading && !hasGuideData && !fallbackServiceCollection.length && (
        <section className="py-12 xs:py-16 sm:py-20 bg-white">
          <Container>
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full mb-4 xs:mb-5 sm:mb-6"
              />
              <h3 className="text-lg xs:text-xl font-semibold text-navy-900 mb-1.5 xs:mb-2">Loading Insights</h3>
              <p className="text-sm xs:text-base text-gray-600">Preparing comprehensive data for {country}...</p>
            </div>
          </Container>
        </section>
      )}

      {country && !guideLoading && !hasGuideData && !fallbackServiceCollection.length && (
        <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
          <Container>
            <div className="text-center max-w-2xl mx-auto px-2 xs:px-4">
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-red-100 rounded-xl xs:rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 xs:mb-6 sm:mb-8">
                <Info className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-red-600" />
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900 mb-2 xs:mb-3 sm:mb-4">Insights Coming Soon</h2>
              <p className="text-sm xs:text-base sm:text-lg text-gray-600 mb-4 xs:mb-5 sm:mb-6">
                We're working on comprehensive insights for{' '}
                {service ? (
                  <>
                    <span className="font-bold text-navy-900">{service.replace(/-/g, ' ')}</span> in{' '}
                  </>
                ) : null}
                <span className="font-bold text-navy-900">{country}</span>.
              </p>
              <p className="text-xs xs:text-sm sm:text-base text-gray-500 mb-6 xs:mb-7 sm:mb-8">
                Try selecting a different {service ? 'combination' : 'country'} or contact our team for custom insights.
              </p>
              <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center">
                <Link
                  to="/insights/hub"
                  className="px-5 py-2.5 xs:px-6 xs:py-3 sm:px-8 sm:py-3 bg-red-600 text-white font-semibold rounded-lg xs:rounded-xl hover:bg-red-700 transition-all shadow-lg text-sm xs:text-base"
                >
                  Explore Available Countries
                </Link>
                <Link
                  to="/"
                  className="px-5 py-2.5 xs:px-6 xs:py-3 sm:px-8 sm:py-3 bg-white text-navy-900 font-semibold rounded-lg xs:rounded-xl border-2 border-gray-200 hover:border-red-600 transition-all text-sm xs:text-base"
                >
                  Talk to Expert
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Show guide when country is selected and we have data */}
      {country && (hasGuideData || fallbackServiceCollection.length > 0) && renderServiceCollection(displayedServices)}

      {/* Removed expansion partner CTA section as requested */}

      {/* Contact Us CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-navy-600/30 rounded-full blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white/90 mb-4 sm:mb-6"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              Let's Connect
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Need Help With Your Global Expansion?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 leading-relaxed">
              Our team of experts is ready to answer your questions and help you navigate international hiring, payroll, and compliance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Users className="w-5 h-5" />
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/get-matched"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
              >
                <Target className="w-5 h-5" />
                Get Matched with Providers
              </Link>
            </div>
          </div>
        </Container>
      </motion.section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        source="insights-page"
      />

      {/* Floating Payroll Calculator Button */}
      <motion.button
        onClick={() => {
          trackEvent('payroll_calculator_clicked', { source: 'insights_page_floating' });
          setIsPayrollModalOpen(true);
        }}
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
