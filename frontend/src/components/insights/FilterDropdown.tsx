import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import slugify from '../../utils/slugify';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  placeholder: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
  searchable?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  variant?: 'white' | 'gray';
  className?: string;
  buttonClassName?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onSelect,
  icon,
  searchable = true,
  allowClear = false,
  clearLabel = 'Show All',
  variant = 'white',
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(opt =>
    (opt.value && opt.value === selectedValue) ||
    (opt.label && opt.label === selectedValue) ||
    (opt.value && slugify(String(opt.value || '')) === slugify(String(selectedValue || ''))) ||
    (opt.label && slugify(opt.label) === slugify(String(selectedValue || '')))
  );

  const filteredOptions = searchable
    ? options.filter(opt =>
      opt.label && opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`filter-dropdown relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-opacity-20 transition-all ${variant === 'white'
            ? 'bg-white border-gray-300 hover:border-[#E63946]'
            : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-[#E63946]'
          } ${buttonClassName}`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className={selectedValue ? 'text-gray-900' : 'text-gray-500 text-sm'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[100] mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-80"
          >
            {searchable && (
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${label.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-opacity-20"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {/* Clear/Show All Option */}
              {allowClear && selectedValue && (
                <button
                  onClick={() => {
                    onSelect('');
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-[#E63946]"
                >
                  <div className="flex items-center gap-3">
                    <X className="w-4 h-4" />
                    <span className="font-medium">{clearLabel}</span>
                  </div>
                </button>
              )}

              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSelect(option.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${(option.value === selectedValue || slugify(option.value) === slugify(selectedValue || '') || slugify(option.label) === slugify(selectedValue || '')) ? 'bg-[#E63946]/5' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 text-left">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-sm text-gray-500">({option.count})</span>
                      )}
                    </div>
                    {(option.value === selectedValue || slugify(option.value) === slugify(selectedValue || '') || slugify(option.label) === slugify(selectedValue || '')) && (
                      <Check className="w-5 h-5 text-[#E63946]" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
