import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Globe, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CountryServiceSummary {
    _id?: string;
    country: string;
    countryCode: string;
    countrySlug?: string;
    region?: string;
    service: string;
    serviceSlug: string;
    heroData?: {
        title?: string;
        description?: string;
        bestFor?: string;
    };
    highlights?: string[];
    keyMetrics?: {
        label: string;
        value: string;
    }[];
    isActive?: boolean;
}

interface CountryServiceCardProps {
    data: CountryServiceSummary;
    variant?: 'default' | 'compact' | 'detailed';
    showFlag?: boolean;
    showRegion?: boolean;
    onClick?: () => void;
    linkTo?: string;
    className?: string;
    animationDelay?: number;
}

// Country code to flag emoji mapping
const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

// Region icons/colors mapping
const REGION_STYLES: Record<string, { bg: string; text: string }> = {
    'North America': { bg: 'bg-navy-100', text: 'text-navy-700' },
    'South America': { bg: 'bg-navy-100', text: 'text-navy-700' },
    'Europe': { bg: 'bg-navy-100', text: 'text-navy-700' },
    'Asia Pacific': { bg: 'bg-red-100', text: 'text-red-700' },
    'Middle East': { bg: 'bg-red-100', text: 'text-red-700' },
    'Central America': { bg: 'bg-navy-100', text: 'text-navy-700' },
    'Africa': { bg: 'bg-red-100', text: 'text-red-700' },
};

/**
 * CountryServiceCard Component
 * 
 * Displays a country-service summary with flag, key metrics, and highlights.
 * Used in service listing pages to show all countries offering a specific service.
 */
