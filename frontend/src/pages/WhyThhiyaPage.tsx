import React from 'react';
import { Header, Footer, Container } from '../components';
import { motion } from 'framer-motion';
import { Star, Users, Building, Rocket, Shield, Zap, Eye, Target, Award, Sparkles } from 'lucide-react';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

const WhyThhiyaPage: React.FC = () => {
  // Track scroll depth and time on page
  useEngagementTracking('why_thhiya');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white py-20 lg:py-32 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-navy-900/50 to-transparent" />
          </div>
          <Container className="section-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white/90 mb-6"
              >
                <Sparkles className="w-4 h-4 text-red-400" />
                Discover the Future of Global Expansion
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                A Global Workforce Solutions &{' '}
                <span className="text-red-500">Employer Infrastructure</span>{' '}
                Platform
              </h1>
              <p className="text-xl md:text-2xl text-navy-200 mb-8">
                Powering Smarter, Faster Global Expansion
              </p>
              <p className="text-lg text-navy-300 max-w-3xl mx-auto leading-relaxed">
                Thhiya helps organizations discover, evaluate, and connect with trusted partners for seamless international workforce and infrastructure enablement. From startups exploring new markets to enterprises optimizing global operations, we bring precision, transparency, and speed to every expansion journey.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-navy-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-navy-500/5 rounded-full blur-2xl" />
          </div>
          <Container className="section-padding relative z-10">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-red-200">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-navy-900 mb-4">Our Vision</h2>
                  <p className="text-navy-600 leading-relaxed">
                    To become the most trusted platform for discovering, evaluating, and engaging with global workforce solution providers, enabling seamless international expansion for businesses of all sizes.
                  </p>
                </div>
              </motion.div>

              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-navy-200">
                  <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-navy-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-navy-900 mb-4">Our Mission</h2>
                  <p className="text-navy-600 leading-relaxed">
                    To help companies make smarter partner decisions through transparency, independent reviews, and decision-ready insights, while building a platform that delivers real results for both businesses and partners.
                  </p>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* What Makes Thhiya Different */}
        <section className="py-20 bg-navy-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-red-500/5 rounded-full blur-xl" />
            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-navy-500/5 rounded-full blur-xl" />
          </div>
          <Container className="section-padding relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-navy-900 mb-4">
                What Makes Thhiya Different
              </h2>
              <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                Our approach is built on core principles that guide every feature and interaction:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  point: "Expert Insights: Decision-ready data backed by real market intelligence",
                  icon: Star,
                  color: "red"
                },
                {
                  point: "Curated Partners: Thoroughly vetted service providers across all regions",
                  icon: Shield,
                  color: "navy"
                },
                {
                  point: "Intelligent Matching: AI-driven connections based on your specific needs",
                  icon: Zap,
                  color: "red"
                },
                {
                  point: "Transparent Benchmarking: Real-time cost and compliance data for informed decisions",
                  icon: Eye,
                  color: "navy"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white p-6 rounded-xl border border-gray-200 hover:shadow-xl hover:border-red-200 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${item.color === 'red' ? 'bg-red-100' : 'bg-navy-100'} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${item.color === 'red' ? 'text-red-600' : 'text-navy-600'}`} />
                    </div>
                    <p className="text-navy-700 font-medium">{item.point}</p>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Who We Help */}
        <section className="py-20 bg-navy-950 text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" />
          </div>
          <Container className="section-padding relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Who We Help</h2>
              <p className="text-xl text-navy-200 max-w-2xl mx-auto">
                Thhiya serves businesses at every stage of their global expansion journey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Growth Leaders & Expansion Teams",
                  description: "Save time and reduce risk with decision-ready data and pre-qualified partner recommendations.",
                  gradient: "from-red-500 to-red-600"
                },
                {
                  icon: Rocket,
                  title: "Startups Entering New Markets",
                  description: "Access cost-effective, scalable solutions without needing in-house legal or HR teams.",
                  gradient: "from-navy-600 to-navy-800"
                },
                {
                  icon: Building,
                  title: "Enterprises Scaling Global Operations",
                  description: "Optimize vendor performance, stay compliant across regions, and unify fragmented processes.",
                  gradient: "from-red-600 to-red-700"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-navy-200 leading-relaxed">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-navy-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-red-500/5 rounded-full blur-xl" />
            <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-navy-500/5 rounded-full blur-xl" />
          </div>
          <Container className="section-padding relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-navy-900 mb-4">Our Core Values</h2>
              <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                The principles that drive everything we do
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Quality Over Quantity",
                  description: "We focus on meaningful connections between businesses and partners who can deliver real results, not just volume.",
                  icon: Star,
                  color: "red"
                },
                {
                  title: "Transparency First",
                  description: "We believe in complete transparency in pricing, capabilities, and performance metrics. Every decision should be informed by accurate, real-time data.",
                  icon: Shield,
                  color: "navy"
                },
                {
                  title: "Privacy Protection",
                  description: "Your data is protected and shared only with your explicit consent, in accordance with India's Data Privacy Act and GDPR standards.",
                  icon: Shield,
                  color: "red"
                },
                {
                  title: "Continuous Innovation",
                  description: "We constantly evolve our platform to provide better insights, smarter matching, and more valuable connections.",
                  icon: Zap,
                  color: "navy"
                }
              ].map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-xl hover:border-red-200 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 ${value.color === 'red' ? 'bg-red-100' : 'bg-navy-100'} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${value.color === 'red' ? 'text-red-600' : 'text-navy-600'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-4">{value.title}</h3>
                    <p className="text-navy-600 leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Thhiya Advantage */}
        <section className="py-20 bg-gradient-to-br from-red-50 to-navy-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-1/2 w-80 h-80 bg-navy-500/5 rounded-full blur-2xl" />
          </div>
          <Container className="section-padding relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-navy-900 mb-4">The Thhiya Advantage</h2>
              <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                A platform designed for both businesses and partners
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* For Businesses */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-red-200 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-navy-900 mb-6">For Businesses Seeking Solutions:</h3>
                <ul className="space-y-4">
                  {[
                    "Save Time and Money: Complete one form, get matched to top vendors, and no endless research.",
                    "Make Confident Choices: Compare real costs, compliance data, and capabilities.",
                    "Maintain Full Control: Choose who contacts you, when, and how. No sales pressure."
                  ].map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-navy-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* For Partners */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-navy-200 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-navy-900 mb-6">For Partners:</h3>
                <ul className="space-y-4">
                  {[
                    "Access Qualified Demand: Only decision-ready leads from vetted businesses.",
                    "Get Discovered: Enhanced visibility through advanced listings and performance reviews.",
                    "Expand Globally: Tap into new markets and sectors where your services are needed."
                  ].map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-navy-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-navy-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WhyThhiyaPage;