import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-navy-950 flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* Animated 404 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-[150px] sm:text-[200px] font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent leading-none">
                        404
                    </h1>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                        Oops! The page you're looking for seems to have wandered off.
                        Let's get you back on track.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </motion.div>

                {/* Helpful Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-12 pt-8 border-t border-white/10"
                >
                    <p className="text-gray-500 text-sm mb-4">Popular pages you might be looking for:</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/insights/hub"
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Insights Hub
                        </Link>
                        <Link
                            to="/purple-listings"
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Purple Listings
                        </Link>
                        <Link
                            to="/get-matched"
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Get Matched
                        </Link>
                        <Link
                            to="/contact"
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Contact Us
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFoundPage;
