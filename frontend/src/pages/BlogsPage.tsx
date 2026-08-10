import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ArrowRight, Globe2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Header, Footer, Container } from '../components';
import { BlogCard } from '../components/blog';
import { blogService, BlogListItem } from '../services/blogService';
import { Link } from 'react-router-dom';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

// Loading skeleton for blog cards
const BlogCardSkeleton: React.FC = () => (
    <div className="h-full bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-48 sm:h-52 md:h-56 bg-gray-200" />
        <div className="p-5 sm:p-6">
            <div className="flex gap-4 mb-3">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-full bg-gray-200 rounded mb-2" />
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>
    </div>
);

export const BlogsPage: React.FC = () => {
    useEngagementTracking('blogs');

    const [searchQuery, setSearchQuery] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('');

    // Debounce search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch blogs from API
    const { data: blogsData, isLoading, error } = useQuery({
        queryKey: ['blogs', debouncedSearch, selectedCategory],
        queryFn: () => blogService.getBlogs({
            limit: 12,
            search: debouncedSearch,
            category: selectedCategory
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch categories for potential filtering
    const { data: categories } = useQuery({
        queryKey: ['blog-categories'],
        queryFn: () => blogService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const blogs = blogsData?.data || [];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
                {/* Decorative Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, #E63946 1px, transparent 1px),
                linear-gradient(to bottom, #E63946 1px, transparent 1px)
              `,
                            backgroundSize: '60px 60px'
                        }}
                    />
                </div>

                {/* Floating Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 20, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-20 right-[10%] w-96 h-96 bg-red-600/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            y: [0, 30, 0],
                            x: [0, -20, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-10 left-[5%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl"
                    />
                </div>

                <Container className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white/90 mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-red-400" />
                            Insights & Resources
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                        >
                            Expert Insights for{' '}
                            <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                                Global Expansion
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto"
                        >
                            Discover strategies, best practices, and expert analysis to help your business
                            navigate international markets with confidence. From partner selection to cost
                            optimization, we've got you covered.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap items-center justify-center gap-4"
                        >
                            <Link
                                to="/get-matched"
                                className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-red-600 text-white font-semibold rounded-xl sm:rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/40 hover:bg-red-700 transition-all"
                            >
                                Get Matched with Partners
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/insights/hub"
                                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                Explore Countries
                            </Link>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* Search and Filter Section */}
            <section className="py-6 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 backdrop-blur-md bg-gray-50/90">
                <Container>
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        {/* Category Filters */}
                        {categories && categories.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${!selectedCategory
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    All
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setSelectedCategory(cat.name === selectedCategory ? '' : cat.name)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${cat.name === selectedCategory
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat.name} <span className="opacity-75 text-xs ml-1">({cat.count})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            {/* Blog Grid Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10 sm:mb-12 md:mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
                            <BookOpen className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                                {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                            Expand Your Global Knowledge
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                            Practical insights and strategic guidance for businesses looking to scale internationally
                        </p>
                    </motion.div>

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">Failed to load articles. Please try again.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {[1, 2, 3].map((i) => (
                                <BlogCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Blog Cards Grid */}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {blogs.map((post: BlogListItem, index: number) => (
                                <BlogCard
                                    key={post._id}
                                    post={{
                                        id: post.slug,
                                        title: post.title,
                                        excerpt: post.excerpt,
                                        content: '', // Not needed for card
                                        category: post.category,
                                        readTime: post.readTime,
                                        publishedAt: post.publishedAt,
                                        author: post.author
                                    }}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && blogs.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No articles found. Check back soon!</p>
                        </div>
                    )}
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" />
                </div>

                <Container className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Start Your{' '}
                            <span className="text-red-500">Global Expansion</span> Journey?
                        </h2>
                        <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
                            Connect with curated partners who can help you navigate international markets,
                            manage compliance, and scale your operations with confidence.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/get-matched"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/40 hover:bg-red-700 transition-all"
                            >
                                Get Started Today
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                Talk to an Expert
                            </Link>
                        </div>
                    </motion.div>
                </Container>
            </section>

            <Footer />
        </div>
    );
};

export default BlogsPage;
