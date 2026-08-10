import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Info } from 'lucide-react';

export interface TableRow {
    label: string;
    values: (string | number)[];
    highlight?: boolean;
}

export interface TableData {
    headers: string[];
    rows: TableRow[];
}

interface CostBreakdownTableProps {
    table: TableData;
    title?: string;
    subtitle?: string;
    description?: string;
    className?: string;
    animationDelay?: number;
}

const formatValue = (value: string | number): string =>
    typeof value === 'number' ? value.toLocaleString() : value;

/**
 * CostBreakdownTable Component
 * 
 * Displays cost breakdown data in a responsive table format.
 * Shows as cards on mobile and as a table on desktop.
 */
export const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({
    table,
    title,
    subtitle,
    description,
    className = '',
    animationDelay = 0
}) => {
    if (!table || !table.rows || table.rows.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: animationDelay }}
            className={`relative w-full min-w-0 ${className}`}
        >
            {/* Folder Tab */}
            <div className="absolute -top-3 xs:-top-3.5 sm:-top-4 left-4 xs:left-5 sm:left-6 z-10">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 xs:px-4 sm:px-5 py-1 xs:py-1.5 sm:py-2 rounded-t-lg xs:rounded-t-xl text-[10px] xs:text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1.5 xs:gap-2">
                    <DollarSign className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                    Cost Breakdown
                </div>
            </div>
            {/* Main Folder Body */}
            <div className="pt-2 xs:pt-2.5 sm:pt-3">
                <div className="rounded-lg xs:rounded-xl sm:rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50/90 via-white to-red-50/50 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
            {/* Header Section */}
            {(title || subtitle || description) && (
                <div className="mb-4 xs:mb-5 sm:mb-6">
                    <div className="flex-1 min-w-0">
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
            )}

            {/* Mobile Card View - optimized for all screen sizes */}
            <div className="block md:hidden space-y-2 xs:space-y-3 sm:space-y-4">
                {table.rows.map((row, rowIndex) => (
                    <motion.div
                        key={rowIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: rowIndex * 0.05 }}
                        className={`p-2.5 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border-2 transition-all ${row.highlight
                            ? 'bg-gradient-to-r from-red-100 to-red-50 border-red-300 shadow-md'
                            : 'bg-white border-gray-200 hover:border-red-200 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-2 xs:gap-2.5 mb-2 xs:mb-3">
                            {row.highlight && (
                                <TrendingUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-red-600 flex-shrink-0" />
                            )}
                            <h4 className="font-bold text-navy-900 text-xs xs:text-sm sm:text-base break-words flex-1">
                                {row.label || 'Item'}
                            </h4>
                        </div>
                        <div className="space-y-1.5 xs:space-y-2">
                            {(row.values || []).map((value, valueIndex) => (
                                <div key={valueIndex} className="flex justify-between items-center gap-2 py-1 xs:py-1.5 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-500 text-[10px] xs:text-xs sm:text-sm font-medium break-words flex-1">
                                        {table.headers?.[valueIndex + 1] || 'Value'}
                                    </span>
                                    <span className={`font-semibold text-right text-xs xs:text-sm sm:text-base break-words ${row.highlight ? 'text-red-700' : 'text-navy-900'}`}>
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
                                    {(table.headers || []).map((header, index) => (
                                        <th
                                            key={index}
                                            className={`px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-sm font-semibold text-white border-b border-navy-700 whitespace-nowrap ${index === 0 ? 'min-w-[160px]' : ''}`}
                                        >
                                            {header || 'Column'}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row, rowIndex) => (
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
                                        <td className={`px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 font-semibold align-middle min-w-[140px] md:min-w-[160px] text-[10px] sm:text-xs md:text-xs lg:text-sm ${row.highlight ? 'text-red-700' : 'text-gray-900'}`}>
                                            <div className="flex items-center gap-1.5">
                                                {row.highlight && <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-red-600 flex-shrink-0" />}
                                                <span>{row.label || 'Item'}</span>
                                            </div>
                                        </td>
                                        {(row.values || []).map((value, valueIndex) => (
                                            <td
                                                key={valueIndex}
                                                className={`px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 align-middle text-[10px] sm:text-xs md:text-xs lg:text-sm ${row.highlight ? 'text-red-700 font-semibold' : 'text-gray-700'}`}
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

            {/* Info Footer */}
            <div className="mt-3 xs:mt-4 sm:mt-5 flex items-start gap-2 xs:gap-2.5 p-2 xs:p-3 bg-red-50/50 rounded-lg border border-red-200">
                <Info className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] xs:text-xs sm:text-sm text-red-600/80">
                    Costs may vary based on specific circumstances and are subject to change. Contact us for a personalized quote.
                </p>
            </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CostBreakdownTable;
