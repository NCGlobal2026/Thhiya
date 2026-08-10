import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Rocket, TrendingUp } from 'lucide-react';
import { Container, Card } from '../../components';

const personas = [
  {
    icon: Rocket,
    title: 'Startups Entering New Markets',
    description: 'Launch internationally without legal entities. Get EOR, payroll, and compliance support to hire your first global team members quickly and compliantly.',
    highlights: ['Rapid market entry', 'Cost-effective solutions', 'Compliance guidance'],
  },
  {
    icon: TrendingUp,
    title: 'Growth Leaders Scaling Operations',
    description: 'Expand your footprint across multiple countries. Access benchmarked pricing, multi-country payroll, and benefits administration at scale.',
    highlights: ['Multi-country support', 'Scalable infrastructure', 'Transparent pricing'],
  },
  {
    icon: Building2,
    title: 'Enterprises Managing Global Teams',
    description: 'Consolidate vendors and optimize costs. Get enterprise-grade solutions with unified reporting, compliance monitoring, and dedicated support.',
    highlights: ['Vendor consolidation', 'Enterprise controls', 'Advanced analytics'],
  },
];

export const WhoWeHelpSection: React.FC = () => {
  return (
    <section id="who-we-help" className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10 lg:mb-12"
        >
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            Tailored to your scale
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Who We Help
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/70 max-w-xl mx-auto">
            Support designed for teams launching, accelerating, or consolidating global operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="h-full rounded-2xl border border-white/15 bg-white/10 p-5 md:p-6 text-white backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-white">{persona.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-white/70">{persona.description}</p>
                  <ul className="mt-4 space-y-2">
                    {persona.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center text-sm text-white/80">
                        <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
