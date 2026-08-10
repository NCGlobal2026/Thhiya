import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, DollarSign, FileText, Globe, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Container } from '../../components';
import { BANTModal } from '../../components/bant';

const challenges = [
  {
    icon: DollarSign,
    title: 'Unpredictable Costs',
    problem: 'Hidden fees and inconsistent pricing make budgeting impossible.',
    solution: 'Transparent pricing with no hidden costs',
    gradient: 'from-red-500 to-red-600',
    bgGradient: 'from-red-50 to-red-100',
  },
  {
    icon: FileText,
    title: 'Compliance Complexity',
    problem: 'Navigating local labor laws and tax regulations across countries.',
    solution: 'Expert guidance on local regulations',
    gradient: 'from-navy-700 to-navy-900',
    bgGradient: 'from-navy-50 to-navy-100',
  },
  {
    icon: AlertCircle,
    title: 'Vendor Uncertainty',
    problem: 'Difficulty finding and vetting reliable global service providers.',
    solution: 'Curated providers with real reviews',
    gradient: 'from-red-600 to-red-700',
    bgGradient: 'from-red-50 to-red-100',
  },
  {
    icon: Globe,
    title: 'Fragmented Solutions',
    problem: 'Managing multiple vendors and platforms for different countries.',
    solution: 'One platform for all your global needs',
    gradient: 'from-navy-600 to-navy-800',
    bgGradient: 'from-navy-50 to-navy-100',
  },
];

export const ChallengesSection: React.FC = () => {
  const [isBANTModalOpen, setIsBANTModalOpen] = useState(false);

  return (
    <section id="challenges" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-navy-900 to-navy-800 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-lg mb-4 sm:mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Solve blockers before they surface
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy-950 mb-3 sm:mb-4">
            Common Challenges We Solve
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Global operations stumble when information is fragmented. We unify financial, legal, and operational insight so your teams stay in control.
          </p>
        </motion.div>

        {/* Challenge Cards - Bento Grid Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, x: isEven ? -20 : 20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${challenge.bgGradient} border border-gray-100 p-5 sm:p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1`}>
                  {/* Decorative gradient blob */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${challenge.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${challenge.gradient} text-white shadow-lg mb-4 sm:mb-5`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy-950 mb-3 sm:mb-4">
                    {challenge.title}
                  </h3>

                  {/* Problem & Solution */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                        <span className="text-red-500 text-xs">✕</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{challenge.problem}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-navy-600 mt-0.5" />
                      </div>
                      <p className="text-sm sm:text-base text-navy-900 font-medium leading-relaxed">{challenge.solution}</p>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className={`w-5 h-5 sm:w-6 sm:h-6 text-gradient-to-r ${challenge.gradient.replace('from-', 'text-').split(' ')[0]}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 sm:mt-12 md:mt-16 text-center"
        >
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            Ready to simplify your global expansion?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-navy-950 text-white text-sm sm:text-base font-medium rounded-full hover:bg-navy-900 transition-all duration-300 shadow-lg hover:shadow-xl">
              See How We Help
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setIsBANTModalOpen(true)}
              className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white text-sm sm:text-base font-medium rounded-full hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              Get Matched Now
            </button>
          </div>
        </motion.div>

        {/* BANT/MEDDIC/INTENT(BMI) Modal */}
        <BANTModal
          isOpen={isBANTModalOpen}
          onClose={() => setIsBANTModalOpen(false)}
          source="challenges-section"
        />
      </Container>
    </section>
  );
};
