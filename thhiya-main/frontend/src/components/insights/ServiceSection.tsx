import React from 'react';
import { motion } from 'framer-motion';
import { CostBreakdownTable, TableData } from './CostBreakdownTable';
import { ServiceSteps, Step } from './ServiceSteps';
import { InsightsPanel, InsightItem } from './InsightsPanel';
import { GoodToKnowSection, GoodToKnowItem } from './GoodToKnowSection';
import { FileText, BarChart2, Lightbulb, Info, BookOpen, HelpCircle } from 'lucide-react';
import { FAQSection } from './FAQSection';

export interface SectionContent {
    table?: TableData;
    steps?: Step[];
    items?: InsightItem[] | GoodToKnowItem[];
    definitions?: Array<{ term: string; definition: string }>;
    faqs?: Array<{ question: string; answer: string }>;
    html?: string;
    markdown?: string;
}

export interface ServiceSectionData {
    id: string;
    type: 'cost_breakdown' | 'key_steps' | 'essentials' | 'insights' | 'good_to_know' | 'deductions' | 'faq' | 'custom';
    title: string;
    subtitle?: string;
    description?: string;
    order: number;
    content: SectionContent;
    styling?: {
        bgColor?: string;
        textColor?: string;
        borderColor?: string;
        icon?: string;
        iconColor?: string;
    };
}

interface ServiceSectionProps {
    section: ServiceSectionData;
    animationDelay?: number;
    className?: string;
}

// Section type to accent color mapping
const SECTION_ACCENTS: Record<string, { border: string; bg: string; gradient: string; icon: React.ReactNode }> = {
    cost_breakdown: {
        border: 'border-red-200',
        bg: 'bg-red-50/40',
        gradient: 'from-red-50 to-white',
        icon: <BarChart2 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-600" />
    },
    key_steps: {
        border: 'border-navy-200',
        bg: 'bg-navy-50/40',
        gradient: 'from-navy-50 to-white',
        icon: <FileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-navy-600" />
    },
    essentials: {
        border: 'border-gray-200',
        bg: 'bg-white',
        gradient: 'from-gray-50 to-white',
        icon: <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-600" />
    },
    insights: {
        border: 'border-navy-200',
        bg: 'bg-navy-50/40',
        gradient: 'from-navy-50 to-white',
        icon: <Lightbulb className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-navy-600" />
    },
    good_to_know: {
        border: 'border-red-200',
        bg: 'bg-red-50/40',
        gradient: 'from-red-50 to-white',
        icon: <Info className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-600" />
    },
    deductions: {
        border: 'border-navy-200',
        bg: 'bg-navy-50/40',
        gradient: 'from-navy-50 to-white',
        icon: <BarChart2 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-navy-600" />
    },
    custom: {
        border: 'border-gray-200',
        bg: 'bg-white',
        gradient: 'from-gray-50 to-white',
        icon: <FileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-600" />
    },
    faq: {
        border: 'border-navy-200',
        bg: 'bg-navy-50/40',
        gradient: 'from-navy-50 to-white',
        icon: <HelpCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-navy-600" />
    }
};

// Section type labels
const SECTION_LABELS: Record<string, string> = {
    cost_breakdown: 'Cost Breakdown',
    key_steps: 'Key Steps',
    essentials: 'Essentials',
    insights: 'Hidden Insights',
    good_to_know: 'Good to Know',
    deductions: 'Deductions',
    faq: 'FAQs',
    custom: 'Information'
};

const formatValue = (value: string | number): string =>
    typeof value === 'number' ? value.toLocaleString() : value;

/**
 * ServiceSection Component
 * 
 * A unified component that renders different section types
 * using specialized sub-components for each type.
 */
