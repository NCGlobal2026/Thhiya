import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, Tag, ArrowRight, Share2 } from 'lucide-react';
import { Header, Footer, Container } from '../components';
import { BlogCard } from '../components/blog';
import { blogService, Blog, BlogListItem } from '../services/blogService';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

// Loading skeleton for blog content
const ContentSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-8" />
        <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded" />
            ))}
        </div>
    </div>
);

export const BlogDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    useEngagementTracking(`blog_${slug}`);

    // Fetch blog by slug
    const { data: blog, isLoading, error } = useQuery({
        queryKey: ['blog', slug],
        queryFn: () => blogService.getBlogBySlug(slug!),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch related blogs
    const { data: relatedBlogs } = useQuery({
        queryKey: ['blog-related', slug],
        queryFn: () => blogService.getRelatedBlogs(slug!, 3),
        enabled: !!slug && !!blog,
        staleTime: 5 * 60 * 1000,
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle share
    const handleShare = async () => {
        if (navigator.share && blog) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled or share failed silently
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // 404 state
    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <Container className="py-32 text-center">
                    <h1 className="text-4xl font-bold text-navy-900 mb-4">Article Not Found</h1>
                    <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </Container>
                <Footer />
            </div>
        );
    }

    // Parse content for Table of Contents and inject IDs
    const { processedContent, toc } = React.useMemo(() => {
        if (!blog?.content) return { processedContent: '', toc: [] };

        const headers: { id: string; text: string }[] = [];
        let content = blog.content;

        // Regex to find h2 tags, extract text, and inject IDs
        content = content.replace(/<h2>(.*?)<\/h2>/g, (match, text) => {
            const cleanText = text.replace(/<[^>]*>/g, ''); // Strip inner HTML
            const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            headers.push({ id, text: cleanText });
            return `<h2 id="${id}" class="scroll-mt-24">${text}</h2>`;
        });

        return { processedContent: content, toc: headers };
    }, [blog]);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Banner */}
            <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 right-[10%] w-72 h-72 bg-red-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-[5%] w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
                </div>

                <Container className="relative z-10">
                    {/* Back link */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            to="/blogs"
                            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                    </motion.div>

                    {isLoading ? (
                        <div className="animate-pulse">
                            <div className="h-6 w-24 bg-white/20 rounded-full mb-4" />
                            <div className="h-12 w-3/4 bg-white/20 rounded mb-4" />
                            <div className="h-6 w-1/2 bg-white/20 rounded" />
                        </div>
                    ) : blog && (
                        <>
                            {/* Category Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="inline-block px-4 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-full mb-4">
                                    {blog.category}
                                </span>
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl"
                            >
                                {blog.title}
                            </motion.h1>

                            {/* Meta info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-300 text-sm sm:text-base"
                            >
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{blog.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(blog.publishedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{blog.readTime}</span>
                                </div>
                            </motion.div>
                        </>
                    )}
                </Container>
            </section>

            {/* Article Content */}
            <section className="py-12 sm:py-16 md:py-20">
                <Container>
                    <div className="max-w-3xl mx-auto relative group">
                        {isLoading ? (
                            <ContentSkeleton />
                        ) : blog && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {/* Table of Contents */}
                                {toc.length > 0 && (
                                    <div className="hidden xl:block absolute left-full ml-12 top-0 w-64 h-full">
                                        <div className="sticky top-24">
                                            <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                                In this article
                                            </h4>
                                            <nav className="flex flex-col gap-3">
                                                {toc.map((item) => (
                                                    <a
                                                        key={item.id}
                                                        href={`#${item.id}`}
                                                        className="text-sm text-gray-500 hover:text-red-600 transition-colors line-clamp-2 block"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                    >
                                                        {item.text}
                                                    </a>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                )}

                                {/* Article content - rendered as HTML */}
                                <article
                                    className="prose prose-lg max-w-none
                    prose-headings:text-navy-900 prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-ul:my-4 prose-ul:pl-6
                    prose-li:text-gray-700 prose-li:mb-2
                    prose-strong:text-navy-900 prose-strong:font-semibold
                    prose-em:text-gray-600
                    prose-blockquote:border-l-4 prose-blockquote:border-red-500 
                    prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 
                    prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                    prose-a:text-red-600 prose-a:hover:text-red-700"
                                    dangerouslySetInnerHTML={{ __html: processedContent }}
                                />

                                {/* Tags */}
                                {blog.tags && blog.tags.length > 0 && (
                                    <div className="mt-10 pt-6 border-t border-gray-200">
                                        <div className="flex items-center flex-wrap gap-2">
                                            <Tag className="w-4 h-4 text-gray-500" />
                                            {blog.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Share button */}
                                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share this article
                                    </button>

                                    <Link
                                        to="/get-matched"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Get Matched
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </Container>
            </section>

            {/* Related Articles */}
            {relatedBlogs && relatedBlogs.length > 0 && (
                <section className="py-12 sm:py-16 bg-gray-50">
                    <Container>
                        <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-8 text-center">
                            Related Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedBlogs.map((post: BlogListItem, index: number) => (
                                <BlogCard
                                    key={post._id}
                                    post={{
                                        id: post.slug,
                                        title: post.title,
                                        excerpt: post.excerpt,
                                        content: '',
                                        category: post.category,
                                        readTime: post.readTime,
                                        publishedAt: post.publishedAt,
                                        author: post.author
                                    }}
                                    index={index}
                                />
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                </div>

                <Container className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Need Help with Global Expansion?
                        </h2>
                        <p className="text-gray-300 mb-8">
                            Connect with curated partners who specialize in your target markets.
                        </p>
                        <Link
                            to="/get-matched"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-2xl shadow-xl hover:bg-red-700 transition-all"
                        >
                            Get Matched with Partners
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </Container>
            </section>

            <Footer />
        </div>
    );
};

export default BlogDetailPage;
