import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Scale, FileText, UserPlus, Mail, ArrowRight, Zap, Globe2, Shield, Phone, Sparkles } from 'lucide-react';
import { Container } from '../../components';
import { BANTModal } from '../../components/bant';
import { ContactModal } from '../../components/contact';

const primaryActions = [
  {
    icon: Search,
    title: 'Browse Services',
    description: 'Explore EOR, payroll, compliance, and more by country.',
    cta: 'Explore Services',
    gradient: 'from-navy-700 to-navy-900',
    hoverGradient: 'group-hover:from-navy-800 group-hover:to-navy-950',
    link: '/insights/hub',
  },
  {
    icon: Scale,
    title: 'Compare Providers',
    description: 'View side-by-side comparisons of curated partners.',
    cta: 'Compare Now',
    gradient: 'from-navy-600 to-navy-800',
    hoverGradient: 'group-hover:from-navy-700 group-hover:to-navy-900',
    link: '/purple-listings',
  },
  {
    icon: FileText,
    title: 'Get Matched',
    description: 'Submit your needs and get matched with ideal providers.',
    cta: 'Get Started',
    gradient: 'from-red-500 to-red-600',
    hoverGradient: 'group-hover:from-red-600 group-hover:to-red-700',
    isBANTTrigger: true,
  },
];

const secondaryActions = [
  {
    icon: UserPlus,
    title: 'Join Our Network',
    description: 'Service providers: Connect with businesses seeking your expertise.',
    cta: 'Join as Provider',
  },
  {
    icon: Mail,
    title: 'Contact Our Team',
    description: 'Have questions? Our team is here to help you succeed.',
    cta: 'Get in Touch',
    isContactTrigger: true,
  },
];

export const ExploreNextSection: React.FC = () => {
  const [isBANTModalOpen, setIsBANTModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section id="explore" className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* BANT/MEDDIC/INTENT(BMI) Modal */}
      <BANTModal
        isOpen={isBANTModalOpen}
        onClose={() => setIsBANTModalOpen(false)}
        source="landing-explore-section"
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        source="landing-explore-section"
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-navy-500/5 rounded-full blur-3xl" />
        {/* Dotted pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #0C1B33 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
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
            className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-sm mb-4 sm:mb-6"
          >
            <Zap className="w-4 h-4 text-red-500" />
            Chart your next move
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy-950 mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Choose the path that accelerates your team toward confident global expansion
          </p>
        </motion.div>

        {/* Primary Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
          {primaryActions.map((action, index) => {
            const Icon = action.icon;
            const CardContent = (
              <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-gray-200 p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-transparent">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg mb-4 sm:mb-5 group-hover:bg-white/20 transition-colors duration-300`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy-950 mb-2 sm:mb-3 group-hover:text-white transition-colors duration-300">
                    {action.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                    {action.description}
                  </p>

                  {/* CTA Button */}
                  <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-navy-950 group-hover:text-white transition-colors duration-300">
                    {action.cta}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={action.isBANTTrigger ? () => setIsBANTModalOpen(true) : undefined}
              >
                {action.link ? (
                  <Link to={action.link}>{CardContent}</Link>
                ) : (
                  CardContent
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Secondary Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          {secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={(action as any).isContactTrigger ? () => setIsContactModalOpen(true) : undefined}
              >
                <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden bg-navy-950 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-red-500 transition-colors duration-300">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                        {action.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 leading-relaxed">
                        {action.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
                        {action.cta}
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-400 p-6 sm:p-8 md:p-10 lg:p-12"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-700/30 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Ready to simplify global expansion?
              </h3>
              <p className="text-sm sm:text-base text-white/90 max-w-xl">
                Schedule a free consultation with our experts to discuss your international hiring needs.
              </p>
            </div>

            {/* Right CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm sm:text-base">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                Schedule a Call
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Explore Countries
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="relative z-10 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/20">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
              {[
                { icon: Shield, text: 'SOC 2 Compliant' },
                { icon: Globe2, text: '192 Countries' },
                { icon: Zap, text: '24hr Response Time' },
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80">
                  <badge.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
