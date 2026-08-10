import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScrollManager } from './components/routing/ScrollManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isRateLimitError } from './utils/errorHandler';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AnalyticsTracker } from './components/analytics/AnalyticsTracker';
import { ToastProvider, ToastInitializer } from './contexts';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Lazy load all pages for code splitting (reduces initial bundle size)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const InsightDetailPage = lazy(() => import('./pages/InsightDetailPage').then(m => ({ default: m.InsightDetailPage })));
const InsightsHubPage = lazy(() => import('./pages/InsightsHubPage').then(m => ({ default: m.InsightsHubPage })));
const PurpleListingsPage = lazy(() => import('./pages/PurpleListingsPage').then(m => ({ default: m.PurpleListingsPage })));
const PurpleListingsCategoryPage = lazy(() => import('./pages/PurpleListingsCategoryPage').then(m => ({ default: m.PurpleListingsCategoryPage })));
const PurpleListingDetailPage = lazy(() => import('./pages/PurpleListingDetailPage').then(m => ({ default: m.PurpleListingDetailPage })));
const GTMToolkitsPage = lazy(() => import('./pages/GTMToolkitsPage').then(m => ({ default: m.GTMToolkitsPage })));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const BANTFormPage = lazy(() => import('./pages/BANTFormPage').then(m => ({ default: m.BANTFormPage })));
const ContactFormPage = lazy(() => import('./pages/ContactFormPage').then(m => ({ default: m.ContactFormPage })));
const WhyThhiyaPage = lazy(() => import('./pages/WhyThhiyaPage'));
const CountryServicePage = lazy(() => import('./pages/CountryServicePage'));
const ServiceComparisonPage = lazy(() => import('./pages/ServiceComparisonPage').then(m => ({ default: m.ServiceComparisonPage })));
const PayrollCalculator = lazy(() => import('./features/payroll-calculator/PayrollCalculator').then(m => ({ default: m.PayrollCalculator })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const BlogsPage = lazy(() => import('./pages/BlogsPage').then(m => ({ default: m.BlogsPage })));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const ListBusinessPage = lazy(() => import('./pages/ListBusinessPage').then(m => ({ default: m.ListBusinessPage })));
const RequestListingPage = lazy(() => import('./pages/RequestListingPage').then(m => ({ default: m.RequestListingPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Loading spinner for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const BACKEND_HEALTH_URLS = [
  'https://api-thhiya-production.onrender.com/health',
  'https://api-thhiya-development.onrender.com/health',
] as const;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Retry logic: don't retry on rate limit errors
      retry: (failureCount, error) => {
        // Don't retry rate limit errors
        if (isRateLimitError(error)) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Stale time: 30 minutes (increased from 5 min for bandwidth savings)
      staleTime: 30 * 60 * 1000,
      // Cache time: 2 hours (keeps data in memory longer)
      gcTime: 2 * 60 * 60 * 1000,
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
});

const AuthOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return <>{children}</>;
};

const GuestOnlyRoute: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({ children, redirectTo = '/profile' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    let isCancelled = false;

    const pingBackend = async () => {
      if (isCancelled) return;

      await Promise.allSettled(
        BACKEND_HEALTH_URLS.map((url) =>
          fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
            keepalive: true,
          }),
        ),
      );
    };

    void pingBackend();
    const intervalId = window.setInterval(() => {
      void pingBackend();
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <ToastInitializer />
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <Router>
              <ScrollManager />
              <AnalyticsTracker />
              <CookieConsentBanner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/insights" element={<InsightDetailPage />} />
                  <Route path="/insights/hub" element={<InsightsHubPage />} />
                  <Route path="/insights/service/:serviceSlug" element={<ServiceComparisonPage />} />
                  <Route path="/purple-listings" element={<PurpleListingsPage />} />
                  <Route path="/purple-listings/c/:categorySlug" element={<PurpleListingsCategoryPage />} />
                  <Route path="/purple-listings/:slug" element={<PurpleListingDetailPage />} />
                  <Route path="/gtm-toolkits" element={<GTMToolkitsPage />} />
                  <Route path="/country-services/:country/:service" element={<CountryServicePage />} />
                  <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/get-matched" element={<BANTFormPage />} />
                  <Route path="/contact" element={<ContactFormPage />} />
                  <Route path="/why-thhiya" element={<WhyThhiyaPage />} />
                  <Route path="/payroll-test" element={<PayrollCalculator />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                  <Route path="/signup" element={<ListBusinessPage />} />
                  <Route path="/list-business" element={<ListBusinessPage />} />
                  <Route path="/request-listing" element={<AuthOnlyRoute><RequestListingPage /></AuthOnlyRoute>} />
                  <Route path="/login" element={<GuestOnlyRoute redirectTo="/"><LoginPage /></GuestOnlyRoute>} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/checkout" element={<AuthOnlyRoute><CheckoutPage /></AuthOnlyRoute>} />
                  <Route path="/profile" element={<AuthOnlyRoute><ProfilePage /></AuthOnlyRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Router>
          </QueryClientProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
