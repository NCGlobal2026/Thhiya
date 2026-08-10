import React from 'react';
import { Header, Footer } from '../components';
import { Container } from '../components/Container';
import { motion } from 'framer-motion';
import { Shield, Settings, Mail } from 'lucide-react';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const CookiePolicyPage: React.FC = () => {
  // Track scroll depth and time on page
  useEngagementTracking('cookie_policy');

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
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Legal & Privacy
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Cookie Policy
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-3 sm:mb-4">
                How we use cookies to enhance your experience
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
                    Thhiya uses cookies and similar tracking technologies to improve user experience, analyze website performance, and provide personalized recommendations.
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
                      1. What Are Cookies?
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and enhance platform functionality.
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
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      2. Types of Cookies We Use
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <h3 className="font-semibold text-navy-900 mb-2">Essential Cookies</h3>
                      <p className="text-gray-600">Required for core platform functionality (e.g., login, session management).</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <h3 className="font-semibold text-navy-900 mb-2">Analytics Cookies</h3>
                      <p className="text-gray-600">Help us understand user behavior through tools like Google Analytics.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <h3 className="font-semibold text-navy-900 mb-2">Preference Cookies</h3>
                      <p className="text-gray-600">Save language, location, or display settings.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <h3 className="font-semibold text-navy-900 mb-2">Marketing Cookies</h3>
                      <p className="text-gray-600">Used to deliver relevant ads or content.</p>
                    </div>
                  </div>
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
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">
                      3. Managing Your Cookie Preferences
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    You can modify or block cookies through your browser settings at any time. However, disabling cookies may affect site functionality.
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    For more information, visit your browser's help section.
                  </p>
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
                      4. Third-Party Tools
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                    We may use trusted analytics or advertising partners who also set cookies, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Google Analytics</li>
                    <li>LinkedIn Insights Tag</li>
                    <li>Meta Pixel</li>
                  </ul>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4">
                    These third parties follow their own privacy policies and data processing terms.
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
                      5. Consent
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    By continuing to use Thhiya, you consent to our use of cookies as described here. You can withdraw consent anytime by changing your cookie preferences.
                  </p>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-gradient-to-r from-navy-900 to-red-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl text-white/80 font-bold">Contact Us</h2>
                  </div>
                  <p className="text-white/80 mb-4">
                    For questions about our cookie policy or privacy practices, email us at:
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