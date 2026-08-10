import React from 'react';
import { Header, Footer } from '../components';
import { Container } from '../components/Container';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail } from 'lucide-react';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const PrivacyPolicyPage: React.FC = () => {
  // Track scroll depth and time on page
  useEngagementTracking('privacy_policy');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-14 md:pb-16 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(230, 57, 70) 1px, transparent 0)',
                backgroundSize: '48px 48px'
              }}
            />
          </div>
          <Container className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white/80 mb-4 sm:mb-5 md:mb-6">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                Privacy & Data Protection
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Privacy Policy
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-3 sm:mb-4">
                How we protect and handle your personal data
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm sm:text-base md:text-lg text-white/70">
                <p>Effective Date: November 2025</p>
                <p>Last Updated: November 2025</p>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="prose prose-lg max-w-none"
              >
                {/* Introduction */}
                <div className="mb-8 sm:mb-10 md:mb-12">
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Thhiya ("we," "our," "us") is a global workforce and expansion enablement platform owned and operated by BUG Aeterium. We are committed to protecting your personal data and ensuring transparency in how we collect, use, and safeguard information when you interact with our website, platform, or services.
                  </p>
                </div>

                {/* Section 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      1. Information We Collect
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    We collect information in the following ways:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Information you provide directly:</strong> When you create an account, submit a form, request vendor comparisons, or contact us.</li>
                    <li><strong>Automatic data collection:</strong> Through cookies, analytics tools, and session data to improve user experience and platform performance.</li>
                    <li><strong>Third-party data:</strong> From curated vendors, partners, or public business sources to improve accuracy and matching quality.</li>
                  </ul>
                </motion.div>

                {/* Section 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-navy-600/10 flex items-center justify-center text-navy-600">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      2. How We Use Your Information
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    We use your data to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Provide access to Thhiya's services and insights</li>
                    <li>Match you with relevant and curated global service providers</li>
                    <li>Improve platform performance and user experience</li>
                    <li>Send updates, reports, or marketing communications (only with your consent)</li>
                    <li>Ensure compliance with applicable laws and data protection standards</li>
                  </ul>
                </motion.div>

                {/* Section 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-navy-600/10 flex items-center justify-center text-navy-600">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      3. Data Sharing and Disclosure
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      <strong>We do not sell your data.</strong>
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                      We only share information when:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mb-4">
                      <li>You explicitly opt to connect with a vendor through our platform</li>
                      <li>It is necessary for analytics, marketing automation, or legal compliance</li>
                      <li>Required by law, court order, or government authority</li>
                    </ul>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      All vendors and service providers we work with are required to comply with highest standards.
                    </p>
                  </div>
                </motion.div>

                {/* Section 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      4. Data Retention
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    We retain your information only as long as needed to fulfill the purposes stated here or as required by law. You can request deletion of your account or data by contacting{' '}
                    <a href="mailto:info@bugbuk.com" className="text-red-600 hover:text-red-700 underline">
                      info@bugbuk.com
                    </a>
                  </p>
                </motion.div>

                {/* Section 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      5. Your Rights
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    Depending on your location, you have rights to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mb-4">
                    <li>Access, correct, or delete your data</li>
                    <li>Withdraw consent for processing</li>
                    <li>Request data portability</li>
                    <li>File a complaint with your local data protection authority</li>
                  </ul>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Requests can be sent to{' '}
                    <a href="mailto:info@bugbuk.com" className="text-red-600 hover:text-red-700 underline">
                      info@bugbuk.com
                    </a>
                  </p>
                </motion.div>

                {/* Section 6 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      6. Data Security
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    We use industry-standard encryption (SSL/TLS), secure cloud infrastructure, and limited access protocols to protect your data from unauthorized use or disclosure.
                  </p>
                </motion.div>

                {/* Section 7 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-navy-600/10 flex items-center justify-center text-navy-600">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      7. International Data Transfers
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Your data may be stored or processed in countries outside your own. We ensure such transfers meet legal adequacy and protection requirements under relevant international standards.
                  </p>
                </motion.div>

                {/* Section 8 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-navy-600/10 flex items-center justify-center text-navy-600">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      8. Updates to This Policy
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    We may update this policy from time to time. The latest version will always be posted on our website.
                  </p>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="bg-gradient-to-r from-navy-900 to-red-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl text-white/80 font-bold">Contact Us</h2>
                  </div>
                  <p className="text-white/80 mb-4">
                    For privacy-related questions, contact us at:
                  </p>
                  <a
                    href="mailto:info@bugbuk.com"
                    className="inline-flex items-center gap-2 text-red-300 hover:text-white font-semibold transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    info@bugbuk.com
                  </a>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/70 text-sm">
                      Thhiya<br />
                      BUG Aeterium<br />
                      Delhi, India 110019
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
};