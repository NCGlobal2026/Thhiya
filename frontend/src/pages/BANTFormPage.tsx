import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Clock, Users, CheckCircle2, Globe } from 'lucide-react';
import { Header, Footer, Container } from '../components';
import { BANTForm } from '../components/bant';
import { useEngagementTracking } from '../hooks/useEngagementTracking';

const benefits = [
    {
        icon: Shield,
        title: 'Curated Partners',
        description: 'All providers are vetted for quality and compliance',
    },
    {
        icon: Clock,
        title: 'Fast Matching',
        description: 'Get matched within 24-48 hours',
    },
    {
        icon: Users,
        title: 'Expert Support',
        description: 'Dedicated team to guide your expansion',
    },
    {
        icon: Globe,
        title: '26 Countries',
        description: 'Global coverage for your needs',
    },
];

export const BANTFormPage: React.FC = () => {
    // Track scroll depth and time on page
    useEngagementTracking('bant_form_page');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Header />

            <main className="pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24">
                <Container>
                    {/* Back Link */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </motion.div>

                    <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                        {/* Left Column - Benefits */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 order-2 lg:order-1"
                        >
                            <div className="lg:sticky lg:top-32">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-950 mb-4">
                                    Find Your Ideal Global Expansion Partner
                                </h1>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Whether you're looking for EOR services, payroll solutions, or market entry support,
                                    we'll connect you with the right partners for your specific needs.
                                </p>

                                {/* Benefits Grid */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
                                    {benefits.map((benefit, index) => {
                                        const Icon = benefit.icon;
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 + index * 0.1 }}
                                                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                                            >
                                                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-5 h-5 text-navy-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-navy-900 mb-1">{benefit.title}</h3>
                                                    <p className="text-sm text-gray-600">{benefit.description}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Trust Indicators */}
                                <div className="bg-navy-50 rounded-xl p-5 border border-navy-100">
                                    <div className="flex items-center gap-2 text-navy-900 font-medium mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        What happens next?
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 bg-navy-200 text-navy-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
                                            We review your requirements within 24 hours
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 bg-navy-200 text-navy-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
                                            Shortlist 2-3 best-fit providers for your needs
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 bg-navy-200 text-navy-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
                                            Connect you directly or share detailed insights
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-3 order-1 lg:order-2"
                        >
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl p-5 sm:p-6 md:p-8">
                                <BANTForm source="bant-page" />
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </main>

            <Footer />
        </div>
    );
};

export default BANTFormPage;
