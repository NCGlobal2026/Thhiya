import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Filter, ChevronDown, ChevronRight, Briefcase, Globe, ArrowUpDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useRegions } from '../../../services/hooks';
import { Category } from '../../../features/purple-listings/types/category.types';

interface FilterSidebarProps {
    selectedCountries: string[];
    onCountryChange: (country: string) => void;
    onSetSelectedCountries?: (countries: string[]) => void;
    availableCountries: string[];
    selectedService: string;
    onServiceChange: (service: string) => void;
    availableServices: Category[];
    selectedLanguage: string;
    onLanguageChange: (lang: string) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    selectedCountries,
    onCountryChange,
    onSetSelectedCountries,
    availableCountries,
    selectedService,
    onServiceChange,
    availableServices,
    selectedLanguage,
    onLanguageChange,
    sortBy,
    onSortChange,
}) => {
    const [countrySearch, setCountrySearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});

    const { data: regions } = useRegions();

    const filteredCountries = availableCountries.filter(c =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
    );

    // Grouping Logic
    const countryToRegionMap = new Map<string, string>();
    regions?.forEach(r => {
        r.countries.forEach(c => countryToRegionMap.set(c.name, r.region));
    });

    const groupedCountries: Record<string, string[]> = {
        'Other': []
    };

    regions?.forEach(r => {
        groupedCountries[r.region.toUpperCase()] = [];
    });

    filteredCountries.forEach(c => {
        const region = countryToRegionMap.get(c);
        if (region) {
            const key = region.toUpperCase();
            if (!groupedCountries[key]) groupedCountries[key] = [];
            groupedCountries[key].push(c);
        } else {
            groupedCountries['Other'].push(c);
        }
    });

    // Remove empty groups
    Object.keys(groupedCountries).forEach(k => {
        if (groupedCountries[k].length === 0) delete groupedCountries[k];
    });

    const isRegionFullySelected = (regionKey: string) => {
        const regionCountries = groupedCountries[regionKey] || [];
        if (regionCountries.length === 0) return false;
        return regionCountries.every(c => selectedCountries.includes(c));
    };

    const isRegionPartiallySelected = (regionKey: string) => {
        const regionCountries = groupedCountries[regionKey] || [];
        if (regionCountries.length === 0) return false;
        const selectedCount = regionCountries.filter(c => selectedCountries.includes(c)).length;
        return selectedCount > 0 && selectedCount < regionCountries.length;
    };

    const isAllSelected = filteredCountries.length > 0 && filteredCountries.every(c => selectedCountries.includes(c));

    const handleSelectAll = (isChecked: boolean) => {
        if (!onSetSelectedCountries) return;
        if (isChecked) {
            const newSelection = new Set([...selectedCountries, ...filteredCountries]);
            onSetSelectedCountries(Array.from(newSelection));
        } else {
            const newSelection = selectedCountries.filter(c => !filteredCountries.includes(c));
            onSetSelectedCountries(newSelection);
        }
    };

    const handleCheckRegion = (regionKey: string, isChecked: boolean) => {
        if (!onSetSelectedCountries) return;
        const regionCountries = groupedCountries[regionKey] || [];
        if (isChecked) {
            const newSelection = new Set([...selectedCountries, ...regionCountries]);
            onSetSelectedCountries(Array.from(newSelection));
        } else {
            const newSelection = selectedCountries.filter(c => !regionCountries.includes(c));
            onSetSelectedCountries(newSelection);
        }
    };

    const handleToggleRegion = (regionKey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedRegions(prev => ({ ...prev, [regionKey]: !prev[regionKey] }));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24">
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between lg:hidden bg-gray-50 border-b border-gray-200 rounded-t-xl"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-navy-600" />
                    <span className="font-bold text-navy-900">Filters</span>
                    {(selectedCountries.length > 0) && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                            {selectedCountries.length}
                        </span>
                    )}
                </div>
                <div className={cn("transition-transform", isOpen ? "rotate-180" : "")}>▼</div>
            </button>

            {/* Desktop Header */}
            <div className="hidden lg:flex p-4 border-b border-gray-200 bg-gray-50 items-center gap-2">
                <Filter className="w-4 h-4 text-navy-600" />
                <h2 className="font-bold text-navy-900">Filters</h2>
            </div>

            {/* Content */}
            <div className={cn(
                "p-5 space-y-8 lg:block",
                isOpen ? "block" : "hidden"
            )}>
                {/* Country Filter */}
                <div>
                    <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Supported Countries
                    </h3>

                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>

                    <div className="space-y-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {/* Select All */}
                        {filteredCountries.length > 0 && onSetSelectedCountries && (
                            <div className="mb-2 pb-2 border-b border-gray-100">
                                <label className="flex items-center gap-2 cursor-pointer group p-1.5 hover:bg-gray-50 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-navy-900">
                                        Select All
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Grouped Continents */}
                        {Object.keys(groupedCountries).sort().map(regionKey => (
                            <div key={regionKey} className="mb-1 border-b border-gray-50 pb-1">
                                <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-md transition-colors">
                                    <label className="flex items-center gap-2 cursor-pointer group flex-1">
                                        <input
                                            type="checkbox"
                                            checked={isRegionFullySelected(regionKey)}
                                            ref={input => {
                                                if (input) {
                                                    input.indeterminate = !isRegionFullySelected(regionKey) && isRegionPartiallySelected(regionKey);
                                                }
                                            }}
                                            onChange={(e) => handleCheckRegion(regionKey, e.target.checked)}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-navy-900 tracking-wide">
                                            {regionKey}
                                        </span>
                                    </label>
                                    <button 
                                        onClick={(e) => handleToggleRegion(regionKey, e)}
                                        className="p-1 hover:bg-gray-200 rounded-md text-gray-500"
                                    >
                                        {expandedRegions[regionKey] ? (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                                
                                {expandedRegions[regionKey] && (
                                    <div className="pl-6 pr-1 py-1 space-y-1">
                                        {groupedCountries[regionKey].map(country => (
                                            <label key={country} className="flex items-center gap-2 cursor-pointer group p-1 hover:bg-gray-50 rounded-md">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCountries.includes(country)}
                                                    onChange={() => onCountryChange(country)}
                                                    className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                                />
                                                <span className={cn(
                                                    "text-sm transition-colors",
                                                    selectedCountries.includes(country) ? "text-navy-900 font-medium" : "text-gray-600 group-hover:text-navy-900"
                                                )}>
                                                    {country}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {filteredCountries.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">No countries found</p>
                        )}
                    </div>
                </div>

                {/* Additional Settings Divider */}
                <hr className="border-gray-200" />

                {/* Sidebar Filters: Service, Language, Sort */}
                <div className="space-y-5">
                    {/* Service (Checkbox List) */}
                    <div>
                        <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            Services
                        </h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {availableServices.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => onServiceChange(cat.slug)}
                                    className={cn(
                                        "w-full flex items-center gap-2 p-1.5 rounded-md transition-colors text-left",
                                        selectedService === cat.slug 
                                            ? "bg-red-50 text-red-600 font-medium" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-navy-900"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                        selectedService === cat.slug 
                                            ? "border-red-500 bg-red-500 text-white" 
                                            : "border-gray-300 bg-white"
                                    )}>
                                        {selectedService === cat.slug && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                    <span className="text-sm">
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language (Expanded List) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            Language
                        </label>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">                            {[
                                { value: "", label: "All Languages" },
                                { value: "en", label: "English" },
                                { value: "hi", label: "Hindi" },
                                { value: "es", label: "Spanish" },
                                { value: "fr", label: "French" },
                                { value: "de", label: "German" },
                                { value: "it", label: "Italian" },
                                { value: "pt", label: "Portuguese" },
                                { value: "ar", label: "Arabic" },
                                { value: "zh", label: "Mandarin" },
                                { value: "ja", label: "Japanese" },
                                { value: "ko", label: "Korean" },
                                { value: "ru", label: "Russian" },
                                { value: "nl", label: "Dutch" },
                                { value: "tr", label: "Turkish" },
                                { value: "vi", label: "Vietnamese" },
                                { value: "th", label: "Thai" },
                            ].map(lang => (
                                <label key={lang.value} className="flex items-center gap-2 cursor-pointer group p-1.5 hover:bg-gray-50 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedLanguage === lang.value}
                                        onChange={() => onLanguageChange(lang.value)}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                    />
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        selectedLanguage === lang.value ? "text-navy-900 font-medium" : "text-gray-600 group-hover:text-navy-900"
                                    )}>
                                        {lang.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sort (Expanded List) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            Sort By
                        </label>
                        <div className="space-y-1">
                            {[
                                { value: "name", label: "Name (A-Z)" },
                                { value: "rating", label: "Rated: High to Low" },
                                { value: "reviews", label: "Reviews: Most First" },
                            ].map(option => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer group p-1.5 hover:bg-gray-50 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={sortBy === option.value}
                                        onChange={() => onSortChange(option.value)}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                    />
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        sortBy === option.value ? "text-navy-900 font-medium" : "text-gray-600 group-hover:text-navy-900"
                                    )}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
