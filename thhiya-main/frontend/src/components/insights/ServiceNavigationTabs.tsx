import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface ServiceTabItem {
    slug: string;
    name: string;
    icon?: React.ReactNode;
    badge?: string;
}

interface ServiceNavigationTabsProps {
    services: ServiceTabItem[];
    activeService?: string;
    onServiceChange: (serviceSlug: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    className?: string;
    showScrollButtons?: boolean;
}

/**
 * ServiceNavigationTabs Component
 * 
 * Horizontal navigation tabs for switching between services.
 * Supports scroll overflow with navigation buttons.
 */
export const ServiceNavigationTabs: React.FC<ServiceNavigationTabsProps> = ({
    services,
    activeService,
    onServiceChange,
    variant = 'default',
    className = '',
    showScrollButtons = true
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Check scroll state
    const updateScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    useEffect(() => {
        updateScrollButtons();
        window.addEventListener('resize', updateScrollButtons);
        return () => window.removeEventListener('resize', updateScrollButtons);
    }, [services]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 200;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
        setTimeout(updateScrollButtons, 300);
    };

    const getTabStyles = (isActive: boolean) => {
        const baseStyles = 'flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 text-xs xs:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0';

        switch (variant) {
            case 'pills':
                return `${baseStyles} rounded-full ${isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`;
            case 'underline':
                return `${baseStyles} border-b-2 ${isActive
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`;
            default:
                return `${baseStyles} rounded-lg ${isActive
                    ? 'bg-red-600/10 text-red-600 border border-red-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50/50'
                    }`;
        }
    };

    const getContainerStyles = () => {
        switch (variant) {
            case 'underline':
                return 'border-b border-gray-200';
            default:
                return '';
        }
    };

    if (!services || services.length === 0) {
        return null;
    }

    return (
        <div className={`relative w-full min-w-0 ${className}`}>
            {/* Scroll Left Button */}
            {showScrollButtons && canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </button>
            )}

            {/* Tabs Container */}
            <div
                ref={scrollContainerRef}
                onScroll={updateScrollButtons}
                className={`flex gap-1.5 xs:gap-2 sm:gap-3 overflow-x-auto scrollbar-hide ${getContainerStyles()} ${showScrollButtons ? 'px-6 xs:px-8 sm:px-10' : ''
                    }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {services.map((service, index) => (
                    <motion.button
                        key={`${service.slug}-${index}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => onServiceChange(service.slug)}
                        className={getTabStyles(activeService === service.slug)}
                    >
                        {service.icon || <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />}
                        <span className="truncate max-w-[100px] xs:max-w-[120px] sm:max-w-none">{service.name}</span>
                        {service.badge && (
                            <span className="ml-0.5 xs:ml-1 px-1 xs:px-1.5 py-0.5 text-[10px] xs:text-xs rounded-full bg-gray-200 text-gray-600">
                                {service.badge}
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Scroll Right Button */}
            {showScrollButtons && canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </button>
            )}

            {/* Gradient Fade Effects */}
            {showScrollButtons && (
                <>
                    {canScrollLeft && (
                        <div className="absolute left-6 xs:left-8 sm:left-10 top-0 bottom-0 w-6 xs:w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                    )}
                    {canScrollRight && (
                        <div className="absolute right-6 xs:right-8 sm:right-10 top-0 bottom-0 w-6 xs:w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                    )}
                </>
            )}
        </div>
    );
};

/**
 * Vertical Service Navigation for sidebar use
 */
interface ServiceNavigationListProps {
    services: ServiceTabItem[];
    activeService?: string;
    onServiceChange: (serviceSlug: string) => void;
    className?: string;
}

export const ServiceNavigationList: React.FC<ServiceNavigationListProps> = ({
    services,
    activeService,
    onServiceChange,
    className = ''
}) => {
    if (!services || services.length === 0) {
        return null;
    }

    return (
        <nav className={`space-y-1 w-full ${className}`}>
            {services.map((service, index) => {
                const isActive = activeService === service.slug;
                return (
                    <motion.button
                        key={`${service.slug}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        onClick={() => onServiceChange(service.slug)}
                        className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg text-left transition-all duration-200 ${isActive
                            ? 'bg-red-600/10 text-red-600 border-l-4 border-red-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                            }`}
                    >
                        {service.icon || <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0" />}
                        <span className="text-xs xs:text-sm font-medium truncate">{service.name}</span>
                        {service.badge && (
                            <span className="ml-auto px-1.5 xs:px-2 py-0.5 text-[10px] xs:text-xs rounded-full bg-gray-100 text-gray-600">
                                {service.badge}
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </nav>
    );
};

export default ServiceNavigationTabs;
