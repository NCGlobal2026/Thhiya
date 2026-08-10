import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Blog post type for card display
export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    readTime: string;
    publishedAt: string;
    author: string;
}

interface BlogCardProps {
    post: BlogPost;
    index?: number;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, index = 0 }) => {
    const categoryColors: Record<string, { bg: string; text: string }> = {
        'Market Expansion': { bg: 'bg-red-100', text: 'text-red-700' },
        'Cost Analysis': { bg: 'bg-navy-100', text: 'text-navy-700' },
        'How-To Guide': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    };

    const colors = categoryColors[post.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group h-full"
        >
            <Link to={`/blogs/${post.id}`} className="block h-full">
                <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card hover:shadow-2xl hover:border-red-200 transition-all duration-300"
                >
                    {/* Image Placeholder with Gradient */}
                    <div className="relative h-48 sm:h-52 md:h-56 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute inset-0">
                            <div className="absolute top-4 left-4 w-20 h-20 bg-red-500/20 rounded-full blur-2xl" />
                            <div className="absolute bottom-4 right-4 w-32 h-32 bg-navy-600/30 rounded-full blur-2xl" />
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                                    backgroundSize: '24px 24px'
                                }}
                            />
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                {post.category}
                            </span>
                        </div>

                        {/* Hover Arrow */}
                        <div className="absolute bottom-4 right-4 z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                whileHover={{ opacity: 1, x: 0 }}
                                className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <ArrowRight className="w-5 h-5 text-white" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{post.readTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(post.publishedAt)}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-3 leading-snug group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                            {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3 flex-grow">
                            {post.excerpt}
                        </p>

                        {/* Read More Link */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 group-hover:text-red-700 transition-colors">
                                Read Article
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.article>
    );
};

export default BlogCard;
