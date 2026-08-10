import React from 'react';
import { motion } from 'framer-motion';
import {
    Info,
    AlertCircle,
    BookOpen,
    MessageCircle,
    HelpCircle,
    CheckCircle2
} from 'lucide-react';

export interface GoodToKnowItem {
    title?: string;
    text: string;
    icon?: string;
    type?: 'info' | 'warning' | 'success' | 'tip';
}

interface GoodToKnowSectionProps {
    items: GoodToKnowItem[];
    title?: string;
    subtitle?: string;
    description?: string;
    className?: string;
    animationDelay?: number;
    variant?: 'default' | 'callout' | 'banner';
}

const ITEM_STYLES: Record<string, { border: string; bg: string; text: string; iconBg: string; gradient: string }> = {
    info: {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-700',
        iconBg: 'bg-red-100',
        gradient: 'from-red-100 to-red-50'
    },
    warning: {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-700',
        iconBg: 'bg-red-100',
        gradient: 'from-red-100 to-red-50'
    },
    success: {
        border: 'border-navy-300',
        bg: 'bg-navy-50',
        text: 'text-navy-700',
        iconBg: 'bg-navy-100',
        gradient: 'from-navy-100 to-navy-50'
    },
    tip: {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-700',
        iconBg: 'bg-red-100',
        gradient: 'from-red-100 to-red-50'
    }
};

/**
 * GoodToKnowSection Component
 * 
 * Displays tips and additional helpful information.
 * Great for FAQ-style or "did you know" content.
 */
export const GoodToKnowSection: React.FC<GoodToKnowSectionProps> = ({
    items,
    title = 'Good to Know',
    subtitle,
    description,
    className = '',
    animationDelay = 0,
    variant = 'default'
}) => {
    if (!items || items.length === 0) {
        return null;
    }

    const getStyles = (type: string = 'info') => {
        return ITEM_STYLES[type] || ITEM_STYLES.info;
    };

    const renderDefaultVariant = () => (
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            {items.map((item, index) => {
                const styles = getStyles(item.type);
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08 }}
                        className={`border-l-4 p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-r-lg sm:rounded-r-xl ${styles.border} bg-gradient-to-r ${styles.gradient} hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                            <div className={`flex-shrink-0 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full ${styles.iconBg} border ${styles.border} flex items-center justify-center mt-0.5 shadow-sm`}>
                                <Info className={`w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ${styles.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                {item.title && (
                                    <h4 className="text-sm xs:text-base sm:text-lg font-bold text-navy-900 mb-0.5 xs:mb-1 break-words">
                                        {item.title}
                                    </h4>
                                )}
                                <p className="text-xs xs:text-sm sm:text-base text-gray-700 break-words leading-relaxed">{item.text || ''}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderCalloutVariant = () => (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
            {items.map((item, index) => {
                const styles = getStyles(item.type);
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ y: -4 }}
                        className={`rounded-lg sm:rounded-xl border-2 ${styles.border} bg-gradient-to-br ${styles.gradient} p-3 xs:p-4 sm:p-5 hover:shadow-lg transition-all`}
                    >
                        <div className="flex items-start gap-2 xs:gap-3">
                            <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-full ${styles.iconBg} border ${styles.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <AlertCircle className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 ${styles.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                {item.title && (
                                    <h4 className="text-xs xs:text-sm sm:text-base font-bold text-navy-900 mb-0.5 xs:mb-1 break-words">
                                        {item.title}
                                    </h4>
                                )}
                                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-700 break-words leading-relaxed">{item.text}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderBannerVariant = () => (
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            {items.map((item, index) => {
                const styles = getStyles(item.type);
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08 }}
                        className={`rounded-lg sm:rounded-xl border-2 ${styles.border} bg-gradient-to-r ${styles.gradient} p-3 xs:p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow`}
                    >
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2.5 xs:gap-3 sm:gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl ${styles.iconBg} border ${styles.border} flex items-center justify-center shadow-sm`}>
                                <MessageCircle className={`w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 ${styles.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                {item.title && (
                                    <h4 className="text-sm xs:text-base sm:text-lg font-bold text-navy-900 mb-0.5 xs:mb-1 break-words">
                                        {item.title}
                                    </h4>
                                )}
                                <p className="text-xs xs:text-sm sm:text-base text-gray-700 break-words leading-relaxed">{item.text}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderItems = () => {
        switch (variant) {
            case 'callout':
                return renderCalloutVariant();
            case 'banner':
                return renderBannerVariant();
            default:
                return renderDefaultVariant();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: animationDelay }}
            className={`rounded-lg xs:rounded-xl sm:rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50/80 to-white p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow w-full min-w-0 ${className}`}
        >
            {/* Header Section */}
            <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                    <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-red-700 uppercase tracking-wide mb-0.5 xs:mb-1">
                            Good to Know
                        </p>
                        {title && (
                            <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-navy-900 break-words">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm xs:text-base sm:text-lg text-gray-600 mt-0.5 xs:mt-1 break-words">{subtitle}</p>
                        )}
                        {description && (
                            <p className="text-xs xs:text-sm sm:text-base text-gray-600 mt-1 xs:mt-2 break-words">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            {renderItems()}

            {/* Help footer */}
            <div className="mt-3 xs:mt-4 sm:mt-5 flex items-center gap-2 xs:gap-2.5 p-2 xs:p-3 bg-red-100/50 rounded-lg border border-red-200">
                <HelpCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-red-600 flex-shrink-0" />
                <p className="text-[10px] xs:text-xs sm:text-sm text-red-700 font-medium">
                    Have questions? Our team is available to provide personalized guidance.
                </p>
            </div>
        </motion.div>
    );
};

export default GoodToKnowSection;
