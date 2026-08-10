import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileTableOfContentsProps {
  sections: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
  }>;
}

export const MobileTableOfContents: React.FC<MobileTableOfContentsProps> = ({ sections }) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsOpen(false);
    }
  };

  if (sections.length === 0) return null;

  return (
    <div className="lg:hidden px-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-white"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0C1B33]/10 rounded-md flex items-center justify-center flex-shrink-0">
              <Info className="w-3 h-3 text-[#0C1B33]" />
            </div>
            <span className="font-semibold text-[#0C1B33] text-sm">On this page</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100"
            >
              <nav className="p-2 max-h-60 overflow-y-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-[#E63946] hover:bg-gray-50 rounded-md transition-all flex items-center gap-2"
                  >
                    {section.icon && <span className="w-4 h-4 flex-shrink-0">{section.icon}</span>}
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
