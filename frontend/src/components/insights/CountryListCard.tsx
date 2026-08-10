import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Globe2,
    ArrowRight,
    TrendingUp,
    Calendar,
    DollarSign,
    Flag,
    Clock,
    Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import slugify from '../../utils/slugify';

// Country code mapping for flag fallback URLs
const COUNTRY_CODE_MAP: Record<string, string> = {
    'Australia': 'AU', 'Austria': 'AT', 'Belgium': 'BE', 'Brazil': 'BR',
    'Canada': 'CA', 'China': 'CN', 'Denmark': 'DK', 'Finland': 'FI',
    'France': 'FR', 'Germany': 'DE', 'Hong Kong': 'HK', 'India': 'IN',
    'Indonesia': 'ID', 'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT',
    'Japan': 'JP', 'Malaysia': 'MY', 'Mexico': 'MX', 'Netherlands': 'NL',
    'New Zealand': 'NZ', 'Norway': 'NO', 'Philippines': 'PH', 'Poland': 'PL',
    'Portugal': 'PT', 'Singapore': 'SG', 'South Korea': 'KR', 'Spain': 'ES',
    'Sweden': 'SE', 'Switzerland': 'CH', 'Taiwan': 'TW', 'Thailand': 'TH',
    'United Arab Emirates': 'AE', 'UAE': 'AE', 'United Kingdom': 'GB',
    'UK': 'GB', 'United States': 'US', 'USA': 'US', 'Vietnam': 'VN',
};

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

interface CountryListCardProps {
    country: string;
    code?: string;
    slug?: string;
    flagUrl?: string;
    employmentCost: string;
    languages: string[];
    currency: string;
    annualLeave?: string;
    service?: string;
    insightCount?: number;
    serviceSummary?: { service: string; count: number }[];
    region?: string;
    updatedAt?: string;
}

// Mobile version - visually rich compact card with gradient and visual hierarchy
export const CountryListCardMobile: React.FC<CountryListCardProps> = React.memo(({
    country,
    code,
    flagUrl,
    employmentCost,
    service,
    serviceSummary,
    region,
    languages,
    insightCount,
}) => {
    const [imgError, setImgError] = useState(false);
    const serviceLabel = service || serviceSummary?.[0]?.service || 'EOR/PEO Services';
    const encodedService = encodeURIComponent(slugify(serviceLabel));
    const encodedCountry = encodeURIComponent(country);
    const resolvedFlagUrl = getFlagUrl(country, flagUrl, code);
    const showFlag = resolvedFlagUrl && !imgError;

    return (
        <Link to={`/insights?service=${encodedService}&country=${encodedCountry}`}>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden bg-gradient-to-r from-white via-white to-gray-50 border border-gray-200 rounded-xl xxs:rounded-2xl p-2.5 xxs:p-3 xs:p-4 hover:border-red-400 hover:shadow-lg transition-all active:bg-gray-50 group"
            >
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-1 xxs:w-1.5 h-full bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-l-xl" />

                <div className="flex items-center gap-2.5 xxs:gap-3 xs:gap-4 pl-2 xxs:pl-2.5">
                    {/* Flag with glow effect */}
                    <div className="relative flex-shrink-0">
                        {showFlag ? (
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-lg transform scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img
                                    src={resolvedFlagUrl}
                                    alt={`${country} flag`}
                                    className="relative w-12 h-8 xxs:w-14 xxs:h-10 xs:w-16 xs:h-11 object-cover rounded-lg shadow-md border-2 border-white ring-1 ring-gray-200 group-hover:ring-red-300 transition-all"
                                    onError={() => setImgError(true)}
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-8 xxs:w-14 xxs:h-10 xs:w-16 xs:h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                                <Flag className="w-5 h-5 xxs:w-6 xxs:h-6 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 xxs:gap-2 mb-0.5 xxs:mb-1">
                            <h4 className="font-bold text-navy-900 text-sm xxs:text-base truncate group-hover:text-red-600 transition-colors">
                                {country}
                            </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 xxs:gap-1.5 xs:gap-2">
                            {region && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] xxs:text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                    <Globe2 className="w-2.5 h-2.5 xxs:w-3 xxs:h-3" />
                                    {region}
                                </span>
                            )}
                            {serviceSummary && serviceSummary.length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] xxs:text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md font-medium">
                                    <Briefcase className="w-2.5 h-2.5 xxs:w-3 xxs:h-3" />
                                    {serviceSummary.length} services
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats and Arrow */}
                    <div className="flex items-center gap-2 xxs:gap-2.5 flex-shrink-0">
                        {/* Cost Badge */}
                        <div className="hidden xxs:flex flex-col items-end">
                            <span className="text-[9px] xxs:text-[10px] text-gray-400 font-medium uppercase">Cost</span>
                            <span className="text-xs xxs:text-sm font-bold text-red-600 bg-red-50 px-1.5 xxs:px-2 py-0.5 rounded-md">
                                {employmentCost}
                            </span>
                        </div>

                        {/* Arrow with animation */}
                        <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-7 h-7 xxs:w-8 xxs:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all"
                        >
                            <ArrowRight className="w-3.5 h-3.5 xxs:w-4 xxs:h-4 text-white" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
});

