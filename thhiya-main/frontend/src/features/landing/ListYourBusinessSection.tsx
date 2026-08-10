import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe2, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const benefits = [
    {
        icon: Globe2,
        title: 'Global Reach',
        desc: 'Get discovered by companies actively looking for EOR, payroll & HR services across 100+ markets.',
    },
    {
        icon: ShieldCheck,
        title: 'Featured Listing',
        desc: 'Build instant credibility with a trusted vendor profile that showcases your compliance & capabilities.',
    },
    {
        icon: TrendingUp,
        title: 'Quality Leads',
        desc: 'Connect with pre-qualified buyers who match your service coverage — not just casual browsers.',
    },
];

const perks = [
    'Free to list — no credit card needed',
    'Setup in under 10 minutes',
    'Appear in targeted search results immediately',
    'Upgrade to Premium anytime',
];

export const ListYourBusinessSection: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
    <section className="relative overflow-hidden bg-[#0b1325] py-20 sm:py-28">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-red-600/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-red-800/10 blur-3xl" />
            {/* Grid lines */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-14">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-5"
                >
                    <Building2 className="w-3.5 h-3.5" />
                    For Service Providers
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.08 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
                >
                    List My Business
                    <br />
                    <span className="text-red-500">Reach More Clients</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto"
                >
                    Join hundreds of EOR, payroll, and HR service providers already growing their client base on Thhiya — the marketplace built for global workforce solutions.
                </motion.p>
            </div>

            {/* Benefit cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                {benefits.map((b, i) => (
                    <motion.div
                        key={b.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                        className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-red-500/30 rounded-2xl p-6 transition-all duration-300"
                    >
                        <div className="w-11 h-11 rounded-xl bg-red-600/20 flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                            <b.icon className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-white font-bold text-base mb-2">{b.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* CTA row */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white/5 border border-white/10 rounded-3xl px-8 py-8"
            >
                {/* Perks list */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                    {perks.map(p => (
                        <li key={p} className="flex items-center gap-2.5 text-sm text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                            {p}
                        </li>
                    ))}
                </ul>

                {/* Button */}
                <button
                    type="button"
                    onClick={() => navigate(isAuthenticated ? '/request-listing' : '/signup', isAuthenticated ? undefined : { state: { source: 'landing-list-business' } })}
                    className="shrink-0 group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02]"
                >
                    <Building2 className="w-4 h-4" />
                    List My Business — It's Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </motion.div>
        </div>
    </section>
    );
};
