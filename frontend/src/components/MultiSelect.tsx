import React, { Fragment, useState, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  shortLabel?: string;
  group?: string;
}

interface MultiSelectProps {
  options: SelectOption[];
  value: string[]; // Array of selected values
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  variant?: 'light' | 'dark';
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  label,
  variant = 'light',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = variant === 'dark';

  const labelClass = isDark ? 'text-white/80' : 'text-gray-700';
  const buttonClass = isDark
    ? 'bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-red-400/80 hover:bg-white/15'
    : 'bg-white border-2 border-gray-300 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500';
  const placeholderClass = isDark ? 'text-white/70' : 'text-gray-500';
  const iconClass = isDark ? 'text-white/70' : 'text-gray-400';
  const optionsWrapperClass = isDark
    ? 'bg-navy-950/95 text-white ring-1 ring-white/10 border border-white/10 backdrop-blur-lg shadow-xl'
    : 'bg-white text-gray-900 border border-gray-100 shadow-xl';
  const optionActiveClass = isDark ? 'bg-white/15 text-white' : 'bg-red-50 text-red-700';
  const optionInactiveClass = isDark ? 'text-white/90' : 'text-gray-900';
  
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(lowerQuery) || 
      opt.group?.toLowerCase().includes(lowerQuery)
    );
  }, [options, searchQuery]);

  // Group filtered options
  const { selectedOptions, groupedOptions } = useMemo(() => {
    return filteredOptions.reduce((acc, opt) => {
      // Track selected options generally (from ALL options, effectively) 
      // but for display we want to know which filtered ones are selected
      
      const group = opt.group || 'Other';
      if (!acc.groupedOptions[group]) {
        acc.groupedOptions[group] = [];
      }
      acc.groupedOptions[group].push(opt);
      return acc;
    }, { selectedOptions: [] as SelectOption[], groupedOptions: {} as Record<string, SelectOption[]> });
  }, [filteredOptions]);

  // Get ALL selected options (not just filtered) for the chips display
  const allSelectedOptions = useMemo(() => 
    options.filter(opt => value.includes(opt.value)),
  [options, value]);


  const removeOption = (e: React.MouseEvent | React.KeyboardEvent, valToRemove: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== valToRemove));
  };

  /* State for processing collapsed groups */
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleCollapse = (e: React.MouseEvent, group: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCollapsedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div className="w-full">
      {label && (
        <label className={`mb-2 block text-xs uppercase tracking-wide font-semibold text-gray-500 ${labelClass}`}>
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} multiple>
        {({ open }) => (
        <div className="relative">
          <Listbox.Button 
            className={`relative w-full cursor-pointer rounded-lg py-3 pl-4 pr-10 text-left transition focus:outline-none min-h-[46px] ${buttonClass}`}
            onClick={() => {
              // Reset search when opening
              if (!open) setSearchQuery('');
            }}
          >
             <div className="flex flex-nowrap gap-1.5 items-center py-0.5 overflow-x-auto scrollbar-hide no-scrollbar">
                {allSelectedOptions.length > 0 ? (
                  <>
                    {allSelectedOptions.map(opt => (
                      <span 
                        key={opt.value} 
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset whitespace-nowrap transition-all animate-in zoom-in-95 duration-200 ${isDark ? 'bg-white/20 text-white ring-white/30' : 'bg-red-50 text-red-700 ring-red-200'}`}
                      >
                        {opt.shortLabel || opt.label}
                        <span
                          role="button"
                          tabIndex={0}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => removeOption(e, opt.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              removeOption(e, opt.value);
                            }
                          }}
                          aria-label={`Remove ${opt.label}`}
                          className={`ml-1 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full focus:outline-none cursor-pointer ${isDark ? 'hover:bg-white/20' : 'hover:bg-red-100 text-red-400'}`}
                        >
                           <X className="h-2.5 w-2.5" />
                        </span>
                      </span>
                    ))}
                  </>
                ) : (
                  <span className={`block truncate ${placeholderClass}`}>{placeholder}</span>
                )}
             </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setSearchQuery('')}
          >
            <Listbox.Options className={`absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md py-1 text-base focus:outline-none ${optionsWrapperClass} scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent`}>
              
              {/* Search Input */}
              <div className={`sticky top-0 z-20 px-3 py-2 border-b ${isDark ? 'bg-navy-950 border-white/10' : 'bg-white border-gray-100'}`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`w-full rounded-md py-1.5 pl-9 pr-3 text-sm border ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-white/30' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500'} focus:outline-none focus:ring-0 transition-all`}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Select All - Only for Filtered items */}
              {filteredOptions.length > 0 && (
                <div
                  className={`relative cursor-pointer select-none py-2 pl-4 pr-4 border-b ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-gray-100 hover:bg-gray-50'} transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const filteredValues = filteredOptions.map(o => o.value);
                    const allFilteredSelected = filteredValues.every(val => value.includes(val));

                    if (allFilteredSelected) {
                      // Deselect all filtered
                      onChange(value.filter(v => !filteredValues.includes(v)));
                    } else {
                      // Select all filtered
                      const newValues = [...value];
                      filteredValues.forEach(v => {
                        if (!newValues.includes(v)) newValues.push(v);
                      });
                      onChange(newValues);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${isDark ? 'border-white/50' : 'border-gray-300'} ${
                      filteredOptions.every(o => value.includes(o.value)) 
                      ? (isDark ? 'bg-white border-white' : 'bg-red-600 border-red-600') 
                      : ''
                    }`}>
                      {filteredOptions.every(o => value.includes(o.value)) && <Check className={`h-3 w-3 ${isDark ? 'text-navy-950' : 'text-white'}`} />}
                    </div>
                    <span className={`block truncate font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {searchQuery ? 'Select All Results' : 'Select All'}
                    </span>
                  </div>
                </div>
              )}

              {filteredOptions.length === 0 && (
                 <div className={`px-4 py-8 text-center text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    No results found
                 </div>
              )}

              {Object.entries(groupedOptions).map(([group, groupOptions]) => {
                const groupValues = groupOptions.map(o => o.value);
                const isGroupSelected = groupValues.every(val => value.includes(val));
                const isGroupPartiallySelected = !isGroupSelected && groupValues.some(val => value.includes(val));
                const isCollapsed = collapsedGroups[group];

                const toggleGroup = (e: React.MouseEvent) => {
                   e.preventDefault();
                   e.stopPropagation();
                   if (isGroupSelected) {
                     // Deselect all in group
                     onChange(value.filter(v => !groupValues.includes(v)));
                   } else {
                     // Select all in group
                     const newValues = [...value];
                     groupValues.forEach(v => {
                       if (!newValues.includes(v)) newValues.push(v);
                     });
                     onChange(newValues);
                   }
                };

                return (
                <div key={group}>
                   {group !== 'Other' && (
                    <div 
                      className={`sticky top-[50px] z-10 px-4 py-3 flex items-center justify-between cursor-pointer transition-colors border-y ${isDark ? 'bg-navy-950/95 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'} backdrop-blur-sm`}
                      onClick={toggleGroup}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isDark ? 'border-white/50' : 'border-gray-400'} ${isGroupSelected || isGroupPartiallySelected ? (isDark ? 'bg-white border-white' : 'bg-navy-900 border-navy-900') : 'bg-white/50'}`}>
                           {isGroupSelected && <Check className={`h-3 w-3 ${isDark ? 'text-navy-950' : 'text-white'}`} />}
                           {isGroupPartiallySelected && <div className={`h-0.5 w-2 rounded-full ${isDark ? 'bg-navy-950' : 'text-white'}`} />}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-navy-900'}`}>
                          {group}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleCollapse(e, group)}
                        className={`p-1 rounded-full ${isDark ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-300 text-gray-500'}`}
                      >
                         <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                      </button>
                    </div>
                  )}
                  {!isCollapsed && groupOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-4 pr-4 transition ${active ? optionActiveClass : optionInactiveClass
                        }`
                      }
                      value={option.value}
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex items-center gap-2">
                             <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isDark ? 'border-white/50' : 'border-gray-300'} ${selected ? (isDark ? 'bg-white border-white' : 'bg-red-600 border-red-600') : ''}`}>
                               {selected && <Check className={`h-3 w-3 ${isDark ? 'text-navy-950' : 'text-white'}`} />}
                             </div>
                             <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                {option.icon && (
                                <img src={option.icon} alt="" className="mr-2 h-5 w-5 inline-block rounded-sm object-cover" />
                                )}
                                {option.label}
                            </span>
                          </div>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </div>
              );
              })}
            </Listbox.Options>
          </Transition>
        </div>
        )}
      </Listbox>
    </div>
  );
};
