import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BANTModal } from '../components/bant';
import {
  Info,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useCountryService } from '../services/hooks';
import { ServiceSection } from '../components/insights/ServiceSection';
import { GA4Events } from '../services/analytics';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export default function CountryServicePage() {
  const { country, service } = useParams<{ country: string; service: string }>();
  const [isBANTModalOpen, setIsBANTModalOpen] = useState(false);

  const { data, isLoading: loading, error } = useCountryService(country || '', service || '');
  const hasTrackedView = useRef(false);

  // Track engagement (scroll depth, time on page)
  useEngagementTracking(`country_service_${country}_${service}`, !!data);

  // Track page view when data loads
  useEffect(() => {
    if (!hasTrackedView.current && data && country && service) {
      GA4Events.viewItem({
        itemId: `${data.countrySlug}-${data.serviceSlug}`,
        itemName: `${data.service} in ${data.country}`,
        itemCategory: 'country_service_insight',
        itemCategory2: data.countryCode,
      });
      hasTrackedView.current = true;
    }
  }, [data, country, service]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-600 text-sm sm:text-base">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Service Not Found</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              {error?.message || 'The requested service could not be found.'}
            </p>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Insights
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sortedSections = data.sections ? [...data.sections].sort((a, b) => a.order - b.order) : [];

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
          <Link
            to={`/insights?country=${encodeURIComponent(data.country)}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to {data.country} Services
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl md:text-5xl">{getFlagEmoji(data.countryCode)}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">{data.country}</h1>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-red-400 mb-3 sm:mb-4">{data.heroData.title}</h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-4 sm:mb-5 md:mb-6 max-w-3xl">{data.heroData.subtitle}</p>
            <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-4xl mb-4 sm:mb-5 md:mb-6">{data.heroData.description}</p>

            {data.heroData.bestFor && (
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 border border-white/20">
                <p className="text-xs sm:text-sm font-medium text-red-400 mb-0.5 sm:mb-1 uppercase tracking-wider">Best For</p>
                <p className="text-sm sm:text-base text-white">{data.heroData.bestFor}</p>
              </div>
            )}
          </motion.div>
        </Container>
      </section>

      {/* Sections */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50">
        <Container>
          <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
            {sortedSections.map((section, index) => (
              <ServiceSection
                key={section.id}
                section={section as any}
                animationDelay={index * 0.05}
              />
            ))}

            {/* CTA Section */}
            {data.ctaText && data.ctaLink && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-navy-900 via-navy-800 to-red-900 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 text-center text-white"
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h3>
                <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 max-w-2xl mx-auto">
                  Connect with curated providers who can help you with {data.service} in {data.country}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsBANTModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Matched with Providers
                  </button>
                  <Link
                    to="/purple-listings"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors"
                  >
                    Browse Providers
                  </Link>
                </div>
              </motion.div>
            )}

            {/* BANT/MEDDIC/INTENT(BMI) Modal */}
            <BANTModal
              isOpen={isBANTModalOpen}
              onClose={() => setIsBANTModalOpen(false)}
              source={`country-service-${country}-${service}`}
            />
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
