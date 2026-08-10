import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe2, DollarSign, Users, ArrowRight, Calendar, Flag, Briefcase, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import slugify from '../../utils/slugify';

// Country code mapping for flag fallback URLs
const COUNTRY_CODE_MAP: Record<string, string> = {
  'Australia': 'AU',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Brazil': 'BR',
  'Canada': 'CA',
  'China': 'CN',
  'Denmark': 'DK',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Hong Kong': 'HK',
  'India': 'IN',
  'Indonesia': 'ID',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Japan': 'JP',
  'Malaysia': 'MY',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Norway': 'NO',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Singapore': 'SG',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Taiwan': 'TW',
  'Thailand': 'TH',
  'United Arab Emirates': 'AE',
  'UAE': 'AE',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'United States': 'US',
  'USA': 'US',
  'Vietnam': 'VN',
};

// Generate fallback flag URL using flagcdn.com
const getFlagUrl = (country: string, flagUrl?: string, code?: string): string => {
  if (flagUrl) return flagUrl;

  // Use explicit ISO code if available
  if (code) {
    return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  }

  // Fallback to hardcoded map
  const mappedCode = COUNTRY_CODE_MAP[country];
  if (mappedCode) {
    return `https://flagcdn.com/w160/${mappedCode.toLowerCase()}.png`;
  }
  return '';
};

interface CountryCardProps {
  country: string;
  code?: string;
  flagUrl?: string;
  employmentCost: string;
  languages: string[];
  currency: string;
  annualLeave?: string;
  service?: string;
  insightCount?: number;
  serviceSummary?: { service: string; count: number }[];
}

