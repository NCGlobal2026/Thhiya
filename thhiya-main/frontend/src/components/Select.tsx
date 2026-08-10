import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { Fragment } from 'react';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  variant?: 'light' | 'dark';
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  variant = 'light',
}) => {
  const selectedOption = options.find(opt => opt.value === value);
  const isDark = variant === 'dark';

  const labelClass = isDark ? 'text-white/80' : 'text-gray-700';
  const buttonClass = isDark
    ? 'bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-2 focus:ring-red-400/80 hover:bg-white/15'
    : 'bg-white border-2 border-gray-300 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500 hover:border-gray-400';
  const valueClass = isDark ? 'text-white' : 'text-gray-900';
  const placeholderClass = isDark ? 'text-white/70' : 'text-gray-500';
  const iconClass = isDark ? 'text-white/70' : 'text-gray-400';
  const optionsWrapperClass = isDark
    ? 'bg-navy-950/95 text-white ring-1 ring-white/10 border border-white/10 backdrop-blur-lg shadow-xl'
    : 'bg-white text-gray-900 border border-gray-100 shadow-xl';
  const optionActiveClass = isDark ? 'bg-white/15 text-white' : 'bg-red-50 text-red-700';
  const optionInactiveClass = isDark ? 'text-white/90' : 'text-gray-900';
  const checkClass = isDark ? 'text-red-300' : 'text-red-600';

  return (
    <div className="w-full">
      {label && (
        <label className={`mb-2 block text-xs uppercase tracking-wide font-semibold text-gray-500 ${labelClass}`}>
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className={`relative w-full cursor-pointer rounded-lg py-3 pl-4 pr-10 text-left transition focus:outline-none min-h-[46px] ${buttonClass}`}>
            <span className={`flex items-center gap-2 truncate ${selectedOption ? valueClass : placeholderClass}`}>
              {selectedOption?.icon && (
                <img src={selectedOption.icon} alt="" className="h-5 w-auto rounded-sm object-cover" />
              )}
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base focus:outline-none ${optionsWrapperClass}`}>
              {options.map((option) => (
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
                      <span className={`flex items-center gap-2 truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                        {option.icon && (
                          <img src={option.icon} alt="" className="h-5 w-auto rounded-sm object-cover" />
                        )}
                        {option.label}
                      </span>
                      {selected && (
                        <span className={`absolute inset-y-0 right-4 flex items-center ${checkClass}`}>
                          <Check className="h-4 w-4 stroke-3" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
