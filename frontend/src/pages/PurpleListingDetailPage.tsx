import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Star, Shield, CheckCircle, XCircle, Calendar, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { ContactModal } from '../components/contact';
import { useEngagementTracking } from '../hooks/useEngagementTracking';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../services/api';
import { Company } from '../features/purple-listings/types/company.types';
import { normalizeSupportedCountries } from '../features/purple-listings/utils/normalizeSupportedCountries';

interface ProviderReview {
    id: string;
    name: string;
    role?: string;
    rating?: number;
    comment: string;
    createdAt?: string;
}

const normalizeCompany = (company: any): Company => ({
    id: company.id ?? company._id ?? company.slug,
    slug: company.slug,
    name: company.name,
    logo: company.logo ?? '',
    shortDescription: company.shortDescription ?? '',
    fullDescription: company.fullDescription ?? '',
    rating: Number(company.rating ?? 0),
    reviewCount: Number(company.reviewCount ?? 0),
    categories: Array.isArray(company.categories) ? company.categories : [],
    tags: Array.isArray(company.tags) ? company.tags : [],
    foundedYear: Number(company.foundedYear ?? 0),
    headquarters: company.headquarters ?? '',
    website: company.website ?? '',
    pricing: {
        startingAt: company.pricing?.startingAt ?? '',
        model: company.pricing?.model ?? '',
        freeTrial: Boolean(company.pricing?.freeTrial ?? false),
    },
    features: Array.isArray(company.features) ? company.features : [],
    pros: Array.isArray(company.pros) ? company.pros : [],
    cons: Array.isArray(company.cons) ? company.cons : [],
    screenshots: Array.isArray(company.screenshots) ? company.screenshots : [],
    featured: Boolean(company.featured ?? false),
    verifiedAt: company.verifiedAt,
    supportedCountries: normalizeSupportedCountries(company.supportedCountries ?? []),
    serviceFeatures: Array.isArray(company.serviceFeatures) ? company.serviceFeatures : [],
    intentScore: company.intentScore,
    scoringFactors: company.scoringFactors,
    sentimentAnalysis: company.sentimentAnalysis,
});

