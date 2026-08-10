import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CreditCard, Users, Megaphone, Sparkles, ArrowUpRight } from 'lucide-react';
import { Container, BrandMark } from '../../components';
import { BANTModal } from '../../components/bant';

const differentiators = [
  {
    icon: Star,
    title: 'Vendor Reviews & Listing',
    subtitle: 'Trust through transparency',
    description: 'Explore detailed vendor profiles with authentic client reviews, service ratings, and performance metrics.',
    highlight: 'Independent Reviews',
    gradient: 'from-red-500 to-red-600',
    iconBg: 'bg-gradient-to-br from-red-400 to-red-500',
  },
  {
    icon: CreditCard,
    title: 'Subscription Model',
    subtitle: 'Unlimited insights, one plan',
    description: 'Get unlimited access to market intelligence, compliance data, and vendor comparisons.',
    highlight: 'Unlimited Access',
    gradient: 'from-navy-600 to-navy-800',
    iconBg: 'bg-gradient-to-br from-navy-500 to-navy-700',
  },
  {
    icon: Users,
    title: 'Demand Generation',
    subtitle: 'Grow your pipeline',
    description: 'Connect with decision-ready businesses actively seeking your services.',
    highlight: 'Quality Leads',
    gradient: 'from-red-600 to-red-700',
    iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
  },
  {
    icon: Megaphone,
    title: 'Advertising Solutions',
    subtitle: 'Boost your visibility',
    description: 'Get featured placement, sponsored listings, and priority visibility to win more clients.',
    highlight: 'Premium Visibility',
    gradient: 'from-navy-700 to-navy-900',
    iconBg: 'bg-gradient-to-br from-navy-600 to-navy-800',
  },
];

export const WhyChooseSection: React.FC = () => {
  const [isBANTModalOpen, setIsBANTModalOpen] = useState(false);

  return (
    <section id="why-thhiya" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-navy-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-navy-900/50 to-transparent" />
      </div>

      <Container className="relative z-10">
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
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-xs sm:text-sm font-medium text-white/90 mb-4 sm:mb-6"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            Built for transparency and trust
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Why Businesses Choose{' '}
            <BrandMark variant="white" className="inline align-baseline" weight="semibold" />
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed px-4">
            Combining live market intelligence with curated execution partners, so your expansion teams can move fast without compromising on governance.
          </p>
        </motion.div>

        {/* Feature Cards - Improved Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6 md:p-8 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-red-500/10">
                  {/* Gradient border effect on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${item.gradient} p-[1px]`}>
                    <div className="w-full h-full bg-navy-950 rounded-2xl sm:rounded-3xl" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Top row: Icon and highlight badge */}
                    <div className="flex items-start justify-between mb-4 sm:mb-5">
                      <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${item.iconBg} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${item.gradient} text-white shadow-sm`}>
                        {item.highlight}
                      </span>
                    </div>

                    {/* Title and subtitle */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-red-400 font-medium mb-3 sm:mb-4">
                      {item.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                      {item.description}
                    </p>

                    {/* Learn more link */}
                    <div className="mt-4 sm:mt-6 flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Learn more</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats row - Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 sm:mt-12 md:mt-16 pt-8 sm:pt-10 border-t border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '192', label: 'Countries Covered' },
              { value: '500+', label: 'Curated Vendors' },
              { value: '99%', label: 'Client Satisfaction' },
              { value: '24/7', label: 'Expert Support' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center group"
              >
                <div className="relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-400 group-hover:w-full transition-all duration-300" />
                </div>
                <div className="text-xs sm:text-sm text-white/50 mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 sm:mt-10 text-center"
          >
            <button
              onClick={() => setIsBANTModalOpen(true)}
              className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm sm:text-base font-semibold rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
              Get Matched with the Right Partner
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />

              {/* Animated background glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
            </button>
          </motion.div>
        </motion.div>

        {/* BANT/MEDDIC/INTENT(BMI) Modal */}
        <BANTModal
          isOpen={isBANTModalOpen}
          onClose={() => setIsBANTModalOpen(false)}
          source="why-choose-section"
        />
      </Container>
    </section>
  );
};
