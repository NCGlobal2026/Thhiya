import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { CategoryWithCount } from '../types/category.types';
import { cn } from '../../../utils/cn';

interface CategorySidebarProps {
    categories: CategoryWithCount[];
    selectedCategory?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categories,
    selectedCategory
}) => {
    const location = useLocation();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-navy-50 to-red-50">
                <h2 className="text-lg font-bold text-navy-900">
                    Most Popular Software Categories
                </h2>
            </div>

            <nav className="p-4">
                <ul className="space-y-1">
                    {/* All Categories Option */}
                    <li>
                        <Link
                            to="/purple-listings"
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                                !selectedCategory
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icons.Grid3x3 className="w-5 h-5" />
                                <span className="font-medium">All Categories</span>
                            </div>
                            <span className={cn(
                                "text-sm font-semibold px-2 py-0.5 rounded",
                                !selectedCategory ? "bg-white/20" : "bg-gray-100 text-gray-600"
                            )}>
                                {categories.reduce((sum, cat) => sum + cat.companyCount, 0)}
                            </span>
                        </Link>
                    </li>

                    {/* Individual Categories */}
                    {categories.map((category) => {
                        const Icon = Icons[category.icon as keyof typeof Icons] as React.ElementType || Icons.Folder;
                        const isActive = selectedCategory === category.slug;

                        return (
                            <li key={category.id}>
                                <Link
                                    to={`/purple-listings/c/${category.slug}`}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-red-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Icon className={cn(
                                            "w-5 h-5 flex-shrink-0",
                                            isActive ? "text-white" : "text-gray-400 group-hover:text-red-600"
                                        )} />
                                        <span className="font-medium truncate">{category.name}</span>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-semibold px-2 py-0.5 rounded flex-shrink-0 ml-2",
                                        isActive ? "bg-white/20" : "bg-gray-100 text-gray-600 group-hover:bg-red-50"
                                    )}>
                                        {category.companyCount}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer CTA */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                    Can't find what you're looking for?
                </p>
                <Link
                    to="/contact"
                    className="block w-full px-4 py-2 text-center bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors font-medium text-sm"
                >
                    Request a Category
                </Link>
            </div>
        </div>
    );
};