// Mobile-optimized Country Card - Visually rich and engaging
const MobileCountryCard: React.FC<CountryCardProps> = React.memo(({
  country,
  code,
  flagUrl,
  employmentCost,
  languages,
  service,
  insightCount,
  serviceSummary
}) => {
  const [imgError, setImgError] = useState(false);
  const serviceLabel = service && service.length > 0 ? service : 'EOR/PEO Services';
  const encodedService = encodeURIComponent(slugify(serviceLabel));
  const encodedCountry = encodeURIComponent(country);
  const resolvedFlagUrl = getFlagUrl(country, flagUrl, code);
  const showFlag = resolvedFlagUrl && !imgError;

  // Calculate service count for display
  const serviceCount = insightCount || serviceSummary?.length || 1;

  return (
    <Link to={`/insights?service=${encodedService}&country=${encodedCountry}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="group relative bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-red-400 transition-all active:bg-gray-50 h-[160px] flex flex-col"
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        {/* Card Content */}
        <div className="p-3 xxs:p-4">
          {/* Header with Flag and Country Name */}
          <div className="flex items-center gap-3 xxs:gap-4 mb-3 xxs:mb-4">
            {/* Flag with shadow and border */}
            <div className="relative flex-shrink-0">
              {showFlag ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 blur-md rounded-lg transform scale-110" />
                  <img
                    src={resolvedFlagUrl}
                    alt={`${country} flag`}
                    className="relative w-14 h-10 xxs:w-16 xxs:h-11 object-cover rounded-lg shadow-lg border-2 border-white ring-2 ring-gray-100"
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : (
                <div className="w-14 h-10 xxs:w-16 xxs:h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Flag className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Country Name and Service Badge */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-base xxs:text-lg truncate mb-0.5">
                {country}
              </h3>
            </div>
          </div>

          {/* Key Stats Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-2 xxs:gap-3 mb-3 xxs:mb-4">
            {/* Employment Cost */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-2.5 xxs:p-3 border border-red-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 xxs:w-6 xxs:h-6 bg-red-500 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 xxs:w-3.5 xxs:h-3.5 text-white" />
                </div>
                <span className="text-[9px] xxs:text-[10px] font-semibold text-red-700 uppercase tracking-wide">Cost</span>
              </div>
              <p className="text-xs xxs:text-sm font-bold text-navy-900 truncate">{employmentCost}</p>
            </div>

            {/* Languages */}
            <div className="bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-xl p-2.5 xxs:p-3 border border-navy-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 xxs:w-6 xxs:h-6 bg-navy-700 rounded-md flex items-center justify-center">
                  <Globe2 className="w-3 h-3 xxs:w-3.5 xxs:h-3.5 text-white" />
                </div>
                <span className="text-[9px] xxs:text-[10px] font-semibold text-navy-700 uppercase tracking-wide">Lang</span>
              </div>
              <p className="text-xs xxs:text-sm font-bold text-navy-900 truncate">
                {languages.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>

          {/* Services Pills */}
          {false && serviceSummary && (serviceSummary?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 xxs:gap-1.5 mb-3 xxs:mb-4">
              {serviceSummary?.slice(0, 2).map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[9px] xxs:text-[10px] font-medium"
                >
                  <Briefcase className="w-2.5 h-2.5" />
                  {s.service}
                </span>
              ))}
              {(serviceSummary?.length ?? 0) > 2 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] xxs:text-[10px] font-semibold">
                  +{(serviceSummary?.length ?? 0) - 2} more
                </span>
              )}
            </div>
          )}

          {/* CTA Button */}
          <motion.div
            className="flex items-center justify-between pt-2.5 xxs:pt-3 border-t border-gray-100"
          >
            <span className="text-xs xxs:text-sm font-bold text-red-600">
              Explore Guide
            </span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 xxs:w-9 xxs:h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <ArrowRight className="w-4 h-4 xxs:w-4.5 xxs:h-4.5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
});

// Desktop/Tablet Country Card - Full featured
const DesktopCountryCard: React.FC<CountryCardProps> = React.memo(({
  country,
  code,
  flagUrl,
  employmentCost,
  languages,
  currency,
  annualLeave,
  service,
  insightCount,
  serviceSummary
}) => {
  const [imgError, setImgError] = useState(false);
  const serviceLabel = service && service.length > 0 ? service : 'EOR/PEO Services';
  const encodedService = encodeURIComponent(slugify(serviceLabel));
  const encodedCountry = encodeURIComponent(country);
  const resolvedFlagUrl = getFlagUrl(country, flagUrl, code);
  const showFlag = resolvedFlagUrl && !imgError;

  // Calculate service count for display - ensure we always show a meaningful number
  const serviceCount = insightCount || serviceSummary?.length || 1;

  return (
    <Link to={`/insights?service=${encodedService}&country=${encodedCountry}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-white rounded-2xl md:rounded-3xl border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-red-500 hover:shadow-2xl hover:shadow-red-600/10 transition-all h-full min-h-[480px] flex flex-col"
      >
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Flag Hero Section */}
        <div className="relative h-40 md:h-44 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(30deg, #E63946 12%, transparent 12.5%, transparent 87%, #E63946 87.5%, #E63946),
                  linear-gradient(150deg, #E63946 12%, transparent 12.5%, transparent 87%, #E63946 87.5%, #E63946)
                `,
                backgroundSize: '20px 35px'
              }}
            />
          </div>

          {/* Flag Image */}
          {/* Flag Image */}
          {showFlag ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative z-10 h-full flex items-center justify-center p-4 md:p-6"
            >
              <img
                src={resolvedFlagUrl}
                alt={`${country} flag`}
                className="h-24 md:h-28 w-auto object-contain rounded-xl shadow-2xl border-4 border-white/20 group-hover:border-red-500/50 transition-all"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
            </motion.div>
          ) : (
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Flag className="w-12 h-12 md:w-14 md:h-14 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative p-4 md:p-5 lg:p-6">
          {/* Country Name */}
          <div className="mb-4 md:mb-5">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-navy-900 group-hover:text-red-600 transition-colors mb-1 truncate">
              {country}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Employment Market Insights</p>
          </div>

          {/* Stats Grid */}
          <div className="space-y-2.5 md:space-y-3 mb-4 md:mb-5">
            {/* Employment Cost */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-red-50 transition-all group/item"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all">
                <TrendingUp className="w-4.5 h-4.5 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                  Employment Cost
                </p>
                <p className="text-sm font-bold text-navy-900 truncate">{employmentCost}</p>
              </div>
            </motion.div>

            {/* Annual Leave */}
            {annualLeave && (
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-navy-50 transition-all group/item"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-navy-800 to-navy-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all">
                  <Calendar className="w-4.5 h-4.5 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                    Annual Leave
                  </p>
                  <p className="text-sm font-bold text-navy-900 truncate">{annualLeave}</p>
                </div>
              </motion.div>
            )}

            {/* Languages */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-red-50 transition-all group/item"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all">
                <Globe2 className="w-4.5 h-4.5 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                  Languages
                </p>
                <p className="text-sm font-bold text-navy-900 truncate">
                  {languages.slice(0, 2).join(', ')}{languages.length > 2 ? '...' : ''}
                </p>
              </div>
            </motion.div>

            {/* Currency */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-navy-50 transition-all group/item"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-navy-700 to-navy-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:shadow-xl group-hover/item:scale-110 transition-all">
                <DollarSign className="w-4.5 h-4.5 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                  Currency
                </p>
                <p className="text-sm font-bold text-navy-900 truncate">{currency}</p>
              </div>
            </motion.div>
          </div>

          {/* Services Chips */}
          {false && serviceSummary && (serviceSummary?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {serviceSummary?.slice(0, 3).map((s, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700 truncate max-w-[100px]">{s.service}</span>
              ))}
              {(serviceSummary?.length ?? 0) > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700">+{(serviceSummary?.length ?? 0) - 3}</span>
              )}
            </div>
          )}

          {/* CTA Button */}
          <motion.div
            className="pt-3 md:pt-4 border-t-2 border-gray-100 group-hover:border-red-500/20 transition-all"
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-red-600 group-hover:text-red-700">
                View Guide
              </span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:bg-red-700 transition-all"
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
});

// Main CountryCard component that renders appropriate version based on screen size
export const CountryCard: React.FC<CountryCardProps> = React.memo((props) => {
  return (
    <>
      {/* Mobile: < 640px - Use mobile-optimized card */}
      <div className="block sm:hidden">
        <MobileCountryCard {...props} />
      </div>
      {/* Tablet/Desktop: >= 640px - Use full-featured card */}
      <div className="hidden sm:block">
        <DesktopCountryCard {...props} />
      </div>
    </>
  );
});
