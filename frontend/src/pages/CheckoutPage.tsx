import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ArrowRight, Shield, Lock, Zap, Building2, Globe,
    ChevronDown, ChevronUp, AlertCircle, CheckCircle2, X,
    User, Mail, Phone, Globe2, Briefcase, MapPin, Settings2
} from 'lucide-react';
import { BrandMark } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { listingsApi } from '../services/api';

// ─── Plan data (mirrors PricingPage) ─────────────────────────────────────────

const PLANS = [
    {
        name: 'Starter',
        priceUSD: 10000,
        priceDisplay: '10,000',
        description: '10 BANT/MEDDIC/INTENT(BMI)-Qualified Leads / Year',
        icon: Zap,
        features: [
            '10 Exclusive BANT/MEDDIC/INTENT(BMI)-Qualified Leads',
            '2-Month Lead Validity',
            '2-Week Lead Exclusivity',
            'Human Verification with Proof',
            'FREE Purple Listing (1 Year)',
            'Basic CRM / Email Delivery',
            'Full Support & MSA Compliance',
        ],
    },
    {
        name: 'Growth',
        priceUSD: 22500,
        priceDisplay: '22,500',
        description: '70 BANT/MEDDIC/INTENT(BMI)-Qualified Leads / Year',
        icon: Building2,
        popular: true,
        features: [
            '70 Exclusive BANT/MEDDIC/INTENT(BMI)-Qualified Leads',
            'All Starter Benefits Included',
            'Monthly Performance Reports',
            'Dashboard Access',
            'Priority Category Placement',
            '30-Day Post-Contract Exclusivity',
            'CRM Audit Tracking',
        ],
    },
    {
        name: 'Pro',
        priceUSD: 30000,
        priceDisplay: '30,000',
        description: '100 BANT/MEDDIC/INTENT(BMI)-Qualified Leads / Year',
        icon: Globe,
        features: [
            '100 Exclusive BANT/MEDDIC/INTENT(BMI)-Qualified Leads',
            'All Growth Benefits Included',
            'Top 5 Featured Slot Eligibility',
            'Category-Level Exclusivity Option',
            'Weekly Optimization Insights',
            'Premium Profile Branding',
            'Inbound Priority Routing',
        ],
    },
];

const DRAFT_KEY = 'thhiya_signup_draft';
const PENDING_PLAN_KEY = 'thhiya_pending_plan';

