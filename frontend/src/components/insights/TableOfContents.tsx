import React from 'react';
import { Info } from 'lucide-react';

interface TableOfContentsProps {
  sections: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
  }>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
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
    }
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 md:p-6 sticky top-20 sm:top-24">
      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-3.5 md:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0C1B33]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0C1B33]" />
        </div>
        <h3 className="font-semibold text-[#0C1B33] text-sm sm:text-base">On this page</h3>
      </div>
      <nav className="space-y-1.5 sm:space-y-2">
        {sections.map((section, index) => (
          <button
            key={`${section.id}-${index}`}
            onClick={() => scrollToSection(section.id)}
            className="w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-[#E63946] hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2"
          >
            {section.icon && <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">{section.icon}</span>}
            <span className="truncate">{section.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
