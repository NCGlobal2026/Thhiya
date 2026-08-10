import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Shield, CheckCircle, X } from 'lucide-react';
import { Company } from '../types/company.types';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyCardProps {
    company: Company;
}

interface ScoreData {
    intentScore: number;
    scoringFactors?: {
        marketMomentum: string;
        userSentiment: string;
        featureInnovation: string;
        transparency: string;
    };
}

const ScoreBar: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-navy-900">{value}</span>
    </div>
);

const getIntentBadgeClasses = (score: number) => {
    if (score <= 5) {
        return {
            glow: 'from-red-400 to-rose-400',
            border: 'border-red-100/60',
            icon: 'text-red-600',
            scoreText: 'from-red-600 via-rose-500 to-red-600',
            label: 'text-red-600',
        };
    }

    if (score < 8) {
        return {
            glow: 'from-amber-400 to-orange-400',
            border: 'border-amber-100/60',
            icon: 'text-amber-600',
            scoreText: 'from-amber-600 via-orange-500 to-amber-600',
            label: 'text-amber-600',
        };
    }

    return {
        glow: 'from-purple-500 to-violet-500',
        border: 'border-purple-100/70',
        icon: 'text-purple-600',
        scoreText: 'from-purple-700 via-violet-600 to-purple-700',
        label: 'text-purple-600',
    };
};

const buildFallbackLogo = (company: Company) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3f4f6&color=6b7280`;

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
    const [showModal, setShowModal] = useState(false);

    const scoreData = useMemo<ScoreData | null>(() => {
        if (company.intentScore === undefined || company.intentScore === null) {
            return null;
        }

        return {
            intentScore: company.intentScore,
            scoringFactors: company.scoringFactors,
        };
    }, [company.intentScore, company.scoringFactors]);

    const logoSrc = company.logo || buildFallbackLogo(company);
    const intentBadgeClasses = scoreData ? getIntentBadgeClasses(scoreData.intentScore) : null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="h-full"
            >
                <Card className="group flex flex-col h-full border border-gray-100 hover:border-navy-100 transition-all hover:shadow-lg duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-16 h-16 rounded-lg border border-gray-100 p-2 flex items-center justify-center bg-white shadow-sm shrink-0">
                                <img
                                    src={logoSrc}
                                    alt={`${company.name} logo`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = buildFallbackLogo(company);
                                    }}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                    <div className="flex-1 min-w-0 container-inline-size overflow-hidden whitespace-nowrap">
                                        <span 
                                            className="inline-block max-w-full truncate group-hover:max-w-none group-hover:animate-[marquee-pingpong_4s_ease-in-out_infinite_alternate]"
                                            title={company.name}
                                        >
                                            {company.name}
                                        </span>
                                    </div>
                                    <Shield className="w-4 h-4 text-red-500 fill-red-50 shrink-0" />
                                </h3>
                                <div className="flex items-center gap-2 mt-1 flex-nowrap">
                                    {scoreData && (
                                        <div className="relative flex items-center gap-1.5 group mt-1">
                                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${intentBadgeClasses?.glow} rounded-lg blur-[2px] opacity-20 transition duration-500`}></div>
                                            <div className={`relative flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded-md border ${intentBadgeClasses?.border} shadow-sm`}>
                                                <TrendingUp className={`w-3.5 h-3.5 ${intentBadgeClasses?.icon}`} />
                                                <motion.span
                                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                                    transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                                                    className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${intentBadgeClasses?.scoreText} bg-[length:200%_auto]`}
                                                >
                                                    {scoreData.intentScore}
                                                    <span className="text-xs font-medium text-gray-400">/10</span>
                                                </motion.span>
                                                <span className={`ml-0.5 text-[9px] uppercase tracking-wider ${intentBadgeClasses?.label} font-semibold opacity-80`}>
                                                    INTENT
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-4 grow line-clamp-2">
                        {company.shortDescription}
                    </p>

                    <div className="space-y-3 mb-6">
                        {company.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                        {scoreData && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="shrink-0 px-3 py-2 rounded-lg bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 transition-colors whitespace-nowrap"
                            >
                                Intent Score
                            </button>
                        )}
                        <Link to={`/purple-listings/${company.slug}`} className="flex-1 min-w-0">
                            <Button variant="primary" size="sm" className="w-full bg-red-600! hover:bg-red-700! focus:ring-red-500! group whitespace-nowrap">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </motion.div>

            <AnimatePresence>
                {showModal && scoreData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 16 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                aria-label="Close intent score modal"
                                title="Close"
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg border border-gray-100 p-1.5 flex items-center justify-center bg-white shadow-sm">
                                    <img
                                        src={logoSrc}
                                        alt={company.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = buildFallbackLogo(company);
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy-900">{company.name}</h3>
                                    <p className="text-xs text-gray-500">Intent Score Analysis</p>
                                </div>
                            </div>

                            <div className="flex items-end justify-center gap-2 mb-4 relative py-1">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-md opacity-10 rounded-full"></div>
                                <motion.span
                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                    transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
                                    className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-[length:200%_auto] relative z-10"
                                >
                                    {scoreData.intentScore}
                                </motion.span>
                                <span className="text-xl text-gray-400 mb-2 font-medium">/10</span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(scoreData.intentScore / 10) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                />
                            </div>

                            {scoreData.scoringFactors ? (
                                <div className="mb-5">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Score Breakdown</p>
                                    <ScoreBar label="Market Momentum" value={scoreData.scoringFactors.marketMomentum} />
                                    <ScoreBar label="User Sentiment" value={scoreData.scoringFactors.userSentiment} />
                                    <ScoreBar label="Feature Innovation" value={scoreData.scoringFactors.featureInnovation} />
                                    <ScoreBar label="Transparency" value={scoreData.scoringFactors.transparency} />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-5">Score based on market momentum, user sentiment, innovation, and transparency.</p>
                            )}

                            <Link to={`/purple-listings/${company.slug}`} onClick={() => setShowModal(false)}>
                                <Button variant="primary" className="w-full bg-red-600! hover:bg-red-700! justify-center">
                                    View Full Profile
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