const buildFallbackLogo = (company: Company) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280`;

export const PurpleListingDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [showInsights, setShowInsights] = React.useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);

    const { data: company, isLoading } = useQuery({
        queryKey: ['purple-listing-detail', slug],
        queryFn: async () => {
            if (!slug) return null;
            const result = await listingsApi.getPurpleListingBySlug(slug);
            return normalizeCompany(result);
        },
        enabled: Boolean(slug),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const isPremium = company?.featured === true;
    const providerReviews: ProviderReview[] = [];

    const handleWriteReviewClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { redirectTo: location.pathname } });
            return;
        }
        setIsReviewModalOpen(true);
    };

    useEngagementTracking(company ? `purple_listing_${company.slug}` : 'purple_listing_detail');

    useEffect(() => {
        if (!isLoading && !company) {
            // keep render on not-found state
        }
    }, [company, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="grow flex items-center justify-center">
                    <div className="text-center text-gray-500">Loading company profile...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h2>
                        <Link to="/purple-listings" className="text-red-600 hover:text-red-700 font-medium">
                            &larr; Back to Listings
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <div className={`bg-white border-b ${isPremium ? 'border-yellow-200 bg-gradient-to-br from-yellow-50/30 to-white' : 'border-gray-200'}`}>
                <Container>
                    <div className="pt-24 pb-12">
                        <Link to="/purple-listings" className="inline-flex items-center text-gray-500 hover:text-red-600 mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Listings
                        </Link>

                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            <div className={`w-32 h-32 rounded-xl border p-4 bg-white shadow-sm shrink-0 flex items-center justify-center
                                ${isPremium ? 'border-yellow-300 shadow-yellow-100' : 'border-gray-200'}`}
                            >
                                <img
                                    src={company.logo || buildFallbackLogo(company)}
                                    alt={company.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = buildFallbackLogo(company);
                                    }}
                                />
                            </div>

                            <div className="grow">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                    <h1 className="text-3xl md:text-4xl font-bold text-navy-900">{company.name}</h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {isPremium && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-sm">
                                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                                Featured Premium Vendor
                                            </span>
                                        )}
                                        {company.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-navy-50 text-navy-700 border border-navy-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.floor(company.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <span className="font-semibold text-navy-900">{company.rating}</span>
                                        <span className="text-sm">({company.reviewCount} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <span>{company.headquarters}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span>Founded {company.foundedYear}</span>
                                    </div>
                                </div>

                                <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                                    {company.fullDescription}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 min-w-[200px]">
                                <a href={company.website} target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full bg-red-600! hover:bg-red-700!">
                                        Visit Website
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                </a>
                                {company.intentScore !== undefined && (
                                    <div className={`text-center p-4 rounded-lg border 
                                        ${isPremium
                                            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm shadow-green-100'
                                            : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className={`text-sm mb-1 font-semibold flex items-center justify-center gap-1.5 ${isPremium ? 'text-emerald-800' : 'text-gray-700'}`}>
                                            {isPremium && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                                            {!isPremium && <TrendingUp className="w-3.5 h-3.5 text-gray-500" />}
                                            Market Momentum
                                            <div className="relative group">
                                                <span className={`cursor-help text-xs rounded-full w-4 h-4 inline-flex items-center justify-center ${isPremium ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>?</span>
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                    Score based on market momentum, user sentiment, innovation, and transparency.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-center gap-1 relative py-1 mb-2 mt-1">
                                            {isPremium && <div className="absolute inset-0 blur-md opacity-10 rounded-full bg-emerald-400"></div>}
                                            {isPremium ? (
                                                <motion.p
                                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                                    transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
                                                    className="text-5xl font-black bg-clip-text text-transparent bg-[length:200%_auto] relative z-10 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600"
                                                >
                                                    {company.intentScore}
                                                </motion.p>
                                            ) : (
                                                <p className="text-4xl font-black text-gray-800 relative z-10 tracking-tight">
                                                    {company.intentScore}
                                                </p>
                                            )}
                                            <p className={`text-sm mb-1.5 font-medium relative z-10 ${isPremium ? 'text-emerald-600/80' : 'text-gray-400'}`}>/10</p>
                                        </div>
                                        <div className={`w-full rounded-full h-1.5 mt-2 mb-3 relative overflow-hidden ${isPremium ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(company.intentScore / 10) * 100}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`absolute top-0 left-0 h-1.5 rounded-full ${isPremium ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gray-400'}`}
                                            />
                                        </div>

                                        {company.scoringFactors && isPremium && (
                                            <div className="text-left space-y-2 mt-4 pt-4 border-t border-green-200">
                                                <div className="text-xs font-semibold text-green-800 mb-2">Score Breakdown:</div>
                                                <div className="text-xs flex justify-between">
                                                    <span className="font-medium text-green-700">Momentum:</span> <span className="text-green-900 font-bold">{company.scoringFactors.marketMomentum}</span>
                                                </div>
                                                <div className="text-xs flex justify-between">
                                                    <span className="font-medium text-green-700">Sentiment:</span> <span className="text-green-900 font-bold">{company.scoringFactors.userSentiment}</span>
                                                </div>
                                                <div className="text-xs flex justify-between">
                                                    <span className="font-medium text-green-700">Innovation:</span> <span className="text-green-900 font-bold">{company.scoringFactors.featureInnovation}</span>
                                                </div>
                                                <div className="text-xs flex justify-between">
                                                    <span className="font-medium text-green-700">Transparency:</span> <span className="text-green-900 font-bold">{company.scoringFactors.transparency}</span>
                                                </div>
                                            </div>
                                        )}
                                        {company.scoringFactors && !isPremium && (
                                            <div className="text-xs text-center mt-4 pt-3 border-t border-gray-200">
                                                <div className="flex flex-col items-center justify-center gap-1 mb-2">
                                                    <span className="text-gray-500 font-medium">Want full market insights?</span>
                                                </div>
                                                <Link to="/pricing" className="inline-block mt-1 text-emerald-600 font-semibold hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors w-full border border-emerald-100/50">
                                                    Upgrade to Premium
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-12">
                        {company.sentimentAnalysis && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                                        What People Are Saying
                                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            Updated: {new Date(company.sentimentAnalysis.lastUpdated).toLocaleDateString()}
                                        </span>
                                    </h2>
                                    <Button
                                        onClick={() => setShowInsights(!showInsights)}
                                        className={`py-2! px-4! text-sm ${!showInsights ? 'bg-red-600! hover:bg-red-700! text-white' : 'bg-gray-200! hover:bg-gray-300! text-gray-800!'}`}
                                    >
                                        {showInsights ? 'Hide Insights' : 'View More Insights'}
                                    </Button>
                                </div>

                                {showInsights && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                        <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                                            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                                <span className="text-xl">👍</span> Positive Signals
                                            </h3>
                                            <ul className="space-y-3">
                                                {company.sentimentAnalysis.positiveReviews.map((review: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                        <span>{review}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
                                            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                                                <span className="text-xl">👎</span> Critical Feedback
                                            </h3>
                                            <ul className="space-y-3">
                                                {company.sentimentAnalysis.negativeReviews.map((review: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                                        <span>{review}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-6">Key Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {company.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 shadow-sm">
                                        <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-navy-900">User Reviews</h2>
                                <Button
                                    onClick={handleWriteReviewClick}
                                    className="bg-navy-900! hover:bg-navy-800! text-white"
                                >
                                    Write a Review
                                </Button>
                            </div>

                            {providerReviews.length === 0 ? (
                                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
                                    <h3 className="text-lg font-semibold text-navy-900 mb-2">No reviews yet</h3>
                                    <p className="text-gray-600 mb-5">Be the first to share your experience with {company.name}.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {providerReviews.map((review) => {
                                        const initials = review.name
                                            .split(' ')
                                            .filter(Boolean)
                                            .map(part => part[0]?.toUpperCase())
                                            .slice(0, 2)
                                            .join('') || 'U';
                                        const rating = Math.max(0, Math.min(5, Math.round(review.rating ?? 0)));

                                        return (
                                            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-navy-900">{review.name}</h4>
                                                            {review.role && <p className="text-xs text-gray-500">{review.role}</p>}
                                                        </div>
                                                    </div>
                                                    {rating > 0 && (
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-3">"{review.comment}"</p>
                                                {review.createdAt && (
                                                    <p className="text-xs text-gray-400">
                                                        Posted on {new Date(review.createdAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {company.screenshots && company.screenshots.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-navy-900 mb-6">Screenshots</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {company.screenshots.map((src, idx) => (
                                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                            <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className={`rounded-2xl p-6 text-white shadow-xl sticky top-24 border
                            ${isPremium
                                ? 'bg-gradient-to-b from-navy-800 to-navy-900 border-yellow-500/30'
                                : 'bg-navy-700 border-navy-600'}`}
                        >
                            {isPremium && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-navy-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                    Priority Vendor
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-4 mt-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border
                                    ${isPremium ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-white/10 border-white/10'}`}
                                >
                                    <Shield className={`w-5 h-5 ${isPremium ? 'text-yellow-400' : 'text-red-500'}`} />
                                </div>
                                <h3 className="text-xl font-bold">Featured Provider</h3>
                            </div>
                            <p className="text-navy-100 mb-6">
                                {company.name} has been vetted by our team for compliance, reliability, and service quality.
                            </p>

                            <div className={`space-y-4 pt-6 border-t ${isPremium ? 'border-navy-700/50' : 'border-navy-600'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-navy-200">Free Trial</span>
                                    <span className="font-semibold text-white">{company.pricing.freeTrial ? 'Available' : 'Not Available'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-navy-200">Best For</span>
                                    <span className="font-semibold text-white">{company.tags[0] || 'Global teams'}</span>
                                </div>
                            </div>

                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="block mt-8">
                                <button className={`w-full py-3 px-4 font-bold rounded-lg transition-colors shadow-lg
                                    ${isPremium
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-navy-900 hover:from-yellow-400 hover:to-yellow-500 shadow-yellow-900/20 hover:-translate-y-0.5 transform duration-200'
                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/20'}`}
                                >
                                    Get Started
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </Container>

            <Footer />

            <ContactModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                source={`write-review-${company.slug}`}
            />
        </div>
    );
};
