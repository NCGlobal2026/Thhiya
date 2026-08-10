import React from 'react';
import { Company } from '../types/company.types';
import { CompanyCard } from './CompanyCard';

interface CompanyGridProps {
    companies: Company[];
    emptyMessage?: string;
}

export const CompanyGrid: React.FC<CompanyGridProps> = ({
    companies,
    emptyMessage = "No companies found. Try adjusting your filters or search query."
}) => {
    if (companies.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500 max-w-md mx-auto">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {companies.map(company => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );
};
