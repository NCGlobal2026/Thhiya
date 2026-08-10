import React from 'react';
import { Globe2, Briefcase, Filter, Sparkles } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import slugify from '../../utils/slugify';
import { motion } from 'framer-motion';

interface InsightsFilterBarProps {
  selectedService: string;
  selectedCountry: string;
  onServiceChange: (service: string) => void;
  onCountryChange: (country: string) => void;
  services: Array<{ value: string; label: string; count?: number }>;
  countries: Array<{ value: string; label: string; count?: number }>;
}

export const InsightsFilterBar: React.FC<InsightsFilterBarProps> = ({
  selectedService,
  selectedCountry,
  onServiceChange,
  onCountryChange,
  services,
  countries,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl sm:rounded-2xl border border-gray-200 shadow-lg"
    >
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-t-2xl" />

      <div className="p-4 sm:p-5 md:p-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-navy-900 truncate">Filter Insights</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              <span className="hidden sm:inline">Select service and country to view detailed insights</span>
              <span className="sm:hidden">Find insights by service & country</span>
            </p>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <FilterDropdown
            label="Service Category"
            placeholder="All Services"
            options={services}
            selectedValue={selectedService}
            onSelect={onServiceChange}
            icon={<Briefcase className="w-5 h-5" />}
            searchable={true}
            allowClear={true}
            clearLabel="Show All Services"
          />

          <FilterDropdown
            label="Target Country"
            placeholder="Select a country"
            options={countries}
            selectedValue={selectedCountry}
            onSelect={onCountryChange}
            icon={<Globe2 className="w-5 h-5" />}
            searchable={true}
          />
        </div>

        {/* Active Selection Display */}
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                <span className="font-medium">Showing:</span>
              </div>

              {/* Service Badge */}
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-full font-semibold text-xs sm:text-sm border border-red-200 shadow-sm"
              >
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {selectedService
                    ? (services.find(s => s.value === selectedService || slugify(String(s.value)) === slugify(String(selectedService)) || slugify(s.label) === slugify(String(selectedService)))?.label || selectedService)
                    : 'All Services'
                  }
                </span>
              </motion.span>

              <span className="text-gray-400 text-xs sm:text-sm">in</span>

              {/* Country Badge */}
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-navy-50 to-navy-100 text-navy-700 rounded-full font-semibold text-xs sm:text-sm border border-navy-200 shadow-sm"
              >
                <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {countries.find(c => c.value === selectedCountry || slugify(String(c.value)) === slugify(String(selectedCountry)) || slugify(c.label) === slugify(String(selectedCountry)))?.label || selectedCountry}
                </span>
              </motion.span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
