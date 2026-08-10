import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  title = 'FAQs About Global Hiring',
  subtitle = 'Common questions about expanding your workforce internationally',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#0C1B33] mb-2 sm:mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">{subtitle}</p>
        </div>

        <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm sm:text-base md:text-lg font-semibold text-[#0C1B33] pr-2 sm:pr-3 md:pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#E63946] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-5 md:pb-5 lg:px-6 lg:pb-6 text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
