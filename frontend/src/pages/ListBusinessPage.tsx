import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, Select, MultiSelect } from '../components';
import { VENDOR_QUESTIONS } from '../features/auth/data/vendorQuestions';
import { Plus, Trash2, ArrowRight, X, Zap } from 'lucide-react';
import { AuthLayout } from '../features/auth/components/AuthLayout';
import { requestVendorSignupOtp, resendOtp, verifyVendorSignupOtp } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import { listingsApi } from '../services/api';
import { isRequiredQuestionForService, validateQuestionnaireAnswersForMatrix } from '../utils/complianceQuestionnaire';


const DRAFT_KEY = 'thhiya_signup_draft';      // sessionStorage - returnToStep nav
const AUTOSAVE_KEY = 'thhiya_signup_autosave'; // localStorage  - survives reload
const PENDING_PLAN_KEY = 'thhiya_pending_plan';

const STEPS = ['Account Details', 'Service Coverage', 'Compliance Details'];

import { COUNTRY_OPTIONS } from '../features/auth/data/countries';

const SERVICE_OPTIONS = VENDOR_QUESTIONS.services_available.options.map(s => ({ value: s, label: s }));

export const ListBusinessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user, vendorProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [error, setError] = useState('');
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState('');
    const [showPlanPrompt, setShowPlanPrompt] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        website: '',
        contactName: '',
        contactRole: '',
        contactPhone: ''
    });

    const [serviceMatrix, setServiceMatrix] = useState<{ countries: string[], services: string[] }[]>([{ countries: [], services: [] }]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
    const isMounted = useRef(false); // guard: skip autosave on first render

    // ── Restore on mount ────────────────────────────────────────────────────
    useEffect(() => {
        const locState = (location.state as any) ?? {};
        const returnToStep: number | undefined = locState.returnToStep;

        const selectedPlan = (location.state as any)?.selectedPlan;
        if (selectedPlan) {
            sessionStorage.setItem(PENDING_PLAN_KEY, selectedPlan);
        }


        if (!isAuthenticated && !selectedPlan && !sessionStorage.getItem(PENDING_PLAN_KEY)) {
            // We'll show this after step 3 instead of on mount
        }

        // [1] sessionStorage draft (navigation back from /pricing)
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
            try {
                const draft = JSON.parse(raw);
                if (draft.pendingPlan) sessionStorage.setItem(PENDING_PLAN_KEY, draft.pendingPlan);
                if (draft.formData) setFormData(draft.formData);
                if (draft.serviceMatrix) setServiceMatrix(draft.serviceMatrix);
                if (draft.answers) setAnswers(draft.answers);

                if (typeof returnToStep === 'number') {
                    setCurrentStep(returnToStep);
                    const labels = ['Account Details', 'Service Coverage', 'Compliance Details'];
                    setError(`Please complete your ${labels[returnToStep]} before proceeding to checkout.`);
                } else if (typeof draft.currentStep === 'number') {
                    setCurrentStep(draft.currentStep);
                }
            } catch { /* ignore corrupted draft */ }
            finally { sessionStorage.removeItem(DRAFT_KEY); }
            return; // don't also load autosave
        }

        // [2] localStorage autosave (page reload recovery)
        const autoRaw = localStorage.getItem(AUTOSAVE_KEY);
        if (autoRaw) {
            try {
                const saved = JSON.parse(autoRaw);
                if (saved.pendingPlan) sessionStorage.setItem(PENDING_PLAN_KEY, saved.pendingPlan);
                if (saved.formData) setFormData(f => ({ ...f, ...saved.formData }));
                if (saved.serviceMatrix) setServiceMatrix(saved.serviceMatrix);
                if (saved.answers) setAnswers(saved.answers);
                if (typeof saved.currentStep === 'number') setCurrentStep(saved.currentStep);
            } catch { /* ignore */ }
        }

        if (typeof returnToStep === 'number') {
            const labels = ['Account Details', 'Service Coverage', 'Compliance Details'];
            setCurrentStep(returnToStep);
            setError(`Please complete your ${labels[returnToStep]} before proceeding to checkout.`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, location.state]);

    useEffect(() => {
        if (!isAuthenticated) return;

        setFormData(prev => ({
            ...prev,
            email: prev.email || user?.email || '',
            companyName: prev.companyName || vendorProfile?.companyName || user?.displayName || '',
            website: prev.website || vendorProfile?.website || '',
            contactName: prev.contactName || vendorProfile?.contactName || vendorProfile?.contactPerson?.name || user?.displayName || '',
            contactRole: prev.contactRole || vendorProfile?.contactRole || vendorProfile?.contactPerson?.role || '',
            contactPhone: prev.contactPhone || vendorProfile?.contactPhone || vendorProfile?.contactPerson?.phone || '',
            password: '',
            confirmPassword: '',
        }));

        listingsApi.getMyRequest()
            .then((response) => {
                const req = response?.data;
                if (!req) return;

                setFormData(prev => ({
                    ...prev,
                    email: req.email || prev.email,
                    companyName: req.companyName || prev.companyName,
                    website: req.website || prev.website,
                    contactName: req.contactName || prev.contactName,
                    contactRole: req.contactRole || prev.contactRole,
                    contactPhone: req.contactPhone || prev.contactPhone,
                    password: '',
                    confirmPassword: '',
                }));

                if (Array.isArray(req.serviceMatrix) && req.serviceMatrix.length) {
                    setServiceMatrix(req.serviceMatrix);
                }
                if (req.answers && typeof req.answers === 'object') {
                    setAnswers(req.answers);
                }
                if (req.selectedPlan) {
                    sessionStorage.setItem(PENDING_PLAN_KEY, req.selectedPlan);
                }
            })
            .catch(() => undefined);
    }, [isAuthenticated, user?.email, user?.displayName, vendorProfile]);

    // ── Auto-save to localStorage on every change ────────
    // Skip the very first render — state is still at empty defaults at that point
    // and would overwrite the restored data before it has been loaded.
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const snapshot = {
            formData,
            serviceMatrix,
            answers,
            currentStep,
            pendingPlan: sessionStorage.getItem(PENDING_PLAN_KEY),
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
    }, [formData, serviceMatrix, answers, currentStep]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isBusinessEmail = (email: string) => {
        const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com'];
        const domain = email.split('@')[1];
        return domain && !freeProviders.includes(domain.toLowerCase());
    };

    const isValidUrl = (urlString: string) => {
        try {
            const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
            return !!url.hostname && url.hostname.includes('.');
        } catch (e) {
            return false;
        }
    };

    // ── Step validators — return error string or null ────────────────────────────

    const validateStep0 = (): string | null => {
        if (!formData.companyName.trim()) return 'Company name is required.';
        if (!formData.email.trim()) return 'Business email is required.';
        if (!isAuthenticated && !isBusinessEmail(formData.email)) return 'Please use a business email address (no Gmail, Yahoo, etc.).';
        if (!isAuthenticated && (!formData.password || formData.password.length < 8)) return 'Password must be at least 8 characters.';
        if (!isAuthenticated && formData.password !== formData.confirmPassword) return 'Password and confirm password must match.';
        if (!formData.contactName.trim()) return 'Contact person is required.';
        if (!formData.contactRole.trim()) return 'Contact role is required.';
        if (!formData.contactPhone.trim()) return 'Work phone number is required.';
        if (!formData.contactPhone.startsWith('+')) return 'Work phone must include country code (e.g. +1, +44).';
        if (!isValidUrl(formData.website)) return 'Please enter a valid website URL.';
        return null;
    };

    const validateStep1 = (): string | null => {
        const valid = serviceMatrix.filter(r => r.countries.length > 0 && r.services.length > 0);
        if (valid.length === 0) return 'Please add at least one country and service in Step 2.';
        return null;
    };

    const validateStep2 = (): string | null => {
        return validateQuestionnaireAnswersForMatrix(serviceMatrix, answers);
    };

    const finalSubmit = async (planOverride?: string) => {
        setError('');
        setIsLoading(true);
        try {
            const pendingPlan = planOverride || sessionStorage.getItem(PENDING_PLAN_KEY) || '';
            const normalizedWebsite = formData.website.startsWith('http') ? formData.website : `https://${formData.website}`;
            const payload = {
                ...formData,
                website: normalizedWebsite,
                serviceMatrix,
                answers,
                questionnaireAnswers: answers,
                serviceCoverage: serviceMatrix.flatMap((row) =>
                    row.countries.map((country) => ({ country, services: row.services }))
                ),
                selectedPlan: pendingPlan,
            };

            if (isAuthenticated) {
                await listingsApi.upsertMyRequest(payload);
                const plan = sessionStorage.getItem(PENDING_PLAN_KEY);
                if (plan && plan !== 'Free Listing') {
                    navigate('/checkout', { state: { selectedPlan: plan } });
                } else if (plan === 'Free Listing') {
                    navigate('/');
                } else {
                    setShowPlanPrompt(true);
                }
            } else {
                await requestVendorSignupOtp(payload);
                setOtpRequested(true);
                setError('');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to continue signup flow');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        if (isLoading) return;

        if (currentStep === STEPS.length - 1) {
            if (!isAuthenticated && otpRequested) {
                if (otp.length !== 6) {
                    setError('Enter the 6-digit OTP sent to your email.');
                    return;
                }

                setError('');
                setIsLoading(true);
                try {
                    const response = await verifyVendorSignupOtp({ email: formData.email, otp });
                    login(response.token, {
                        id: response.user.id,
                        email: response.user.email,
                        role: response.user.role,
                        displayName: response.profile?.companyName || response.profile?.contactPerson?.name,
                    }, response.profile || null);

                    sessionStorage.removeItem(DRAFT_KEY);
                    localStorage.removeItem(AUTOSAVE_KEY);

                    const plan = sessionStorage.getItem(PENDING_PLAN_KEY);
                    if (plan && plan !== 'Free Listing') {
                        navigate('/checkout', { state: { selectedPlan: plan } });
                    } else if (plan === 'Free Listing') {
                        navigate('/');
                    } else {
                        setShowPlanPrompt(true);
                    }
                } catch (err: any) {
                    const apiError = err.response?.data;
                    if (typeof apiError?.attemptsLeft === 'number') {
                        setError(`Invalid OTP. ${apiError.attemptsLeft} attempt(s) left.`);
                    } else {
                        setError(apiError?.error || err.message || 'Failed to verify OTP');
                    }
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            const e0 = validateStep0();
            if (e0) { setCurrentStep(0); setError(e0); return; }

            const e1 = validateStep1();
            if (e1) { setCurrentStep(1); setError(e1); return; }

            const e2 = validateStep2();
            if (e2) { setError(e2); return; }

            await finalSubmit();
            return;
        }

        if (currentStep === 0) {
            const err = validateStep0();
            if (err) { setError(err); return; }
        }
        if (currentStep === 1) {
            const err = validateStep1();
            if (err) { setError(err); return; }
            setActiveGroupIndex(0);
        }
        setError('');
        setCurrentStep(prev => prev + 1);
    };



    const prevStep = () => setCurrentStep(prev => prev - 1);

    const updateMatrixCountries = (index: number, countries: string[]) => {
        const newMatrix = [...serviceMatrix];
        newMatrix[index].countries = countries;
        setServiceMatrix(newMatrix);
    };

    const updateMatrixServices = (index: number, services: string[]) => {
        const newMatrix = [...serviceMatrix];
        newMatrix[index].services = services;
        setServiceMatrix(newMatrix);
    };

    const addMatrixRow = () => setServiceMatrix([...serviceMatrix, { countries: [], services: [] }]);
    const removeMatrixRow = (index: number) => {
        const newMatrix = [...serviceMatrix];
        newMatrix.splice(index, 1);
        setServiceMatrix(newMatrix);
    };

    const handleGroupAnswerChange = (groupKey: string, service: string, questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [groupKey]: {
                ...prev[groupKey],
                [service]: {
                    ...prev[groupKey]?.[service],
                    [questionId]: value
                }
            }
        }));
    };

    const renderField = (groupKey: string, question: any, service: string) => {
        const answer = answers[groupKey]?.[service]?.[question.id] || '';
        const isRequired = isRequiredQuestionForService(service, question.id);

        return (
            <div key={question.id} className="mb-6 last:mb-0">
                <label className="block text-base font-semibold text-navy-900 mb-3">
                    {question.question}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'radio' && (
                    <div className="flex flex-wrap gap-4">
                        {question.options.map((opt: string) => (
                            <label key={opt} className="inline-flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    className="form-radio text-red-600 h-4 w-4 border-gray-300 focus:ring-red-500"
                                    name={`${groupKey}-${service}-${question.id}`}
                                    value={opt}
                                    checked={answer === opt}
                                    onChange={(e) => handleGroupAnswerChange(groupKey, service, question.id, e.target.value)}
                                />
                                <span className="ml-2 text-[15px] font-medium text-gray-600 group-hover:text-navy-900 transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}

                {question.type === 'select' && (
                    <Select
                        options={question.options.map((opt: string) => ({ value: opt, label: opt }))}
                        value={answer}
                        onChange={(val) => handleGroupAnswerChange(groupKey, service, question.id, val)}
                        placeholder="Select..."
                    />
                )}

                {question.type === 'checkbox_group' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {question.options.map((opt: string) => (
                            <label key={opt} className="inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="form-checkbox text-red-600 rounded border-gray-300 focus:ring-red-500"
                                    checked={Array.isArray(answer) && answer.includes(opt)}
                                    onChange={(e) => {
                                        const current = Array.isArray(answer) ? answer : [];
                                        const next = e.target.checked ? [...current, opt] : current.filter(v => v !== opt);
                                        handleGroupAnswerChange(groupKey, service, question.id, next);
                                    }}
                                />
                                <span className="ml-2 text-[15px] font-medium text-gray-600 group-hover:text-navy-900 transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}

                {(question.type === 'input' || question.type === 'number') && (
                    <input
                        type={question.type === 'number' ? 'number' : 'text'}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 h-10 px-3 border transition-all"
                        value={answer}
                        onChange={(e) => handleGroupAnswerChange(groupKey, service, question.id, e.target.value)}
                    />
                )}

                {(question.type === 'textarea' || question.type === 'yes_no_explain' || question.type === 'yes_no_list') && (
                    <textarea
                        className="w-full rounded-2xl border-gray-200 bg-white shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-400/20 min-h-[100px] p-4 border transition-all text-base outline-none"
                        value={answer}
                        onChange={(e) => handleGroupAnswerChange(groupKey, service, question.id, e.target.value)}
                        placeholder="Please provide details..."
                    />
                )}
            </div>
        );
    };

    const renderQuestionnaire = () => {
        const validRows = serviceMatrix.filter(row => row.countries.length > 0 && row.services.length > 0);
        if (validRows.length === 0) return <div className="text-center py-12 text-gray-400">Add countries in the previous step to configure details.</div>;

        const activeRow = validRows[activeGroupIndex];

        if (!activeRow) return null;

        const groupKey = `group-${activeGroupIndex}`;
        const displayedCountries = activeRow.countries.length > 3
            ? `${activeRow.countries.slice(0, 3).join(', ')} +${activeRow.countries.length - 3} more`
            : activeRow.countries.join(', ');

        return (
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/4 space-y-2">
                    {validRows.map((row, idx) => {
                        // Derive label from continents
                        const continents = Array.from(new Set(
                            row.countries.map(c => COUNTRY_OPTIONS.find(opt => opt.value === c)?.group || 'Other')
                        )).filter(g => g !== 'Other');

                        let mainLabel = '';
                        if (continents.length === 1) {
                            mainLabel = continents[0];
                        } else if (continents.length === 2) {
                            mainLabel = `${continents[0]} & ${continents[1]}`;
                        } else if (continents.length > 2) {
                            mainLabel = 'Multiple Regions';
                        } else {
                            mainLabel = 'Selected Countries';
                        }

                        if (row.countries.length === 1) {
                            mainLabel = row.countries[0];
                        }

                        const label = row.countries.length > 1
                            ? `${mainLabel} (${row.countries.length})`
                            : mainLabel;

                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveGroupIndex(idx)}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeGroupIndex === idx
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 translate-x-1'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="text-sm font-bold">{label}</div>
                                {row.countries.length > 1 && (
                                    <div className={`text-[10px] truncate mt-0.5 ${activeGroupIndex === idx ? 'text-red-100' : 'text-gray-400'}`}>
                                        {row.countries.join(', ')}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="w-full lg:w-3/4 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-navy-900 mb-2 flex items-center gap-2">
                        Configuration for Selected Markets
                    </h3>
                    <p className="text-base text-gray-500 mb-8 border-b border-gray-100 pb-6">
                        Applying to: <span className="font-bold text-red-600">{displayedCountries}</span>
                    </p>

                    <div className="space-y-10">
                        <section>
                            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">General Details</h4>
                            {VENDOR_QUESTIONS.general.map(q => renderField(groupKey, q, 'general'))}
                        </section>

                        {activeRow.services.map(service => {
                            const isEOR = service.includes('EOR') || service.includes('PEO');
                            const isPayroll = service.includes('Payroll');
                            const isMarketing = service.includes('Marketing');
                            const isRecruitment = service.includes('Recruitment') || service.includes('Talent');

                            // Determine relevant sections
                            const showCompliance = isEOR || isPayroll || service.includes('Legal') || service.includes('Compliance');
                            const showRisk = showCompliance;
                            const showMarketing = isMarketing;
                            const showWorkerTypes = isEOR || isRecruitment || isPayroll;
                            const showBenefits = isEOR || isPayroll;

                            return (
                                <section key={service} className="pt-8 border-t border-gray-200">
                                    <h4 className="text-lg font-bold text-navy-900 mb-1">{service}</h4>
                                    <p className="text-xs text-gray-500 mb-6">Service configuration</p>

                                    {/* Pricing & Operations - Render for ALL services */}
                                    <div className="mb-8">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 bg-gray-100 p-2 rounded">Service Terms</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {VENDOR_QUESTIONS.pricing.map(q => renderField(groupKey, q, service))}
                                            {VENDOR_QUESTIONS.operational.map(q => renderField(groupKey, q, service))}
                                        </div>
                                    </div>

                                    {/* Domain Specifics */}
                                    {isEOR && (
                                        <div className="mb-8">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 bg-gray-100 p-2 rounded">EOR Capabilities</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {VENDOR_QUESTIONS.eor_specific.map(q => renderField(groupKey, q, service))}
                                            </div>
                                        </div>
                                    )}

                                    {showWorkerTypes && VENDOR_QUESTIONS.worker_types && (
                                        <div className="mb-8">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 bg-gray-100 p-2 rounded">Worker & Contracts</h5>
                                            {VENDOR_QUESTIONS.worker_types.map(q => renderField(groupKey, q, service))}
                                        </div>
                                    )}

                                    {showCompliance && (
                                        <div className="mb-8">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 bg-gray-100 p-2 rounded">Compliance & Benefits</h5>
                                            {VENDOR_QUESTIONS.compliance.map(q => renderField(groupKey, q, service))}
                                            {showBenefits && VENDOR_QUESTIONS.benefits.map(q => renderField(groupKey, q, service))}
                                            {showRisk && VENDOR_QUESTIONS.risk.map(q => renderField(groupKey, q, service))}
                                        </div>
                                    )}

                                    {/* Local Support - Render for ALL */}
                                    <div className="mb-6">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 bg-gray-100 p-2 rounded">Local Support</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {VENDOR_QUESTIONS.support.map(q => renderField(groupKey, q, service))}
                                        </div>
                                    </div>

                                    {showMarketing && (
                                        <div className="mb-6">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 bg-gray-100 p-2 rounded">Marketing Specifics</h5>
                                            {VENDOR_QUESTIONS.marketing_specific.map(q => renderField(groupKey, q, service))}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthLayout maxWidth="max-w-2xl">
            <div className="flex justify-between items-center mb-12">
                <div className="text-left">
                    <h2 className="text-4xl font-black text-navy-900 mb-2 leading-tight">{STEPS[currentStep]}</h2>
                    <p className="text-gray-400 font-semibold tracking-wide uppercase text-xs">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            const snapshot = {
                                formData,
                                serviceMatrix,
                                answers,
                                currentStep,
                                pendingPlan: sessionStorage.getItem(PENDING_PLAN_KEY),
                            };
                            sessionStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
                            navigate('/pricing', { state: { fromSignup: true, selectedPlan: 'Pro' } });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold"
                    >
                        <Zap className="w-3.5 h-3.5" /> Get Pro Plan
                    </button>
                    <div className="flex gap-3">
                        {STEPS.map((_, idx) => (
                            <div key={idx} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.3)]' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-2">
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Company Name</label>
                                <input name="companyName" value={formData.companyName} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Website</label>
                                <input name="website" value={formData.website} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="www.acme.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Business Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="you@company.com" readOnly={isAuthenticated} />
                            </div>
                            {!isAuthenticated && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Password</label>
                                        <input name="password" type="password" value={formData.password} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="Minimum 8 characters" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Confirm Password</label>
                                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="Re-enter password" />
                                    </div>
                                </>
                            )}
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Work Phone Number</label>
                                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/[^0-9+]/g, '') })} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Contact Person</label>
                                <input name="contactName" value={formData.contactName} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="John Doe" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Role</label>
                                <input name="contactRole" value={formData.contactRole} onChange={handleBasicChange} className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border" placeholder="CEO / Head of Growth" />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {serviceMatrix.map((row, idx) => (
                            <div key={idx} className="relative bg-gray-50/50 border border-gray-100 rounded-3xl p-6 shadow-sm group">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <MultiSelect
                                        label="TARGET MARKET"
                                        options={COUNTRY_OPTIONS.filter(opt => !serviceMatrix.some((r, rIdx) => rIdx !== idx && r.countries.includes(opt.value)))}
                                        value={row.countries}
                                        onChange={(val) => updateMatrixCountries(idx, val)}
                                        placeholder="Select Countries"
                                    />
                                    <MultiSelect
                                        label="SERVICES PROVIDED"
                                        options={SERVICE_OPTIONS}
                                        value={row.services}
                                        onChange={(selected) => updateMatrixServices(idx, selected)}
                                        placeholder="Select services..."
                                    />
                                </div>
                                <button onClick={() => removeMatrixRow(idx)} className="absolute -top-3 -right-3 p-2 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-lg border border-gray-100 md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-95"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        <button onClick={addMatrixRow} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-red-300 hover:text-red-500 transition-all flex items-center justify-center gap-2 group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Add Another Market
                        </button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderQuestionnaire()}

                        {!isAuthenticated && otpRequested && (
                            <div className="mt-8 p-5 bg-navy-50 border border-navy-100 rounded-2xl">
                                <p className="text-sm font-bold text-navy-900 mb-2">Verify your email to complete signup</p>
                                <p className="text-xs text-gray-500 mb-3">We sent a 6-digit OTP to {formData.email}.</p>
                                <input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="123456"
                                    className="w-full rounded-2xl border-gray-200 bg-white p-4 text-sm tracking-[0.35em] font-bold text-center focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all border"
                                />
                                <button
                                    type="button"
                                    disabled={isResendingOtp}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 mt-3"
                                    onClick={async () => {
                                        try {
                                            if (isResendingOtp) return;
                                            setIsResendingOtp(true);
                                            await resendOtp({ email: formData.email, purpose: 'signup' });
                                            setError('');
                                        } catch (err: any) {
                                            setError(err.response?.data?.error || err.message || 'Failed to resend OTP');
                                        } finally {
                                            setIsResendingOtp(false);
                                        }
                                    }}
                                >
                                    {isResendingOtp ? 'Resending OTP...' : 'Resend OTP'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-gray-500 text-sm font-medium">
                    {isAuthenticated ? 'Your details are prefilled. Review and submit.' : <>Already part of our network? <Link to="/login" className="text-red-600 font-bold hover:underline transition-all">Sign in here</Link></>}
                </p>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {currentStep > 0 && <Button variant="ghost" onClick={prevStep} className="flex-1 sm:flex-none py-4 px-8 rounded-2xl text-gray-500 hover:text-navy-900">Back</Button>}
                    <Button onClick={nextStep} disabled={isLoading} className="flex-1 sm:flex-none py-4 px-10 rounded-2xl bg-navy-950 text-white hover:bg-navy-900 shadow-xl shadow-navy-100 transition-all font-bold group">
                        <span className="inline-flex items-center gap-2">
                            {isLoading && <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                            {isLoading ? 'Processing...' : (currentStep === STEPS.length - 1 ? (isAuthenticated ? 'Submit Listing Request' : (otpRequested ? 'Verify OTP & Continue' : 'Send OTP')) : 'Continue')}
                        </span>
                        <ArrowRight className={`ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${isLoading ? 'animate-pulse' : ''}`} />
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between gap-4 animate-in zoom-in-95">
                    <span className="text-sm font-bold">{error}</span>
                    <button type="button" onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                </div>
            )}

            {showPlanPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        <h3 className="text-2xl font-black text-navy-900 mb-2">Choose your path</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">No plan selected yet. You can view premium plans or continue with a free listing signup.</p>
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPlanPrompt(false);
                                    navigate('/pricing');
                                }}
                                className="w-full py-4 rounded-2xl bg-navy-950 text-white font-bold hover:bg-navy-900 transition-all active:scale-[0.98] shadow-lg shadow-navy-100"
                            >
                                View Premium Plans
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    sessionStorage.setItem(PENDING_PLAN_KEY, 'Free Listing');
                                    setShowPlanPrompt(false);
                                    navigate('/');
                                }}
                                className="w-full py-4 rounded-2xl border-2 border-gray-100 text-navy-900 font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                Continue with Free Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
};