export const CountryServiceCard: React.FC<CountryServiceCardProps> = ({
    data,
    variant = 'default',
    showFlag = true,
    showRegion = true,
    onClick,
    linkTo,
    className = '',
    animationDelay = 0
}) => {
    const regionStyle = REGION_STYLES[data.region || ''] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    const flag = getFlagEmoji(data.countryCode);

    const renderCardContent = (cardClassName: string) => {
        const content = (
            <>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 xs:gap-3 mb-2.5 xs:mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 xs:gap-3">
                        {showFlag && (
                            <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl flex-shrink-0">{flag}</span>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-navy-900 group-hover:text-red-600 transition-colors break-words">
                                {data.country}
                            </h3>
                            {showRegion && data.region && (
                                <span className={`inline-flex items-center gap-1 text-[10px] xs:text-xs sm:text-sm ${regionStyle.text}`}>
                                    <MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                                    <span className="break-words">{data.region}</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
                </div>

                {/* Service Title */}
                <p className="text-xs xs:text-sm sm:text-base font-medium text-gray-700 mb-2 xs:mb-3 break-words">
                    {data.heroData?.title || data.service}
                </p>

                {/* Description */}
                {data.heroData?.description && (
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 xs:mb-3 break-words">
                        {data.heroData.description}
                    </p>
                )}

                {/* Key Metrics */}
                {data.keyMetrics && data.keyMetrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3 mb-2 xs:mb-3">
                        {data.keyMetrics.slice(0, 4).map((metric, index) => (
                            <div key={index} className="text-center p-1.5 xs:p-2 rounded-lg bg-gray-50">
                                <p className="text-[10px] xs:text-xs text-gray-500 break-words">{metric.label}</p>
                                <p className="text-xs xs:text-sm font-semibold text-navy-900 break-words">{metric.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Highlights */}
                {data.highlights && data.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
                        {data.highlights.slice(0, 3).map((highlight, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full bg-red-50 text-red-700"
                            >
                                {highlight}
                            </span>
                        ))}
                    </div>
                )}

                {/* Best For Badge */}
                {data.heroData?.bestFor && (
                    <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-gray-100">
                        <p className="text-[10px] xs:text-xs text-gray-500 break-words">
                            <span className="font-medium">Best for:</span> {data.heroData.bestFor}
                        </p>
                    </div>
                )}
            </>
        );

        if (linkTo) {
            return (
                <Link to={linkTo} onClick={onClick} className={cardClassName}>
                    {content}
                </Link>
            );
        }

        return (
            <div onClick={onClick} className={cardClassName}>
                {content}
            </div>
        );
    };

    const renderCompactContent = (cardClassName: string) => {
        const content = (
            <>
                {showFlag && (
                    <span className="text-lg xs:text-xl sm:text-2xl flex-shrink-0">{flag}</span>
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs xs:text-sm sm:text-base font-semibold text-navy-900 group-hover:text-red-600 transition-colors truncate">
                        {data.country}
                    </h4>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">
                        {data.heroData?.title || data.service}
                    </p>
                </div>
                {showRegion && data.region && (
                    <span className={`hidden xs:inline-flex items-center text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full ${regionStyle.bg} ${regionStyle.text}`}>
                        {data.region}
                    </span>
                )}
                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
            </>
        );

        if (linkTo) {
            return (
                <Link to={linkTo} onClick={onClick} className={cardClassName}>
                    {content}
                </Link>
            );
        }

        return (
            <div onClick={onClick} className={cardClassName}>
                {content}
            </div>
        );
    };

    const renderDetailedContent = (cardClassName: string) => {
        const content = (
            <>
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-3 xs:p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4">
                            {showFlag && (
                                <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl">{flag}</span>
                            )}
                            <div className="min-w-0">
                                <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">
                                    {data.country}
                                </h3>
                                {showRegion && data.region && (
                                    <span className="inline-flex items-center gap-1 xs:gap-1.5 text-xs xs:text-sm text-white/80 mt-0.5 xs:mt-1">
                                        <Globe className="w-3 h-3 xs:w-4 xs:h-4" />
                                        <span className="break-words">{data.region}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <Building2 className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white/30 flex-shrink-0" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 xs:p-4 sm:p-5 md:p-6">
                    <h4 className="text-base xs:text-lg sm:text-xl font-bold text-navy-900 mb-1.5 xs:mb-2 break-words">
                        {data.heroData?.title || data.service}
                    </h4>

                    {data.heroData?.description && (
                        <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-3 xs:mb-4 line-clamp-3 break-words">
                            {data.heroData.description}
                        </p>
                    )}

                    {/* Key Metrics Grid */}
                    {data.keyMetrics && data.keyMetrics.length > 0 && (
                        <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 mb-3 xs:mb-4">
                            {data.keyMetrics.map((metric, index) => (
                                <div key={index} className="text-center p-2 xs:p-3 rounded-lg xs:rounded-xl bg-gray-50">
                                    <p className="text-[10px] xs:text-xs text-gray-500 mb-0.5 xs:mb-1 break-words">{metric.label}</p>
                                    <p className="text-xs xs:text-sm sm:text-base font-bold text-navy-900 break-words">{metric.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Highlights */}
                    {data.highlights && data.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 xs:gap-2 mb-3 xs:mb-4">
                            {data.highlights.map((highlight, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center text-[10px] xs:text-xs sm:text-sm px-2 xs:px-3 py-1 xs:py-1.5 rounded-full bg-red-50 text-red-700"
                                >
                                    {highlight}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between pt-3 xs:pt-4 border-t border-gray-100 gap-2">
                        {data.heroData?.bestFor && (
                            <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 break-words">
                                <span className="font-medium">Best for:</span> {data.heroData.bestFor}
                            </p>
                        )}
                        <span className="inline-flex items-center gap-1 xs:gap-1.5 text-xs xs:text-sm font-semibold text-red-600 group-hover:gap-2 transition-all">
                            View Details
                            <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                        </span>
                    </div>
                </div>
            </>
        );

        const wrappedContent = linkTo ? (
            <Link to={linkTo} onClick={onClick} className={cardClassName}>
                {content}
            </Link>
        ) : (
            <div onClick={onClick} className={cardClassName}>
                {content}
            </div>
        );

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: animationDelay }}
            >
                {wrappedContent}
            </motion.div>
        );
    };

    switch (variant) {
        case 'compact':
            return renderCompactContent(
                `group flex items-center gap-2.5 xs:gap-3 sm:gap-4 cursor-pointer rounded-lg sm:rounded-xl border border-gray-200 bg-white p-2.5 xs:p-3 sm:p-4 hover:border-red-300 hover:shadow-md transition-all duration-300 w-full min-w-0 ${className}`
            );
        case 'detailed':
            return renderDetailedContent(
                `group block cursor-pointer rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-200 bg-white overflow-hidden hover:border-red-300 hover:shadow-2xl transition-all duration-300 w-full min-w-0 ${className}`
            );
        default:
            return renderCardContent(
                `group block cursor-pointer rounded-lg xs:rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 xs:p-4 sm:p-5 md:p-6 hover:border-red-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full min-w-0 ${className}`
            );
    }
};

export default CountryServiceCard;
