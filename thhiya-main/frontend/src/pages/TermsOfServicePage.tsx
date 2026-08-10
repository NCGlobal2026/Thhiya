import React from 'react';
import { Header, Footer } from '../components';
import { Container } from '../components/Container';
import { motion } from 'framer-motion';
import { FileText, Shield, Mail } from 'lucide-react';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const TermsOfServicePage: React.FC = () => {
  // Track scroll depth and time on page
  useEngagementTracking('terms_of_service');

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
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                Legal & Terms
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Terms of Service
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-3 sm:mb-4">
                Guidelines for using Thhiya platform
              </p>
              <p className="text-sm sm:text-base md:text-lg text-white/70">
                Effective Date: November 2025
              </p>
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
                    Welcome to Thhiya, A BUG Aeterium Company. By accessing or using our website or services, you agree to these Terms of Service ("Terms"). Please read them carefully.
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
                      1. Acceptance of Terms
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    By using Thhiya, you confirm that you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mb-4">
                    <li>Are at least 18 years old and have legal authority to enter into agreements</li>
                    <li>Agree to comply with these Terms and all applicable laws</li>
                  </ul>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    If you do not agree, please discontinue use of our services.
                  </p>
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
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      2. Description of Services
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    Thhiya provides a technology platform for businesses to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mb-4">
                    <li>Access independent data on service providers globally</li>
                    <li>Compare vendors for HRTech, EOR, payroll, compliance, and related services</li>
                    <li>Connect with selected providers at their discretion</li>
                  </ul>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Thhiya does not act as an intermediary, recruiter, or agent in any contractual relationship between users and vendors.
                  </p>
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
                      3. Account Registration
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    You may need to create an account to access some features. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Provide accurate and updated information</li>
                    <li>Maintain confidentiality of your login credentials</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
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
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      4. Use of Platform
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Misuse or attempt to hack the platform</li>
                    <li>Upload unlawful, misleading, or offensive content</li>
                    <li>Copy, modify, or reverse-engineer any platform code</li>
                    <li>Use Thhiya for competitive analysis without consent</li>
                  </ul>
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
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      5. Vendor Listings and Data Accuracy
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    Thhiya aggregates information from curated sources, vendor submissions, and public records.
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    While we strive for accuracy, we do not guarantee completeness, reliability, or suitability of any vendor information.
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Users must perform their own due diligence before entering into agreements.
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
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      6. Limitation of Liability
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    Thhiya or BUG Aeterium shall not be liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mb-4">
                    <li>Any direct or indirect loss arising from vendor engagement decisions</li>
                    <li>Business, data, or profit loss resulting from use or inability to use our services</li>
                  </ul>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Our liability, if any, will not exceed the total amount paid (if any) for use of the platform.
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
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      7. Intellectual Property
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    All content, branding, and design elements on Thhiya are the property of BUG Aeterium.
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    You may not copy, reproduce, or distribute any materials without written consent.
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
                      8. Termination
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    We reserve the right to suspend or terminate accounts violating our Terms or causing harm to the platform or its users.
                  </p>
                </motion.div>

                {/* Section 9 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="mb-8 sm:mb-10 md:mb-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      9. Governing Law
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    These Terms are governed by the laws of India, and any disputes shall be resolved in Delhi.
                  </p>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="bg-gradient-to-r from-navy-900 to-red-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl text-white/80 font-bold">Contact Us</h2>
                  </div>
                  <p className="text-white/80 mb-4">
                    For questions about these Terms, contact us at:
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