import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Check, ArrowRight, Zap, Building2, Globe, Shield, Star, Award, Layers, Settings, Users, BarChart, Headphones } from 'lucide-react';
import { Header, Footer, Button } from '../components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listingsApi } from '../services/api';

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

const mainTiers = [
  {
    name: 'Starter',
    price: '10,000',
    description: '10 BANT/MEDDIC/INTENT(BMI)-Qualified Leads / Year',
    icon: Zap,
    features: [
      '10 Exclusive BANT/MEDDIC/INTENT(BMI)-Qualified Leads',
      '1-Month Lead Exclusivity',
      '2-Month Lead Validity',
      'Human Curation with Proof',
      <>FREE <i>Purple</i> Listing (1 Year)</>,
      'Basic CRM / Email Delivery',
      'Full Support & MSA Compliance',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '22,500',
    description: '70 BANT/MEDDIC/INTENT(BMI)-Qualified Leads / Year',
    icon: Building2,
    features: [
      '70 Exclusive BANT/MEDDIC/INTENT(BMI)-Qualified Leads',
      '2-Month Lead Exclusivity',
      '3-Month Lead Validity',
      'All Starter Benefits Included',
      'Monthly Performance Reports',
      'Dashboard Access',
      'Priority Category Placement',
      '30-Day Post-Contract Exclusivity',
      'CRM Audit Tracking',
    ],
    cta: 'Scale Now',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '30,000',
    description: '100 BANT/MEDDIC/INTENT(BMI)-Qualified Leads / Year',
    icon: Globe,
    features: [
      '100 Exclusive BANT/MEDDIC/INTENT(BMI)-Qualified Leads',
      '3-Month Lead Exclusivity',
      '6-Month Lead Validity',
      'All Growth Benefits Included',
      'Top 5 Featured Slot Eligibility',
      'Category-Level Exclusivity Option',
      'Weekly Optimization Insights',
      'Premium Profile Branding',
      'Inbound Priority Routing',
    ],
    cta: 'Upgrade to Pro',
    highlight: false,
  },
];

const enterprise = {
  name: 'Enterprise',
  description: 'Custom Lead Volume',
  icon: Shield,
  features: [
    'Custom Lead Volume',
    'Full CRM / API Integrations',
    'Strategic Consulting Support',
    'Premium Ads (15-Day Campaign Cycles)',
    'Cross-Category Brand Visibility',
    'Dedicated Account Management',
  ],
  cta: 'Contact Sales',
};

const infoSections = [
  {
    title: 'Why Thhiya?',
    subtitle: null,
    icon: Award,
    items: [
      '100% Human-Curated BANT/MEDDIC/INTENT(BMI) Qualification (Budget, Authority, Need, Timeline)',
      'Exclusive Lead Delivery with Validity Period',
      'CRM-Ready Integration & Lead ID Audit Trail',
      'Governed by THHIYA Master Service Agreement (MSA)',
      'Full Transparency & Duplicate-Claim Validation',
    ],
  },
  {
    title: <>FREE <i>Purple</i> Listing</>,
    subtitle: 'Included in Paid Subscriptions',
    icon: Star,
    items: [
      'Dedicated SEO-Optimized Business Profile Page',
      'Industry Category Placement for High-Intent Buyers',
      'Customer Reviews & Ratings Enabled',
      'Priority Matching & Platform Visibility Boost',
      'Eligibility for Top 5 Featured Slot',
      'Inbound Enquiry Enhancement',
    ],
  },
  {
    title: 'How It Works',
    subtitle: null,
    icon: Layers,
    items: [
      'We Identify High-Intent Prospects',
      'We Human-Curate & BANT/MEDDIC/INTENT(BMI) Qualify Each Lead',
      'Leads Delivered via Email or Direct CRM Push',
      'Ongoing Performance Support & Visibility Optimization',
    ],
  },
];

export const PricingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, updateVendorProfile } = useAuth();
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState('');
  const fromSignup = location.state?.fromSignup;
  const selectedPlan: string | undefined = location.state?.selectedPlan;

  const DRAFT_KEY = 'thhiya_signup_draft';
  const PENDING_PLAN_KEY = 'thhiya_pending_plan';

  const handlePlanSelect = async (planName: string) => {
    if (processingPlan) return;

    setActionError('');
    setProcessingPlan(planName);

    try {
    sessionStorage.setItem(PENDING_PLAN_KEY, planName);

    if (fromSignup && !isAuthenticated) {
      // Validate the saved draft before proceeding to checkout
      let draft: any = {};
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) draft = JSON.parse(raw);
      } catch { /* ignore */ }

      const fd = draft.formData ?? {};
      const sm: { countries: string[]; services: string[] }[] = draft.serviceMatrix ?? [];

      // ── Step 0: mandatory account fields ────────────────────────────────
      const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com'];
      const emailDomain = (fd.email ?? '').split('@')[1] ?? '';
      const step0Missing =
        !fd.companyName?.trim() ||
        !fd.email?.trim() ||
        !fd.password?.trim() ||
        !fd.confirmPassword?.trim() ||
        !fd.contactPhone?.trim() ||
        freeProviders.includes(emailDomain.toLowerCase()) ||
        !fd.contactPhone?.startsWith('+');

      if (step0Missing) {
        // Save chosen plan into existing draft then send back to step 0
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, pendingPlan: planName }));
        } catch { /* ignore */ }
        navigate('/signup', {
          state: { selectedPlan: planName, returnToStep: 0, incompleteStep: 0 },
        });
        return;
      }

      // ── Step 1: service coverage ─────────────────────────────────────────
      const validRows = sm.filter(r => r.countries.length > 0 && r.services.length > 0);
      if (validRows.length === 0) {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, pendingPlan: planName }));
        } catch { /* ignore */ }
        navigate('/signup', {
          state: { selectedPlan: planName, returnToStep: 1, incompleteStep: 1 },
        });
        return;
      }

      // ── All steps complete → continue auth flow ──────────────────────────
      navigate('/checkout', { state: { selectedPlan: planName } });
      return;
    }

    if (isAuthenticated) {
      if (planName === 'Free Listing') {
        await listingsApi.updateMyRequestPlan('Free Listing');
        updateVendorProfile({ plan: 'Free Listing' });
        navigate('/profile');
      } else {
        navigate('/checkout', { state: { selectedPlan: planName, mode: 'update' } });
      }
    } else {
      // Normal public pricing page → send to signup with the chosen plan pre-selected
      navigate('/signup', { state: { selectedPlan: planName } });
    }
    } catch (err: any) {
      setActionError(err?.response?.data?.error || err?.message || 'Unable to process your plan selection. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col font-sans">
      {!fromSignup && <Header />}

      <main className={`grow px-4 sm:px-6 lg:px-8 ${fromSignup ? 'pt-12 pb-24' : 'pt-28 pb-24'}`}>
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20 relative">
            {fromSignup && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-0 top-0 hidden md:block"
              >
                <button
                  onClick={() => navigate('/')}
                  className="text-navy-500 hover:text-navy-900 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  Skip for now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6 tracking-tight">
                Plans Built for Decision-Ready Global Expansion.
              </h1>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto leading-relaxed">
                Thhiya delivers human-curated, sales-ready B2B leads and positions your brand on the <span className="font-semibold text-red-600"><i>Purple</i> Listing Page</span> — where serious buyers actively search for trusted vendors.
              </p>
            </motion.div>

            {fromSignup && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 md:hidden"
              >
                <button
                  onClick={() => navigate('/')}
                  className="text-navy-500 hover:text-navy-900 font-medium text-sm flex items-center justify-center gap-1 transition-colors mx-auto"
                >
                  Skip for now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
          >
            {infoSections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white border-t-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group border-x border-b border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-50 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 leading-tight">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-xs font-medium text-red-600 mt-0.5">{section.subtitle}</p>
                    )}
                  </div>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-navy-700">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>


          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900">Choose Your Plan</h2>
              <p className="text-navy-500 mt-2">Scale your revenue with high-intent leads.<br />
                Dedicated Account Manager for all paid plans.</p>
            </div>

            {actionError && (
              <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold text-center">
                {actionError}
              </div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
            >
              {mainTiers.map((tier) => {
                const isPreSelected = selectedPlan === tier.name;
                const isHighlighted = tier.highlight || isPreSelected;
                return (
                  <motion.div
                    key={tier.name}
                    variants={itemVariants}
                    className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${isPreSelected || tier.highlight
                      ? 'bg-white ring-2 ring-red-500 shadow-2xl shadow-red-900/10 scale-105 z-10'
                      : 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1'
                      }`}
                  >
                    {isPreSelected ? (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Your Selection
                      </div>
                    ) : tier.highlight ? (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                        Most Popular
                      </div>
                    ) : null}

                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-lg ${isPreSelected || tier.highlight ? 'bg-red-100 text-red-700' : 'bg-navy-50 text-navy-600'}`}>
                          <tier.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy-900">{tier.name}</h3>
                      </div>

                      <p className="text-sm font-semibold text-navy-500 min-h-[20px]">{tier.description}</p>

                      <div className="flex items-baseline gap-1 mt-6 border-b border-gray-100 pb-6">
                        <span className="text-lg text-navy-400 font-medium">$</span>
                        <span className={`text-5xl font-extrabold tracking-tight ${isPreSelected || tier.highlight ? 'text-red-700' : 'text-navy-900'
                          }`}>
                          {tier.price}
                        </span>
                        <span className="text-navy-400 font-medium ml-1">USD</span>
                      </div>
                    </div>

                    <div className="grow">
                      <ul className="space-y-4 mb-8">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className={`w-5 h-5 shrink-0 ${isPreSelected || tier.highlight ? 'text-red-600' : 'text-green-500'
                              }`} />
                            <span className="text-sm font-medium text-navy-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant={isHighlighted ? 'primary' : 'secondary'}
                      className="w-full justify-center group py-3"
                      disabled={!!processingPlan}
                      onClick={() => handlePlanSelect(tier.name)}
                    >
                      {processingPlan === tier.name ? 'Processing...' : (fromSignup ? `Continue with ${tier.name}` : `Get Started with ${tier.name}`)}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24 relative rounded-4xl overflow-hidden bg-linear-to-br from-navy-900 to-navy-950 p-[2px] shadow-2xl shadow-navy-900/20 group"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-navy-900 rounded-[calc(2rem-2px)] p-8 md:p-12 relative flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex-1 text-center md:text-left z-10 w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider mb-6 border border-red-500/20 mt-4 md:mt-0">
                  <Star className="w-3.5 h-3.5" /> Essential Tier
                </div>
                <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Free Listing</h3>
                <p className="text-navy-200 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                  Establish your presence on Thhiya's <i>Purple</i> Listing directory without spending a dime. Build reputation and increase visibility.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center md:justify-start justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    className="group border border-red-500/50 hover:border-red-500 shadow-lg shadow-red-500/20"
                    disabled={!!processingPlan}
                    onClick={() => handlePlanSelect('Free Listing')}
                  >
                    {processingPlan === 'Free Listing' ? 'Processing...' : 'Start for Free'} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto z-10">
                <div className="bg-navy-950/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-navy-950/80 transition-all duration-300">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                    <Check className="text-red-500 w-5 h-5 bg-red-500/10 rounded-full p-0.5" /> Included Features
                  </h4>
                  <ul className="space-y-4">
                    {[
                      'Standard Business Profile Page',
                      'Basic Category Placement',
                      'Customer Reviews (Basic)',
                      'Featured Vendor Badge',
                      'Direct Link to your Website',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-navy-200">
                        <div className="mt-1 bg-red-500/20 p-1 rounded-full text-red-400 shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 flex justify-start w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="w-full flex flex-col p-8 rounded-2xl bg-white border-l-4 border-navy-800 shadow-lg hover:shadow-xl transition-all duration-300 border-y border-r"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-navy-50 text-navy-900">
                      <enterprise.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900">{enterprise.name}</h3>
                  </div>
                  <p className="text-sm font-semibold text-navy-500">{enterprise.description}</p>
                  <div className="mt-6 border-b border-gray-100 pb-6">
                    <span className="text-4xl font-extrabold text-navy-900">Custom</span>
                    <p className="text-sm text-navy-500 mt-1">Contact for pricing</p>
                  </div>
                </div>

                <div className="grow">
                  <ul className="space-y-4 mb-8">
                    {enterprise.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 shrink-0 text-navy-600" />
                        <span className="text-sm font-medium text-navy-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="secondary" className="w-full justify-center group border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white">
                  {enterprise.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>


            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="lg:col-span-7 space-y-8 pl-0 lg:pl-8 pt-8"
            >
              <div>
                <h3 className="text-3xl font-bold text-navy-900 mb-4">Enterprise-Grade Solutions</h3>
                <p className="text-lg text-navy-600 leading-relaxed">
                  Tailored specifically for high-growth organizations requiring custom volume, deep integration, and strategic partnership. Scale your lead acquisition without limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  {
                    title: "Seamless Integration",
                    desc: "Direct API connectivity with Salesforce, HubSpot, and major CRMs.",
                    icon: Settings
                  },
                  {
                    title: "Dedicated Success Team",
                    desc: "Your personal account manager for strategy and optimization.",
                    icon: Users
                  },
                  {
                    title: "Flexible Volume Scaling",
                    desc: " adjust lead volume quarterly based on your growth targets.",
                    icon: BarChart
                  },
                  {
                    title: "Priority Support SLA",
                    desc: "Guaranteed response times and expedited lead replacement.",
                    icon: Headphones
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600">
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-navy-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>


              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy-400 mb-3">Ideal For</p>
                <div className="flex flex-wrap gap-2">
                  {['Global Enterprises', 'High-Growth Startups', 'Multi-Market Vendors', 'EOR & PEO Providers', 'Staffing Agencies', 'Marketing Agencies', 'Expansion Vendors', 'B2B Outsourcing and Offshoring Companies'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-navy-50 border border-navy-100 text-navy-700 text-xs font-semibold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-navy-950 rounded-xl p-8 flex items-center justify-between gap-4 mt-8">
            <div>
              <p className="text-white font-bold text-sm">Ready to scale without limits?</p>
              <p className="text-navy-300 text-xs mt-0.5">Let's build your custom lead plan.</p>
            </div>
            <Button variant="primary" size="sm" className="shrink-0 whitespace-nowrap">
              Contact Sales <ArrowRight className="w-4 h-4 ml-1 inline" />
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 pt-8 border-t border-gray-200 space-y-2 opacity-80"
          >
            {['What is BMI?',
              'BMI (BANT/MEDDIC/INTENT): Our proprietary framework combining Budget, Authority, Need, Timeline (BANT) with strategic MEDDIC insights (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion) and real-time behavioral Intent.',
              'All leads are human-curated with documented qualification proof, ensuring they are decision-ready before reaching your inbox.',
              'Subscription payments due upfront. No refunds. Terms governed by THHIYA Master Service Agreement (MSA).',
            ].map((note) => (
              <p key={note} className="text-navy-500 text-xs">{note}</p>
            ))}
          </motion.div>
        </div>
      </main>

      {!fromSignup && <Footer />}
    </div>
  );
};
