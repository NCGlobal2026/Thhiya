import React from 'react';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const GTMToolkitsPage: React.FC = () => {
  // Track scroll depth and time on page
  useEngagementTracking('gtm_toolkits');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-navy-100 text-navy-700 text-sm font-medium mb-6">
              Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0C1B33] mb-6">
              GTM Toolkits
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive toolkits and resources to accelerate your go-to-market strategy globally.
            </p>
            <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
              <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#0C1B33] mb-4">
                Powerful Resources Coming Your Way
              </h2>
              <p className="text-gray-600 mb-6">
                GTM Toolkits will provide templates, checklists, compliance guides, and strategic frameworks to help you expand globally with confidence.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};
