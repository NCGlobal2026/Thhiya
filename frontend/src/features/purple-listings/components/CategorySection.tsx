import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { CategoryWithCount } from '../types/category.types';
import { Company } from '../types/company.types';
import { CompanyCard } from './CompanyCard';
import { ArrowRight } from 'lucide-react';

interface CategorySectionProps {
    category: CategoryWithCount;
    companies: Company[];
    limit?: number;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
    category,
    companies,
    limit = 6
}) => {
    const Icon = Icons[category.icon as keyof typeof Icons] as React.ElementType || Icons.Folder;
    const displayCompanies = companies.slice(0, limit);
    const hasMore = companies.length > limit;

    return (
        <section className="mb-16">
            {/* Category Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-navy-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
                            {category.name}
                        </h2>
                        <p className="text-gray-600 max-w-3xl">
                            {category.description}
                        </p>
                    </div>
                </div>

                {/* See All Link - Desktop */}
                {hasMore && (
                    <Link
                        to={`/purple-listings/c/${category.slug}`}
                        className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        See all {category.companyCount} companies
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>

            {/* Company Grid */}
            {displayCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayCompanies.map(company => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No companies available in this category yet.</p>
                </div>
            )}

            {/* See All Link - Mobile */}
            {hasMore && (
                <div className="mt-6 md:hidden text-center">
                    <Link
                        to={`/purple-listings/c/${category.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        See all {category.companyCount} companies
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </section>
    );
};