export const ServiceSection: React.FC<ServiceSectionProps> = ({
    section,
    animationDelay = 0,
    className = ''
}) => {
    // Route to specialized components for certain types
    if (section.type === 'cost_breakdown' && section.content?.table) {
        return (
            <CostBreakdownTable
                table={section.content.table}
                title={section.title}
                subtitle={section.subtitle}
                description={section.description}
                animationDelay={animationDelay}
                className={className}
            />
        );
    }

    if (section.type === 'key_steps' && section.content?.steps) {
        return (
            <ServiceSteps
                steps={section.content.steps}
                title={section.title}
                subtitle={section.subtitle}
                description={section.description}
                animationDelay={animationDelay}
                className={className}
            />
        );
    }

    if (section.type === 'insights' && section.content?.items) {
        return (
            <InsightsPanel
                items={section.content.items as InsightItem[]}
                title={section.title}
                subtitle={section.subtitle}
                description={section.description}
                animationDelay={animationDelay}
                className={className}
            />
        );
    }

    if (section.type === 'good_to_know' && section.content?.items) {
        return (
            <GoodToKnowSection
                items={section.content.items as GoodToKnowItem[]}
                title={section.title}
                subtitle={section.subtitle}
                description={section.description}
                animationDelay={animationDelay}
                className={className}
            />
        );
    }

    if (section.type === 'faq') {
        if (section.content?.faqs) {
            return (
                <FAQSection
                    faqs={section.content.faqs}
                    title={section.title}
                    subtitle={section.subtitle}
                />
            );
        }
        // Fallback for faq sections that have items (e.g. from expansion data)
        if (section.content?.items) {
            return (
                <GoodToKnowSection
                    items={section.content.items as GoodToKnowItem[]}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                    animationDelay={animationDelay}
                    className={className}
                />
            );
        }
    }

    if (section.content?.html || section.content?.markdown) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: animationDelay }}
                className={`rounded-lg xs:rounded-xl sm:rounded-2xl border-2 p-4 xs:p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow bg-white border-gray-100 ${className}`}
            >
                {/* Header for Markdown sections */}
                <div className="mb-4 border-b border-gray-100 pb-4">
                    <h3 className="text-xl xs:text-2xl font-bold text-navy-900">{section.title}</h3>
                    {section.subtitle && <p className="text-gray-500 mt-1">{section.subtitle}</p>}
                </div>
                <div
                    className="prose prose-sm sm:prose-base prose-red max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content.html || section.content.markdown || '' }}
                />
            </motion.div>
        );
    }

    const accent = SECTION_ACCENTS[section.type] || SECTION_ACCENTS.custom;

    // Generic section rendering for other types or fallback
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: animationDelay }}
            className={`rounded-lg xs:rounded-xl sm:rounded-2xl border-2 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br ${accent.gradient} ${accent.border} ${className}`}
        >
            {/* Header */}
            <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                    <div className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${accent.bg} ${accent.border}`}>
                        {accent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] xs:text-xs sm:text-sm font-semibold uppercase tracking-wide mb-0.5 xs:mb-1" style={{ color: 'inherit' }}>
                            {SECTION_LABELS[section.type] || section.type.replace('_', ' ')}
                        </p>
                        <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-navy-900 break-words">
                            {section.title}
                        </h3>
                        {section.subtitle && (
                            <p className="text-sm xs:text-base sm:text-lg text-gray-600 mt-0.5 xs:mt-1 break-words">{section.subtitle}</p>
                        )}
                        {section.description && (
                            <p className="text-xs xs:text-sm sm:text-base text-gray-600 mt-1 xs:mt-2 break-words">{section.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Content */}
            {section.content?.table && section.content.table.rows?.length > 0 && (
                <>
                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-2 xs:space-y-3 sm:space-y-4">
                        {section.content.table.rows.map((row, rowIndex) => (
                            <motion.div
                                key={rowIndex}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: rowIndex * 0.05 }}
                                className={`p-2.5 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border-2 ${row.highlight
                                    ? 'bg-gradient-to-r from-red-100 to-red-50 border-red-300'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    } transition-all`}
                            >
                                <h4 className="font-bold text-navy-900 mb-2 text-xs xs:text-sm sm:text-base break-words">{row.label || 'Item'}</h4>
                                <div className="space-y-1.5 xs:space-y-2">
                                    {(row.values || []).map((value, valueIndex) => (
                                        <div key={valueIndex} className="flex justify-between items-center gap-2 text-xs xs:text-sm py-1 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-500 font-medium">
                                                {section.content.table?.headers?.[valueIndex + 1] || 'Value'}
                                            </span>
                                            <span className="text-gray-900 font-semibold text-right">
                                                {formatValue(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8 px-4 sm:px-5 md:px-6 lg:px-8">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden rounded-xl md:rounded-2xl border-2 border-gray-200 shadow-sm">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-gradient-to-r from-navy-900 to-navy-800">
                                        <tr>
                                            {(section.content.table?.headers || []).map((header, index) => (
                                                <th
                                                    key={index}
                                                    className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-sm font-semibold text-white border-b border-navy-700 whitespace-nowrap"
                                                >
                                                    {header || 'Column'}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(section.content.table?.rows || []).map((row, rowIndex) => (
                                            <motion.tr
                                                key={rowIndex}
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: rowIndex * 0.03 }}
                                                className={`${row.highlight
                                                    ? 'bg-gradient-to-r from-red-100 to-red-50 font-semibold'
                                                    : rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    } border-b border-gray-100 last:border-0 hover:bg-red-50/50 transition-colors`}
                                            >
                                                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 font-semibold text-gray-900 align-middle min-w-[140px] md:min-w-[160px] text-[10px] sm:text-xs md:text-xs lg:text-sm">
                                                    {row.label || 'Item'}
                                                </td>
                                                {(row.values || []).map((value, valueIndex) => (
                                                    <td
                                                        key={valueIndex}
                                                        className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 text-gray-700 align-middle text-[10px] sm:text-xs md:text-xs lg:text-sm"
                                                    >
                                                        {formatValue(value)}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Steps Content */}
            {section.content?.steps && section.content.steps.length > 0 && (
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    {section.content.steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -15 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="flex gap-2 xs:gap-3 sm:gap-4 items-start group"
                        >
                            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center font-bold text-white text-xs xs:text-sm sm:text-base flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                {step.stepNumber ?? index + 1}
                            </div>
                            <div className="flex-1 min-w-0 bg-white rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 border border-gray-200 hover:border-navy-300 hover:shadow-sm transition-all">
                                <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-navy-600 uppercase tracking-wide mb-0.5 xs:mb-1">
                                    Step {step.stepNumber ?? index + 1}
                                </p>
                                <h4 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-navy-900 break-words mb-1">
                                    {step.title || 'Step'}
                                </h4>
                                <p className="text-xs xs:text-sm sm:text-base text-gray-600 break-words leading-relaxed">{step.description || ''}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Items Content */}
            {section.content?.items && section.content.items.length > 0 && (
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    {section.content.items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.06 }}
                            className={`border-l-4 p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-r-lg sm:rounded-r-xl transition-shadow hover:shadow-md ${item.type === 'info' ? 'border-navy-300 bg-gradient-to-r from-navy-100 to-navy-50' :
                                item.type === 'success' ? 'border-navy-300 bg-gradient-to-r from-navy-100 to-navy-50' :
                                    item.type === 'warning' ? 'border-red-300 bg-gradient-to-r from-red-100 to-red-50' :
                                        'border-navy-300 bg-gradient-to-r from-navy-100 to-navy-50'
                                }`}
                        >
                            {item.title && (
                                <h4 className="text-sm xs:text-base sm:text-lg font-bold text-navy-900 mb-1 break-words">
                                    {item.title}
                                </h4>
                            )}
                            <p className="text-xs xs:text-sm sm:text-base text-gray-700 break-words leading-relaxed">{item.text || ''}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Fallback */}
            {!section.content?.table && !section.content?.steps && !section.content?.items && (
                <div className="p-4 xs:p-6 sm:p-8 bg-gray-50 rounded-lg xs:rounded-xl text-center border border-gray-200">
                    <p className="text-gray-500 italic text-sm xs:text-base">Content coming soon...</p>
                </div>
            )}
        </motion.div>
    );
};

export default ServiceSection;
