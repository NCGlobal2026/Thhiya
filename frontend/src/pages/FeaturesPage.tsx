import React, { useState } from 'react';
import { Header, Footer } from '../components';
import { ArrowRight } from 'lucide-react';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { GA4Events } from '../services/analytics';

const serviceCards = [
  {
    title: "Vendor Reviews & Listing",
    frontsubtitle: "Trust through transparency",
    frontDescription: "Independent Reviews: Real client feedback & ratings",
    description: "Explore detailed vendor profiles with authentic client reviews, service ratings, and performance metrics. Make informed decisions with transparent insights from real users.",
    buttonText: "View all vendors",
    navigationPath: "/vendor-review"
  },
  {
    title: "Subscription Model",
    frontsubtitle: "Unlimited insights, one monthly plan",
    frontDescription: "Monthly Plans: Unlimited access & insights",
    description: "Get unlimited access to market intelligence, compliance data, and vendor comparisons. Choose from our plans designed for growing businesses.",
    buttonText: "View Plans & Pricing",
    navigationPath: "/vendor-review"
  },
  {
    title: "Demand Generation",
    frontsubtitle: "Grow your pipeline with qualified leads",
    frontDescription: "Quality Leads: Pre-qualified buyer connections",
    description: "Connect with decision-ready businesses actively seeking your services. Our demand generation engine delivers high-quality leads that convert.",
    buttonText: "Get leads",
    navigationPath: "/vendor-review"
  },
  {
    title: "Advertising Solutions",
    frontsubtitle: "Boost visibility, win more clients",
    frontDescription: "Premium Visibility: Boost your marketplace presence",
    description: "Increase your reach with targeted advertising solutions. Get featured placement, sponsored listings, and priority visibility to attract more clients.",
    buttonText: "Advertise now",
    navigationPath: "/vendor-review"
  }
];

const FeaturesPage: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  // Track scroll depth and time on page
  useEngagementTracking('features_page');

  const handleCardClick = (index: number) => {
    // Track card flip interaction
    GA4Events.selectContent({
      contentType: 'feature_card',
      contentId: serviceCards[index].title.toLowerCase().replace(/\s+/g, '_'),
      itemId: `card_${index}`,
    });
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNavigation = (path: string, cardTitle: string) => {
    // Track CTA click
    GA4Events.selectContent({
      contentType: 'feature_cta',
      contentId: cardTitle.toLowerCase().replace(/\s+/g, '_'),
    });
    // TODO: Implement navigation
    console.log('Navigate to:', path);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Why <span className="text-red-500">Thhiya</span>?
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Our Intelligent Edge
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCards.map((card, index) => (
              <div
                key={index}
                className="relative h-80 cursor-pointer perspective-1000"
                onClick={() => handleCardClick(index)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flippedCards[index] ? 'rotate-y-180' : ''}`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                    <p className="text-red-500 font-semibold mb-2">{card.frontsubtitle}</p>
                    <p className="text-gray-600">{card.frontDescription}</p>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 w-full h-full bg-red-500 text-white border border-red-500 rounded-lg shadow-lg p-6 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-white flex-grow">{card.description}</p>
                    <button
                      className="mt-4 bg-white text-red-500 px-4 py-2 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigation(card.navigationPath, card.title);
                      }}
                    >
                      {card.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;