// ─── Component ────────────────────────────────────────────────────────────────
export const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const checkoutMode = (location.state as any)?.mode as 'update' | 'onboarding' | undefined;
    const locationSelectedPlan = (location.state as any)?.selectedPlan as string | undefined;
    const persistedPlan = sessionStorage.getItem(PENDING_PLAN_KEY) || undefined;

    // ── Resolve initial plan ──────────────────────────────────────────────────
    const initialPlanName: string = locationSelectedPlan ?? persistedPlan ?? 'Growth';
    const [selectedPlanName, setSelectedPlanName] = useState(initialPlanName);
    const plan = PLANS.find(p => p.name === selectedPlanName) ?? PLANS[1];

    const { user, vendorProfile, isAuthenticated } = useAuth();

    const profileContactName = vendorProfile?.contactPerson?.name || vendorProfile?.contactName || '';
    const profileContactRole = vendorProfile?.contactPerson?.role || vendorProfile?.contactRole || '';
    const profileContactPhone = vendorProfile?.contactPerson?.phone || vendorProfile?.contactPhone || '';

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!locationSelectedPlan && !persistedPlan) {
            navigate('/pricing', { state: { fromCheckout: true } });
        }
    }, [isAuthenticated, locationSelectedPlan, navigate, persistedPlan]);

    // ── Draft state ───────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        companyName: vendorProfile?.companyName || user?.displayName || '',
        website: vendorProfile?.website || '',
        email: user?.email || '',
        contactPhone: profileContactPhone,
        contactName: profileContactName || user?.displayName || '',
        contactRole: profileContactRole,
    });
    const [serviceMatrix, setServiceMatrix] = useState<{ countries: string[]; services: string[] }[]>([]);
    const [draftRestored, setDraftRestored] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
            try {
                const draft = JSON.parse(raw);
                if (draft.formData) {
                    setForm(prev => ({
                        companyName: draft.formData.companyName || prev.companyName,
                        website: draft.formData.website || prev.website,
                        email: draft.formData.email || prev.email,
                        contactPhone: draft.formData.contactPhone || prev.contactPhone,
                        contactName: draft.formData.contactName || prev.contactName,
                        contactRole: draft.formData.contactRole || prev.contactRole,
                    }));
                }
                if (draft.serviceMatrix) setServiceMatrix(draft.serviceMatrix);
                setDraftRestored(true);
            } catch {
                // ignore corrupted draft
            }
        }
    }, []);

    useEffect(() => {
        setForm(prev => ({
            companyName: prev.companyName || vendorProfile?.companyName || user?.displayName || '',
            website: prev.website || vendorProfile?.website || '',
            email: prev.email || user?.email || '',
            contactPhone: prev.contactPhone || profileContactPhone,
            contactName: prev.contactName || profileContactName || user?.displayName || '',
            contactRole: prev.contactRole || profileContactRole,
        }));
    }, [
        user?.displayName,
        user?.email,
        vendorProfile?.companyName,
        vendorProfile?.website,
        profileContactName,
        profileContactRole,
        profileContactPhone,
    ]);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'free' | 'updated-paid' | 'updated-free'>('idle');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<'none' | 'paid' | 'free'>('none');
    const isUpdateFlow = checkoutMode === 'update';

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.companyName.trim()) errs.companyName = 'Required';
        if (!form.email.trim()) errs.email = 'Required';
        if (!form.contactPhone.trim()) errs.contactPhone = 'Required';
        if (!form.contactName.trim()) errs.contactName = 'Required';
        if (!termsAccepted) errs.terms = 'You must accept the terms to proceed';
        return errs;
    };

    // ── Demo mode: skip payment gateway, show onboard directly ───────────────
    const handlePay = async () => {
        if (isSubmitting !== 'none') return;

        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }
        try {
            setIsSubmitting('paid');
            await listingsApi.updateMyRequestPlan(selectedPlanName);
            sessionStorage.removeItem(DRAFT_KEY);
            sessionStorage.removeItem(PENDING_PLAN_KEY);
            setPaymentStatus(isUpdateFlow ? 'updated-paid' : 'success');
        } catch {
            setFormErrors(prev => ({ ...prev, terms: 'Unable to finalize checkout. Please try again.' }));
        } finally {
            setIsSubmitting('none');
        }
    };

    const handleFreeListing = async () => {
        if (isSubmitting !== 'none') return;

        try {
            setIsSubmitting('free');
            await listingsApi.updateMyRequestPlan('Free Listing');
            sessionStorage.removeItem(DRAFT_KEY);
            sessionStorage.removeItem(PENDING_PLAN_KEY);
            setPaymentStatus(isUpdateFlow ? 'updated-free' : 'free');
        } catch {
            setFormErrors(prev => ({ ...prev, terms: 'Unable to apply free listing right now. Please try again.' }));
        } finally {
            setIsSubmitting('none');
        }
    };

    // ── Services coverage chips ───────────────────────────────────────────────
    const allServices = serviceMatrix.flatMap(r => r.services);
    const allCountries = serviceMatrix.flatMap(r => r.countries);
    const uniqueServices = [...new Set(allServices)];
    const uniqueCountries = [...new Set(allCountries)];

    // ─── Success / Welcome Onboard Screen ────────────────────────────────────
    if (paymentStatus !== 'idle') {
        const isFree = paymentStatus === 'free' || paymentStatus === 'updated-free';
        const isUpdateDone = paymentStatus === 'updated-paid' || paymentStatus === 'updated-free';
        return (
            <div className="min-h-screen bg-navy-50 flex flex-col items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border border-navy-100"
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isFree ? 'bg-navy-100' : 'bg-red-100'
                        }`}>
                        <CheckCircle2 className={`w-10 h-10 ${isFree ? 'text-navy-700' : 'text-red-600'}`} />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {isUpdateDone ? 'Plan Updated Successfully' : (isFree ? 'Free Listing Activated' : `${plan.name} Plan Activated`)}
                    </p>
                    <h1 className="text-3xl font-black text-navy-900 mb-3">{isUpdateDone ? 'Plan update confirmed' : 'Welcome onboard'}</h1>
                    <p className="text-navy-500 mb-1 text-sm">
                        Hi <span className="font-bold text-navy-900">{form.companyName || 'there'}</span>, {isUpdateDone ? 'your listing plan has been updated.' : 'your listing setup is complete.'}
                    </p>
                    <p className="text-navy-500 mb-6 text-sm">
                        {isUpdateDone
                            ? <>Your current plan is now <span className="font-bold text-red-600">{isFree ? 'Free Listing' : plan.name}</span>.</>
                            : (isFree
                                ? 'Your free listing is active. You can upgrade to a paid plan anytime.'
                                : <>Your <span className="font-bold text-red-600">{plan.name} Plan</span> is active. Our team will contact <span className="font-semibold">{form.email}</span> within 24 hours.</>)}
                    </p>

                    {isFree && (
                        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-4 mb-6 text-left">
                            <p className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3">Free Listing Includes</p>
                            <ul className="space-y-2">
                                {[
                                    'Basic company profile listing',
                                    'Listed in 1 service category',
                                    'Visible to buyers on Thhiya directory',
                                    'No lead generation (upgrade to unlock)',
                                    'No exclusivity or priority placement',
                                ].map(f => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-navy-600">
                                        <Check className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full py-3 rounded-2xl text-white font-bold transition-colors bg-red-600 hover:bg-red-700"
                        >
                            Go to Profile <ArrowRight className="inline w-4 h-4 ml-1" />
                        </button>
                        {isFree && (
                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full py-3 rounded-2xl border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 transition-colors"
                            >
                                Upgrade to a Paid Plan
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Main Checkout ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-navy-50 font-sans">
            {/* ── Top bar ── */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <BrandMark />
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <Lock className="w-3.5 h-3.5 text-green-500" />
                    Secure Checkout
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* ══════════════════════════════════════════
            LEFT — Order Summary
        ══════════════════════════════════════════ */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Plan Switcher */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Select Your Plan</p>
                        <div className="space-y-3">
                            {PLANS.map(p => {
                                const Icon = p.icon;
                                const active = p.name === selectedPlanName;
                                return (
                                    <button
                                        key={p.name}
                                        disabled={isSubmitting !== 'none'}
                                        onClick={() => {
                                            setSelectedPlanName(p.name);
                                            sessionStorage.setItem(PENDING_PLAN_KEY, p.name);
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${active
                                            ? 'border-red-500 bg-red-50 shadow-md shadow-red-100'
                                            : 'border-gray-100 hover:border-gray-300 bg-white'
                                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="grow min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-sm ${active ? 'text-red-600' : 'text-navy-900'}`}>{p.name}</span>
                                                {p.popular && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded-full">Popular</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 truncate">{p.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-base font-extrabold ${active ? 'text-red-600' : 'text-navy-900'}`}>${p.priceDisplay}</p>
                                            <p className="text-[10px] text-gray-400">USD / yr</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Summary</p>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-navy-700 font-medium">{plan.name} Plan (Annual)</span>
                            <span className="font-bold text-navy-900">${plan.priceDisplay}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-navy-700 font-medium flex items-center gap-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded">FREE</span>
                                Purple Listing (1 Year)
                            </span>
                            <span className="text-sm text-green-600 font-bold">$0</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-navy-900">Total Due Today</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={plan.priceDisplay}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-2xl font-extrabold text-red-600"
                                >
                                    ${plan.priceDisplay} <span className="text-sm font-bold text-gray-400">USD</span>
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        {/* Feature toggle */}
                        <button
                            onClick={() => setShowFeatures(v => !v)}
                            className="w-full flex items-center justify-between text-xs font-bold text-red-600 hover:text-red-700 pt-2 transition-colors"
                        >
                            What's included
                            {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <AnimatePresence>
                            {showFeatures && (
                                <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden space-y-2 pt-2"
                                >
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-navy-600">
                                            <Check className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Trust badges */}
                    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-around gap-3 text-center">
                        {[
                            { icon: Lock, label: 'SSL Encrypted' },
                            { icon: Shield, label: 'Data Protected' },
                            { icon: Check, label: 'MSA Protected' },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex flex-col items-center gap-1">
                                <Icon className="w-4 h-4 text-green-500" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            RIGHT — Your Details
        ══════════════════════════════════════════ */}
                <div className="lg:col-span-3 space-y-6">

                    {draftRestored && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                        >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Your signup details have been pre-filled. Review and confirm before paying.
                        </motion.div>
                    )}


                    {/* Company Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Company Information</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Company Name" name="companyName" icon={Briefcase} value={form.companyName} onChange={handleFormChange} error={formErrors.companyName} placeholder="Acme Corp" required />
                            <Field label="Website" name="website" icon={Globe2} value={form.website} onChange={handleFormChange} error={formErrors.website} placeholder="www.acme.com" />
                            <Field label="Business Email" name="email" icon={Mail} type="email" value={form.email} onChange={handleFormChange} error={formErrors.email} placeholder="you@company.com" required />
                            <Field label="Phone (with country code)" name="contactPhone" icon={Phone} value={form.contactPhone} onChange={handleFormChange} error={formErrors.contactPhone} placeholder="+1 555 000 0000" required />
                        </div>
                    </div>

                    {/* Contact Person */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Contact Person</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full Name" name="contactName" icon={User} value={form.contactName} onChange={handleFormChange} error={formErrors.contactName} placeholder="John Doe" required />
                            <Field label="Role" name="contactRole" icon={Settings2} value={form.contactRole} onChange={handleFormChange} error={formErrors.contactRole} placeholder="CEO / Head of Growth" />
                        </div>
                    </div>

                    {/* Service Coverage (read-only summary) */}
                    {(uniqueServices.length > 0 || uniqueCountries.length > 0) && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Service Coverage</p>

                            {uniqueCountries.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        <MapPin className="w-3.5 h-3.5" /> Target Markets
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueCountries.map(c => (
                                            <span key={c} className="px-2.5 py-1 bg-navy-50 border border-navy-100 text-navy-700 text-xs font-semibold rounded-full">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {uniqueServices.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        <Settings2 className="w-3.5 h-3.5" /> Services
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueServices.map(s => (
                                            <span key={s} className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-full">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Terms & Pay */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                        <label className={`flex items-start gap-3 cursor-pointer group ${formErrors.terms ? 'text-red-600' : 'text-navy-700'}`}>
                            <div
                                onClick={() => { setTermsAccepted(v => !v); setFormErrors(p => ({ ...p, terms: '' })); }}
                                className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${termsAccepted ? 'bg-red-600 border-red-600' : formErrors.terms ? 'border-red-400' : 'border-gray-300 group-hover:border-red-400'
                                    }`}
                            >
                                {termsAccepted && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm leading-relaxed">
                                I agree to the{' '}
                                <a href="/terms-of-service" target="_blank" className="text-red-600 underline font-semibold">Thhiya MSA Terms of Service</a>
                                {' '}and confirm the details above are accurate.
                            </span>
                        </label>
                        {formErrors.terms && (
                            <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.terms}</p>
                        )}

                        {/* Primary CTA */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePay}
                            disabled={isSubmitting !== 'none'}
                            className="w-full py-4 px-6 rounded-2xl bg-red-600 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-red-200 hover:bg-red-700 transition-colors"
                        >
                            {isSubmitting === 'paid' ? <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {isSubmitting === 'paid' ? 'Processing...' : (isUpdateFlow ? `Update Plan — ${plan.name}` : `Complete & Get Listed — ${plan.name} Plan`)}
                            <ArrowRight className="w-5 h-5 ml-auto" />
                        </motion.button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-xs text-gray-400 font-medium">or</span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        {/* Free listing CTA */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-navy-100 rounded-xl shrink-0">
                                    <Globe2 className="w-4 h-4 text-navy-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-navy-900">Just want to get listed?</p>
                                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                                        Start with a free basic listing — no leads, no exclusivity,
                                        but you'll be visible on the Thhiya directory. Upgrade anytime.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleFreeListing}
                                disabled={isSubmitting !== 'none'}
                                className="w-full py-2.5 rounded-xl border-2 border-navy-300 text-navy-700 font-bold text-sm hover:bg-navy-50 transition-colors"
                            >
                                {isSubmitting === 'free' ? 'Applying Free Listing...' : 'List My Business for Free'}
                            </button>
                        </div>

                        <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                            Your data is encrypted and never shared without consent.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

// ─── Reusable form field ───────────────────────────────────────────────────────
interface FieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
    icon: React.FC<{ className?: string }>;
    type?: string;
    required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, name, value, onChange, error, placeholder, icon: Icon, type = 'text', required }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full rounded-xl border px-4 py-3 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                }`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);
