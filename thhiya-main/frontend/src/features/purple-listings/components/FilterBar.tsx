import React from 'react';
import { Search, Filter } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                        placeholder="Search for software..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mr-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>

                    <button
                        onClick={() => onCategoryChange('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === ''
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All Categories
                    </button>

                    {CATEGORIES.map((category) => (
                        <button
                            key={category.slug}
                            onClick={() => onCategoryChange(category.slug)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.slug
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
