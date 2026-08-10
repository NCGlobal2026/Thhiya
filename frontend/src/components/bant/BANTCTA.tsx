import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Users } from 'lucide-react';
import { BANTModal } from './BANTModal';

interface BANTCTAProps {
    variant?: 'banner' | 'card' | 'inline' | 'floating' | 'compact';
    source?: string;
    className?: string;
}

export const BANTCTA: React.FC<BANTCTAProps> = ({
    variant = 'banner',
    source = 'cta',
    className = '',
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Banner variant - full width promotional banner
    if (variant === 'banner') {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 sm:p-8 md:p-10 ${className}`}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-400 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/90 mb-4">
                                <Sparkles className="w-4 h-4" />
                                Find Your Perfect Match
                            </div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                                Ready to Expand Globally?
                            </h3>
                            <p className="text-white/70 text-sm sm:text-base max-w-lg">
                                Get matched with curated partners tailored to your needs. No sign-up required.
                            </p>
                        </div>

                        <button
                            onClick={openModal}
                            className="group flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/40"
                        >
                            Get My Matches
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>

                <BANTModal isOpen={isModalOpen} onClose={closeModal} source={source} />
            </>
        );
    }

    // Card variant - standalone card component
    if (variant === 'card') {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className={`bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-navy-200 hover:shadow-xl transition-all cursor-pointer ${className}`}
                    onClick={openModal}
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                        Find Your Ideal Partner
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Submit your requirements and get matched with curated global expansion partners.
                    </p>
                    <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </motion.div>

                <BANTModal isOpen={isModalOpen} onClose={closeModal} source={source} />
            </>
        );
    }

    // Inline variant - simple inline CTA
    if (variant === 'inline') {
        return (
            <>
                <button
                    onClick={openModal}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-medium transition-colors ${className}`}
                >
                    <Sparkles className="w-4 h-4" />
                    Get Matched with Partners
                </button>

                <BANTModal isOpen={isModalOpen} onClose={closeModal} source={source} />
            </>
        );
    }

    // Floating variant - fixed position floating button
    if (variant === 'floating') {
        return (
            <>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openModal}
                    className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-semibold shadow-lg shadow-red-900/30 hover:shadow-xl transition-all ${className}`}
                >
                    <Target className="w-5 h-5" />
                    <span className="hidden sm:inline">Find Partners</span>
                </motion.button>

                <BANTModal isOpen={isModalOpen} onClose={closeModal} source={source} />
            </>
        );
    }

    // Compact variant - small button for headers/navbars
    if (variant === 'compact') {
        return (
            <>
                <button
                    onClick={openModal}
                    className={`flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg font-medium transition-colors ${className}`}
                >
                    <Users className="w-4 h-4" />
                    Get Matched
                </button>

                <BANTModal isOpen={isModalOpen} onClose={closeModal} source={source} />
            </>
        );
    }

    return null;
};

export default BANTCTA;
