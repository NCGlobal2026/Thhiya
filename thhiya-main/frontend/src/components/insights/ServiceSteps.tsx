import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Clipboard } from 'lucide-react';

export interface Step {
    stepNumber?: number;
    title: string;
    description: string;
    icon?: string;
}

interface ServiceStepsProps {
    steps: Step[];
    title?: string;
    subtitle?: string;
    description?: string;
    className?: string;
    animationDelay?: number;
    variant?: 'default' | 'compact' | 'timeline';
}

/**
 * ServiceSteps Component
 * 
 * Displays a list of numbered steps or essentials.
 * Supports multiple variants for different layouts.
 */
export const ServiceSteps: React.FC<ServiceStepsProps> = ({
    steps,
    title,
    subtitle,
    description,
    className = '',
    animationDelay = 0,
    variant = 'default'
}) => {
    if (!steps || steps.length === 0) {
        return null;
    }

    const renderDefaultVariant = () => (
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-2 xs:gap-3 sm:gap-4 items-start group"
                >
                    <div className="relative flex flex-col items-center">
                        <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center font-bold text-white text-xs xs:text-sm sm:text-base shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0 z-10">
                            {step.stepNumber ?? index + 1}
                        </div>
                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="w-0.5 h-full min-h-[2rem] bg-navy-200 absolute top-full mt-1" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pb-4 xs:pb-6">
                        <div className="flex items-center gap-2 mb-0.5 xs:mb-1">
                            <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-navy-600 uppercase tracking-wide bg-navy-100 px-2 py-0.5 rounded-full">
                                Step {step.stepNumber ?? index + 1}
                            </span>
                        </div>
                        <h4 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-navy-900 break-words mb-1 xs:mb-1.5 group-hover:text-navy-600 transition-colors">
                            {step.title || 'Step'}
                        </h4>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-600 break-words leading-relaxed">
                            {step.description || ''}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderCompactVariant = () => (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-2.5 xs:p-3 sm:p-4 hover:border-navy-400 hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5">
                        <span className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center text-white font-bold text-[10px] xs:text-xs sm:text-sm shadow-md">
                            {step.stepNumber ?? index + 1}
                        </span>
                        <h4 className="text-xs xs:text-sm sm:text-base font-bold text-navy-900 break-words line-clamp-2 flex-1">
                            {step.title}
                        </h4>
                    </div>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 break-words line-clamp-3 leading-relaxed">{step.description}</p>
                </motion.div>
            ))}
        </div>
    );

    const renderTimelineVariant = () => (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 xs:left-5 sm:left-6 top-0 bottom-0 w-0.5 xs:w-1 bg-gradient-to-b from-navy-600 via-navy-500 to-navy-400 rounded-full" />

            <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.12 }}
                        className="relative flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 group"
                    >
                        {/* Step number circle */}
                        <div className="relative z-10 w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center font-bold text-white text-xs xs:text-sm sm:text-base flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all ring-4 ring-white">
                            {step.stepNumber ?? index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-2 xs:pb-3 sm:pb-4 md:pb-6 bg-white rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 border border-gray-200 hover:border-navy-300 hover:shadow-md transition-all -mt-1">
                            <div className="flex items-center gap-2 mb-1 xs:mb-1.5 sm:mb-2">
                                <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 text-navy-500" />
                                <h4 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-navy-900 break-words group-hover:text-navy-600 transition-colors">
                                    {step.title}
                                </h4>
                            </div>
                            <p className="text-xs xs:text-sm sm:text-base text-gray-600 break-words leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderSteps = () => {
        switch (variant) {
            case 'compact':
                return renderCompactVariant();
            case 'timeline':
                return renderTimelineVariant();
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
            {(title || subtitle || description) && (
                <div className="mb-4 xs:mb-5 sm:mb-6">
                    <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-navy-600 to-navy-700 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Clipboard className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-navy-600 uppercase tracking-wide mb-0.5 xs:mb-1">
                                Key Steps
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
            )}

            {renderSteps()}

            {/* Completion indicator */}
            <div className="mt-4 xs:mt-5 sm:mt-6 flex items-center gap-2 xs:gap-2.5 p-2 xs:p-3 bg-navy-50 rounded-lg border border-navy-200">
                <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-navy-600 flex-shrink-0" />
                <p className="text-[10px] xs:text-xs sm:text-sm text-navy-700 font-medium">
                    Follow these steps for a smooth process. Our team is here to help at every stage.
                </p>
            </div>
        </motion.div>
    );
};

export default ServiceSteps;
