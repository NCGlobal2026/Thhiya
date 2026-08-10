import React from 'react';
import { Header, Footer } from '../components';
import {
  HeroSection,
  HowItWorksSection,
  WhoWeHelpSection,
  ChallengesSection,
  WhyChooseSection,
  ExploreNextSection,
  ListYourBusinessSection,
} from '../features/landing';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

export const LandingPage: React.FC = () => {
  // Track scroll depth and time on page
  useEngagementTracking('landing_page');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ListYourBusinessSection />
        <HowItWorksSection />
        <WhoWeHelpSection />
        <ChallengesSection />
        <WhyChooseSection />
        <ExploreNextSection />
      </main>
      <Footer />
    </div>
  );
};
