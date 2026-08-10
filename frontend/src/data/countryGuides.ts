export interface CountryGuideConfig {
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  audienceHeading: string;
  audience: string[];
  outroTitle: string;
  outroDescription: string;
  outroActions: string[];
  serviceOrder: string[];
}

// Standard service slugs used across all countries
const STANDARD_SERVICE_ORDER = [
  'eor-peo',
  'global-payroll',
  'incorporation-entity-setup',
  'staffing-talent-acquisition',
  'hris',
  'accounting',
  'tax',
  'compliance',
  'msa',
  'software-solutions',
  'marketing-agencies',
  'payroll-calculator',
  'visa-immigration',
  'mca',
  'bank-account-opening',
  'benefits',
  'contractor-management',
  'global-payments'
];

export const COUNTRY_GUIDES: Record<string, CountryGuideConfig> = {
  'argentina': {
    heroTitle: 'Argentina - Complete Business Services Guide',
    heroSubtitle: 'Streamline Your Argentina Expansion with Tailored Solutions',
    description:
      "Navigating Argentina's employment, compliance, and HR landscape can be complex. Thhiya simplifies your expansion with data-driven insights, transparent pricing, and curated providers across EOR, PEO, and related services.",
    audienceHeading: 'Who We Help',
    audience: [
      'Growth leaders scaling teams across Argentina',
      'Startups hiring remotely or setting up their first Argentine entity',
      'Enterprises optimizing compliance, payroll, and HR tech solutions'
    ],
    outroTitle: 'Ready to Expand to Argentina?',
    outroDescription:
      'Thhiya connects you with pre-vetted service providers, transparent pricing, and expert guidance across all 11 service categories.',
    outroActions: [
      'Start Your Argentina Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'australia': {
    heroTitle: 'Australia - Complete Business Services Guide',
    heroSubtitle: 'Streamline Your Australia Expansion with Tailored Solutions',
    description:
      'Navigating business services in Australia can feel overwhelming. Thhiya simplifies your expansion using data-based insights, clear pricing, and trusted partners across all service areas.',
    audienceHeading: 'Who We Help',
    audience: [
      'Growth leaders expanding teams across Australian states',
      'Startups setting up local entities or hiring remotely in Australia',
      'Enterprises optimising compliance, payroll, and HR technology in the Australian market'
    ],
    outroTitle: 'Ready to Expand to Australia?',
    outroDescription:
      'Thhiya connects you with pre-vetted service providers, transparent pricing, and expert guidance across all 11 service categories.',
    outroActions: [
      'Start Your Australia Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'austria': {
    heroTitle: 'Austria - Complete Business Services Guide',
    heroSubtitle: 'Streamline Your Austria Expansion with Tailored Solutions',
    description:
      "Navigating Austria's employment, compliance, and HR landscape can be complex. Thhiya simplifies your expansion with data-driven insights, transparent pricing, and curated providers across EOR, PEO, and related services.",
    audienceHeading: 'Who We Help',
    audience: [
      'Growth leaders scaling teams across Austria',
      'Startups hiring remotely or setting up their first Austrian entity',
      'Enterprises optimizing compliance, payroll, and HR tech solutions'
    ],
    outroTitle: 'Ready to Expand to Austria?',
    outroDescription:
      'Thhiya connects you with pre-vetted service providers, transparent pricing, and expert guidance across all 11 service categories.',
    outroActions: [
      'Start Your Austria Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'belgium': {
    heroTitle: 'Belgium - Complete Business Services Guide',
    heroSubtitle: 'Streamline Your Belgium Expansion with Tailored Solutions',
    description:
      "Navigating Belgium's employment, compliance, and HR landscape can be complex. Thhiya simplifies your expansion with data-driven insights, transparent pricing, and curated providers across EOR, PEO, and related services.",
    audienceHeading: 'Who We Help',
    audience: [
      'Growth leaders scaling teams across Belgium',
      'Startups hiring remotely or setting up their first Belgian entity',
      'Enterprises optimizing compliance, payroll, and HR tech solutions'
    ],
    outroTitle: 'Ready to Expand to Belgium?',
    outroDescription:
      'Thhiya connects you with pre-vetted service providers, transparent pricing, and expert guidance across all 11 service categories.',
    outroActions: [
      'Start Your Belgium Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'brazil': {
    heroTitle: 'Brazil - Complete Business Services Guide',
    heroSubtitle: 'Streamline Your Brazil Expansion with Tailored Solutions',
    description:
      "Navigating Brazil's employment, compliance, and HR landscape can be complex. Thhiya simplifies your expansion with data-driven insights, transparent pricing, and curated providers across EOR, PEO, and related services.",
    audienceHeading: 'Who We Help',
    audience: [
      'Growth leaders scaling teams across Brazil',
      'Startups hiring remotely or setting up their first Brazilian entity',
      'Enterprises optimizing compliance, payroll, and HR tech solutions'
    ],
    outroTitle: 'Ready to Expand to Brazil?',
    outroDescription:
      'Thhiya connects you with pre-vetted service providers, transparent pricing, and expert guidance across all 11 service categories.',
    outroActions: [
      'Start Your Brazil Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'canada': {
    heroTitle: 'Canada - Complete Business Services Guide',
    heroSubtitle: 'Streamline Your Canada Expansion with Tailored Solutions',
    description:
      'Navigating business services in Canada can be complex. Thhiya simplifies your expansion with data-driven insights, transparent pricing, and curated providers.',
    audienceHeading: 'Who We Help',
    audience: [
      'Growth leaders expanding teams across Canadian provinces',
      'Startups hiring remotely or setting up Canadian entities',
      'Enterprises optimizing compliance, payroll, and HR tech solutions'
    ],
    outroTitle: 'Ready to Expand to Canada?',
    outroDescription:
      'Thhiya connects you with pre-vetted service providers, transparent pricing, and expert guidance.',
    outroActions: [
      'Start Your Canada Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'china': {
    heroTitle: 'China - Complete Business Services Guide',
    heroSubtitle: 'Navigate China Market Entry with Expert Guidance',
    description:
      'Entering the Chinese market requires careful planning and compliance. Thhiya provides comprehensive insights to help you succeed.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies seeking to establish presence in China',
      'Businesses hiring local talent through EOR solutions',
      'Enterprises navigating Chinese regulatory requirements'
    ],
    outroTitle: 'Ready to Enter China?',
    outroDescription:
      'Thhiya connects you with curated Chinese service providers and local expertise.',
    outroActions: [
      'Start Your China Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'france': {
    heroTitle: 'France - Complete Business Services Guide',
    heroSubtitle: 'Expand to France with Confidence',
    description:
      'French employment law is complex. Thhiya simplifies your expansion with expert guidance on compliance, payroll, and HR solutions.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies expanding into the French market',
      'Startups hiring French talent remotely',
      'Enterprises managing French employment compliance'
    ],
    outroTitle: 'Ready to Expand to France?',
    outroDescription:
      'Thhiya connects you with pre-vetted French service providers and local expertise.',
    outroActions: [
      'Start Your France Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'germany': {
    heroTitle: 'Germany - Complete Business Services Guide',
    heroSubtitle: 'Navigate German Business Requirements with Expertise',
    description:
      'German employment regulations are among the strictest in Europe. Thhiya helps you navigate compliance and find the right service providers.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies establishing German operations',
      'Startups hiring German talent through EOR',
      'Enterprises optimizing German compliance and payroll'
    ],
    outroTitle: 'Ready to Expand to Germany?',
    outroDescription:
      'Thhiya connects you with curated German service providers.',
    outroActions: [
      'Start Your Germany Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'india': {
    heroTitle: 'India - Complete Business Services Guide',
    heroSubtitle: 'Unlock India\'s Talent Pool with Tailored Solutions',
    description:
      'India offers a vast talent pool and growing market. Thhiya simplifies your India expansion with comprehensive insights and trusted providers.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies building remote teams in India',
      'Startups establishing Indian entities',
      'Enterprises managing Indian payroll and compliance'
    ],
    outroTitle: 'Ready to Expand to India?',
    outroDescription:
      'Thhiya connects you with pre-vetted Indian service providers.',
    outroActions: [
      'Start Your India Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'ireland': {
    heroTitle: 'Ireland - Complete Business Services Guide',
    heroSubtitle: 'Establish Your European Hub in Ireland',
    description:
      'Ireland is a strategic gateway to Europe. Thhiya helps you navigate Irish business services and compliance requirements.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies establishing European headquarters in Ireland',
      'Startups hiring Irish talent',
      'Enterprises managing Irish compliance and payroll'
    ],
    outroTitle: 'Ready to Expand to Ireland?',
    outroDescription:
      'Thhiya connects you with curated Irish service providers.',
    outroActions: [
      'Start Your Ireland Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'japan': {
    heroTitle: 'Japan - Complete Business Services Guide',
    heroSubtitle: 'Navigate Japanese Business Culture and Regulations',
    description:
      'Entering Japan requires understanding unique business practices and regulations. Thhiya provides expert guidance.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies entering the Japanese market',
      'Startups hiring Japanese talent',
      'Enterprises managing Japanese employment compliance'
    ],
    outroTitle: 'Ready to Expand to Japan?',
    outroDescription:
      'Thhiya connects you with curated Japanese service providers.',
    outroActions: [
      'Start Your Japan Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'netherlands': {
    heroTitle: 'Netherlands - Complete Business Services Guide',
    heroSubtitle: 'Expand to the Netherlands with Confidence',
    description:
      'The Netherlands is a hub for international business. Thhiya helps you navigate Dutch employment laws and find the right providers.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies establishing Dutch operations',
      'Startups hiring through Dutch EOR providers',
      'Enterprises managing Dutch compliance'
    ],
    outroTitle: 'Ready to Expand to Netherlands?',
    outroDescription:
      'Thhiya connects you with pre-vetted Dutch service providers.',
    outroActions: [
      'Start Your Netherlands Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'singapore': {
    heroTitle: 'Singapore - Complete Business Services Guide',
    heroSubtitle: 'Your Gateway to Asia-Pacific Business',
    description:
      'Singapore is a leading business hub in Asia. Thhiya simplifies your Singapore expansion with expert insights.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies establishing APAC headquarters in Singapore',
      'Startups hiring Singaporean talent',
      'Enterprises managing Singapore compliance'
    ],
    outroTitle: 'Ready to Expand to Singapore?',
    outroDescription:
      'Thhiya connects you with curated Singaporean service providers.',
    outroActions: [
      'Start Your Singapore Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'south-korea': {
    heroTitle: 'South Korea - Complete Business Services Guide',
    heroSubtitle: 'Navigate South Korean Business Requirements',
    description:
      'South Korea offers significant business opportunities. Thhiya provides comprehensive guidance for your Korean expansion.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies entering the Korean market',
      'Startups hiring Korean talent through EOR',
      'Enterprises managing Korean compliance'
    ],
    outroTitle: 'Ready to Expand to South Korea?',
    outroDescription:
      'Thhiya connects you with curated Korean service providers.',
    outroActions: [
      'Start Your South Korea Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'united-arab-emirates': {
    heroTitle: 'UAE - Complete Business Services Guide',
    heroSubtitle: 'Your Gateway to Middle East Business',
    description:
      'The UAE offers a strategic location and business-friendly environment. Thhiya helps you navigate UAE business services.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies establishing Middle East operations in UAE',
      'Startups hiring UAE-based talent',
      'Enterprises managing UAE compliance and free zones'
    ],
    outroTitle: 'Ready to Expand to UAE?',
    outroDescription:
      'Thhiya connects you with curated UAE service providers.',
    outroActions: [
      'Start Your UAE Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'united-kingdom': {
    heroTitle: 'United Kingdom - Complete Business Services Guide',
    heroSubtitle: 'Navigate UK Business Services with Expertise',
    description:
      'The UK is a major business hub. Thhiya helps you understand UK employment law and find the right service providers.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies expanding to the UK market',
      'Startups hiring UK-based talent',
      'Enterprises managing UK compliance and payroll'
    ],
    outroTitle: 'Ready to Expand to UK?',
    outroDescription:
      'Thhiya connects you with curated UK service providers.',
    outroActions: [
      'Start Your UK Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  },
  'united-states': {
    heroTitle: 'United States - Complete Business Services Guide',
    heroSubtitle: 'Navigate the US Market with Confidence',
    description:
      'The US offers the world\'s largest market. Thhiya helps you understand state-specific regulations and find the right providers.',
    audienceHeading: 'Who We Help',
    audience: [
      'Companies expanding into the US market',
      'Startups hiring US-based talent',
      'Enterprises managing multi-state US compliance'
    ],
    outroTitle: 'Ready to Expand to United States?',
    outroDescription:
      'Thhiya connects you with curated US service providers.',
    outroActions: [
      'Start Your US Expansion Today',
      'Select a Subscription Model',
      'Select an Advertising Solution'
    ],
    serviceOrder: STANDARD_SERVICE_ORDER
  }
};