// Tablet version - medium detail card
export const CountryListCardTablet: React.FC<CountryListCardProps> = React.memo(({
    country,
    code,
    flagUrl,
    employmentCost,
    languages,
    currency,
    service,
    serviceSummary,
    region,
    updatedAt,
}) => {
    const [imgError, setImgError] = useState(false);
    const serviceLabel = service || serviceSummary?.[0]?.service || 'EOR/PEO Services';
    const encodedService = encodeURIComponent(slugify(serviceLabel));
    const encodedCountry = encodeURIComponent(country);
    const resolvedFlagUrl = getFlagUrl(country, flagUrl, code);
    const showFlag = resolvedFlagUrl && !imgError;

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return null;
        }
    };

    return (
        <Link to={`/insights?service=${encodedService}&country=${encodedCountry}`}>
            <motion.div
                whileHover={{ y: -2 }}
                className="group flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-red-500 hover:shadow-lg transition-all"
            >
                {/* Flag */}
                <div className="flex-shrink-0">
                    {showFlag ? (
                        <img
                            src={resolvedFlagUrl}
                            alt={`${country} flag`}
                            className="w-14 h-10 object-cover rounded-lg shadow-sm border-2 border-gray-100 group-hover:border-red-200 transition-colors"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Flag className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-navy-900 text-base group-hover:text-red-600 transition-colors truncate">
                            {country}
                        </h4>
                        {region && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline">
                                {region}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Globe2 className="w-3 h-3" />
                            {languages.slice(0, 2).join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {currency}
                        </span>
                        {updatedAt && formatDate(updatedAt) && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated {formatDate(updatedAt)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-500">Cost</div>
                        <div className="text-sm font-semibold text-red-600">{employmentCost}</div>
                    </div>
                    {serviceSummary && serviceSummary.length > 0 && (
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Services</div>
                            <div className="text-sm font-bold text-navy-900">{serviceSummary.length}</div>
                        </div>
                    )}
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.div>
        </Link>
    );
});

// Desktop version - full detail card
export const CountryListCardDesktop: React.FC<CountryListCardProps> = React.memo(({
    country,
    code,
    flagUrl,
    employmentCost,
    languages,
    currency,
    annualLeave,
    service,
    serviceSummary,
    region,
    updatedAt,
}) => {
    const [imgError, setImgError] = useState(false);
    const serviceLabel = service || serviceSummary?.[0]?.service || 'EOR/PEO Services';
    const encodedService = encodeURIComponent(slugify(serviceLabel));
    const encodedCountry = encodeURIComponent(country);
    const resolvedFlagUrl = getFlagUrl(country, flagUrl, code);
    const showFlag = resolvedFlagUrl && !imgError;

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return null;
        }
    };

    return (
        <Link to={`/insights?service=${encodedService}&country=${encodedCountry}`}>
            <motion.div
                whileHover={{ y: -4 }}
                className="group flex items-center gap-6 p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-red-500 hover:shadow-xl transition-all"
            >
                {/* Flag */}
                <div className="flex-shrink-0">
                    {showFlag ? (
                        <img
                            src={resolvedFlagUrl}
                            alt={`${country} flag`}
                            className="w-20 h-14 object-cover rounded-xl shadow-md border-2 border-gray-100 group-hover:border-red-300 transition-all"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-20 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                            <Flag className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-navy-900 text-lg group-hover:text-red-600 transition-colors">
                            {country}
                        </h4>
                        {region && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                                {region}
                            </span>
                        )}
                        <span className="text-xs text-white bg-red-600 px-2.5 py-1 rounded-full font-semibold">
                            {serviceLabel}
                        </span>
                    </div>

                    {/* Info Pills */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <Globe2 className="w-4 h-4 text-gray-400" />
                            {languages.slice(0, 3).join(', ')}{languages.length > 3 ? '...' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            {currency}
                        </span>
                        {annualLeave && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {annualLeave} leave
                            </span>
                        )}
                        {updatedAt && formatDate(updatedAt) && (
                            <span className="flex items-center gap-1.5 text-gray-400">
                                <Clock className="w-4 h-4" />
                                Updated {formatDate(updatedAt)}
                            </span>
                        )}
                    </div>

                    {/* Service Tags */}
                    {serviceSummary && serviceSummary.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {serviceSummary.slice(0, 4).map((s, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium"
                                >
                                    {s.service}
                                </span>
                            ))}
                            {serviceSummary.length > 4 && (
                                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">
                                    +{serviceSummary.length - 4} more
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-1">Employer Cost</div>
                        <div className="text-sm font-bold text-red-600">{employmentCost}</div>
                    </div>
                    {serviceSummary && serviceSummary.length > 0 && (
                        <div className="text-center px-4 py-2 bg-navy-50 rounded-xl">
                            <div className="text-xs text-gray-500 mb-1">Services</div>
                            <div className="text-sm font-bold text-navy-900">{serviceSummary.length}</div>
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <motion.div
                    whileHover={{ x: 4 }}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-all"
                >
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </motion.div>
            </motion.div>
        </Link>
    );
});

// Responsive wrapper that automatically selects the right variant
export const CountryListCard: React.FC<CountryListCardProps & { forceVariant?: 'mobile' | 'tablet' | 'desktop' }> = React.memo((props) => {
    const { forceVariant, ...cardProps } = props;

    if (forceVariant === 'mobile') {
        return <CountryListCardMobile {...cardProps} />;
    }
    if (forceVariant === 'tablet') {
        return <CountryListCardTablet {...cardProps} />;
    }
    if (forceVariant === 'desktop') {
        return <CountryListCardDesktop {...cardProps} />;
    }

    // Responsive rendering
    return (
        <>
            {/* Mobile: < 640px */}
            <div className="block sm:hidden">
                <CountryListCardMobile {...cardProps} />
            </div>
            {/* Tablet: 640px - 1024px */}
            <div className="hidden sm:block lg:hidden">
                <CountryListCardTablet {...cardProps} />
            </div>
            {/* Desktop: > 1024px */}
            <div className="hidden lg:block">
                <CountryListCardDesktop {...cardProps} />
            </div>
        </>
    );
});

export default CountryListCard;
