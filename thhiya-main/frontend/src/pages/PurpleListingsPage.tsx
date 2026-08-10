import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { CompanyCard } from '../features/purple-listings/components/CompanyCard';
import { CompanyCardSkeleton } from '../features/purple-listings/components/CompanyCardSkeleton';
import { useCategories } from '../features/purple-listings/hooks/useCategories';
import { useCompanies } from '../features/purple-listings/hooks/useCompanies';
import { useAuth } from '../contexts/AuthContext';
import { Search, ArrowRight, LayoutGrid, Sparkles, Building2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const PurpleListingsPage: React.FC = () => {
  useEngagementTracking('purple_listings_exploration');
  const navigate = useNavigate();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>('accounting-compliances');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const categories = useCategories();

  // Simulated Loading on Category Switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500); // 500ms fake load for smoother feel
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const previewCompanies = useCompanies({
    categorySlug: selectedCategory || undefined,
    searchQuery,
    limit: 1000
  })
    .sort((a, b) => {
      const scoreA = a.intentScore ?? Number.NEGATIVE_INFINITY;
      const scoreB = b.intentScore ?? Number.NEGATIVE_INFINITY;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  const currentCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-red-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Premium Service Providers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Explore Global Services
            </h1>
            <p className="text-xl text-navy-100 max-w-2xl mx-auto leading-relaxed mb-12">
              Find the right partners for your international expansion.
              Select a category to preview the highest intent-score providers.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Search Bar Section - Positioned below Header/Hero */}
      <section className="relative z-20 -mt-8 px-4">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-3 flex items-center border border-gray-100 ring-4 ring-white/50">
              <div className="pl-4 pr-2">
                <Search className="w-6 h-6 text-red-500" />
              </div>
              <input
                type="text"
                placeholder="Search companies (e.g., Deel, Remote, Payroll)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-2 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="sr-only">Clear</span>
                  ✕
                </button>
              )}
              <button
                className="hidden sm:block bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:from-red-500 hover:to-red-600 transition-all active:scale-95"
                onClick={() => {
                  const element = document.getElementById('listings-content');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Search
              </button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <section id="listings-content" className="flex-1 py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Sidebar - Categories Selection */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-32">
                <div className="p-4 border-b border-gray-200 bg-gray-50 hidden lg:block">
                  <h2 className="font-bold text-navy-900 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-red-600" />
                    Categories
                  </h2>
                </div>
                <nav className="p-2 lg:p-2">
                  <ul className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:space-y-1 scrollbar-hide">
                    {categories.map((category) => (
                      <li key={category.id} className="flex-shrink-0">
                        <button
                          onClick={() => setSelectedCategory(category.slug)}
                          className={cn(
                            "w-full text-left px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 flex items-center justify-between group whitespace-nowrap",
                            selectedCategory === category.slug
                              ? "bg-red-50 text-red-600 font-medium ring-1 ring-red-100 lg:ring-0 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-navy-900 bg-gray-50 lg:bg-transparent"
                          )}
                        >
                          <span>{category.name}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full ml-2 transition-colors",
                            selectedCategory === category.slug
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-200 lg:bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          )}>
                            {category.companyCount}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Right Section - Preview Content */}
            <div className="lg:col-span-9">
              {/* Preview Header */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory || 'all'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                      <h2 className="text-2xl font-bold text-navy-900 mb-2">
                        {currentCategory ? currentCategory.name : 'All Companies'}
                      </h2>
                      <p className="text-gray-600 text-sm max-w-2xl">
                        {currentCategory?.description || "Browse our curated list of global service providers."}
                      </p>
                    </div>

                    {selectedCategory && (
                      <button
                        onClick={() => navigate(`/purple-listings/c/${selectedCategory}`)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-navy-900 font-medium rounded-lg hover:bg-gray-50 hover:border-red-200 hover:text-red-700 transition-all shadow-sm flex-shrink-0 group"
                      >
                        View Full List
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  // Show Skeletons
                  [...Array(6)].map((_, i) => (
                    <CompanyCardSkeleton key={i} />
                  ))
                ) : (
                  // Show Data
                  <AnimatePresence mode="popLayout">
                    {previewCompanies.map(company => (
                      <CompanyCard key={company.id} company={company} />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {!isLoading && previewCompanies.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500">Try adjusting your search terms.</p>
                </motion.div>
              )}
            </div>

          </div>
        </Container>
      </section>

      <ListingFAB />

      {/* Platform Legal Notice */}
      <div className="pb-8">
        <Container>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">
            <h4 className="font-bold text-navy-900 mb-2">Platform Notice</h4>
            <p className="mb-2">Thhiya curates global service providers to help businesses explore expansion solutions. Listings are based on independent research and publicly available information.</p>
            <p className="mb-2">Inclusion on Thhiya does not constitute endorsement or partnership unless expressly stated. Users are encouraged to independently evaluate providers before engagement.</p>
            <p>All trademarks and logos belong to their respective owners and are used for identification purposes only.</p>
          </div>
        </Container>
      </div>

      <Footer />
    </div>
  );
};

// ─── Auth-aware Listing FAB ───────────────────────────────────────────────────
const ListingFAB: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/request-listing');
      return;
    }

    navigate('/signup', { state: { source: 'purple-listings-fab', fromListings: true } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <button
        onClick={handleClick}
        aria-label={isAuthenticated ? 'List your business' : 'Sign up to list your business'}
        className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-sm shadow-2xl hover:shadow-red-500/40 hover:scale-105 transition-all duration-300"
      >
        <Building2 className="w-4 h-4 shrink-0" />
        List My Business
      </button>
    </motion.div>
  );
};
