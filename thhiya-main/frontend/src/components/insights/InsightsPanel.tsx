import React from 'react';
import { motion } from 'framer-motion';
import {
    Lightbulb,
    AlertTriangle,
    CheckCircle2,
    Info,
    Sparkles,
    Eye,
    Zap
} from 'lucide-react';

export interface InsightItem {
    title?: string;
    text: string;
    icon?: string;
    type?: 'info' | 'warning' | 'success' | 'tip';
}

interface InsightsPanelProps {
    items: InsightItem[];
    title?: string;
    subtitle?: string;
    description?: string;
    className?: string;
    animationDelay?: number;
    variant?: 'default' | 'cards' | 'list';
}

const ITEM_TONES: Record<string, { border: string; bg: string; gradient: string }> = {
    info: { border: 'border-navy-300', bg: 'bg-navy-50', gradient: 'from-navy-100 to-navy-50' },
    success: { border: 'border-navy-300', bg: 'bg-navy-50', gradient: 'from-navy-100 to-navy-50' },
    warning: { border: 'border-red-300', bg: 'bg-red-50', gradient: 'from-red-100 to-red-50' },
    tip: { border: 'border-navy-300', bg: 'bg-navy-50', gradient: 'from-navy-100 to-navy-50' }
};

const ITEM_ICONS: Record<string, React.ReactNode> = {
    info: <Info className="w-4 h-4 xs:w-5 xs:h-5 text-navy-600" />,
    success: <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-navy-600" />,
    warning: <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 text-red-600" />,
    tip: <Lightbulb className="w-4 h-4 xs:w-5 xs:h-5 text-navy-600" />
};

/**
 * InsightsPanel Component
 * 
 * Displays hidden insights, tips, and important information.
 * Supports multiple visual variants and item types.
 */
export const InsightsPanel: React.FC<InsightsPanelProps> = ({
    items,
    title = 'Hidden Insights',
    subtitle,
    description,
    className = '',
    animationDelay = 0,
    variant = 'default'
}) => {
    if (!items || items.length === 0) {
        return null;
    }

    const getStyles = (type: string = 'tip') => ITEM_TONES[type] || ITEM_TONES.tip;

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
                            <div className={`flex-shrink-0 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full ${styles.bg} border ${styles.border} flex items-center justify-center mt-0.5 shadow-sm`}>
                                {ITEM_ICONS[item.type || 'tip'] || (
                                    <Lightbulb className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-navy-600" />
                                )}
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

    const renderCardsVariant = () => (
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
                        className={`rounded-lg sm:rounded-xl border-2 p-3 xs:p-4 sm:p-5 ${styles.border} bg-gradient-to-br ${styles.gradient} hover:shadow-lg transition-all`}
                    >
                        <div className="flex items-start gap-2 xs:gap-3">
                            <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-full ${styles.bg} border ${styles.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                {ITEM_ICONS[item.type || 'tip']}
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

    const renderListVariant = () => (
        <ul className="space-y-2 xs:space-y-2.5 sm:space-y-3">
            {items.map((item, index) => (
                <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 p-2 xs:p-2.5 sm:p-3 bg-white rounded-lg border border-navy-200 hover:border-navy-400 hover:shadow-sm transition-all"
                >
                    <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 text-navy-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        {item.title && (
                            <span className="font-bold text-navy-900 text-xs xs:text-sm sm:text-base">{item.title}: </span>
                        )}
                        <span className="text-xs xs:text-sm sm:text-base text-gray-700">{item.text}</span>
                    </div>
                </motion.li>
            ))}
        </ul>
    );

    const renderItems = () => {
        switch (variant) {
            case 'cards':
                return renderCardsVariant();
            case 'list':
                return renderListVariant();
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
            className={`rounded-lg xs:rounded-xl sm:rounded-2xl border-2 border-navy-200 bg-gradient-to-br from-navy-50/80 to-white p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow w-full min-w-0 ${className}`}
        >
            {/* Header Section */}
            <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                    <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-navy-500 to-navy-600 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Eye className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-navy-600 uppercase tracking-wide mb-0.5 xs:mb-1">
                            Hidden Insights
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

            {/* Pro tip footer */}
            <div className="mt-3 xs:mt-4 sm:mt-5 flex items-center gap-2 xs:gap-2.5 p-2 xs:p-3 bg-navy-100/50 rounded-lg border border-navy-200">
                <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-navy-600 flex-shrink-0" />
                <p className="text-[10px] xs:text-xs sm:text-sm text-navy-700 font-medium">
                    Pro tip: These insights help you avoid common pitfalls and optimize your strategy.
                </p>
            </div>
        </motion.div>
    );
};

export default InsightsPanel;
