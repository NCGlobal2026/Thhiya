import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Building2,
    Mail,
    Briefcase,
    Globe,
    Link,
    Target,
    MapPin,
    DollarSign,
    Users,
    Lightbulb,
    Clock,
    Handshake,
    MessageSquare,
    Shield,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    AlertCircle,
    Sparkles,
    X,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import {
    bantApi,
    BANTFormData,
    SERVICE_OPTIONS,
    BUDGET_OPTIONS,
    DECISION_ROLE_OPTIONS,
    PROJECT_HIGHLIGHTS_OPTIONS,
    TIMEFRAME_OPTIONS,
    VENDOR_CONNECTION_OPTIONS,
    COMMUNICATION_MODE_OPTIONS,
} from '../../services/bantService';
import { parseError, formatRetryTime } from '../../utils/errorHandler';
import { GA4Events } from '../../services/analytics';

interface BANTFormProps {
    source?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    isModal?: boolean;
}

interface FormErrors {
    [key: string]: string;
}

const TOTAL_SECTIONS = 3;

const sectionTitles = [
    'Basic Information',
    'Business Objective',
    'Connection & Consent',
];

const sectionIcons = [User, Target, Handshake];

export const BANTForm: React.FC<BANTFormProps> = ({ source = 'direct', onClose, onSuccess, isModal = false }) => {
    const hasTrackedStart = useRef(false);
    const [currentSection, setCurrentSection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const [formData, setFormData] = useState<BANTFormData>({
        fullName: '',
        businessEmail: '',
        jobTitle: '',
        companyName: '',
        hqLocation: '',
        websiteUrl: '',
        servicesLookingFor: [],
        otherServiceDetails: '',
        targetCountryOrRegion: '',
        additionalDetails: '',
        budget: '',
        decisionMakingRole: '',
        otherDecisionRole: '',
        projectHighlights: [],
        otherProjectHighlights: '',
        timeframe: '',
        vendorConnectionPreference: '',
        communicationMode: [],
        consentGiven: false,
        source,
    });

    // Track form start on mount (only once)
    useEffect(() => {
        if (!hasTrackedStart.current) {
            GA4Events.bantFormStarted(source);
            hasTrackedStart.current = true;
        }
    }, [source]);

    // Real-time field validation
    const validateField = useCallback((field: string, value: unknown, allData?: BANTFormData): string | null => {
        const data = allData || formData;

        switch (field) {
            case 'fullName':
                if (!value || !(value as string).trim()) return 'Full name is required';
                if ((value as string).trim().length < 2) return 'Name must be at least 2 characters';
                return null;

            case 'businessEmail':
                if (!value || !(value as string).trim()) return 'Business email is required';
                if (!/^\S+@\S+\.\S+$/.test(value as string)) return 'Please enter a valid email address';
                // Check for personal email domains
                const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
                const domain = (value as string).split('@')[1]?.toLowerCase();
                // Allow specific emails for development testing
                const devWhitelistedEmails = ['devbug.hosting@gmail.com'];
                const emailLower = (value as string).toLowerCase();
                if (personalDomains.includes(domain) && !devWhitelistedEmails.includes(emailLower)) {
                    return 'Please use a business email address';
                }
                return null;

            case 'companyName':
                if (!value || !(value as string).trim()) return 'Company name is required';
                if ((value as string).trim().length < 2) return 'Company name must be at least 2 characters';
                return null;

            case 'websiteUrl':
                if (value && (value as string).trim()) {
                    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
                    if (!urlPattern.test(value as string)) return 'Please enter a valid URL';
                }
                return null;

            case 'servicesLookingFor':
                if (!value || (value as string[]).length === 0) return 'Please select at least one service';
                return null;

            case 'otherServiceDetails':
                if (data.servicesLookingFor.includes('Other') && (!value || !(value as string).trim())) {
                    return 'Please specify the other service';
                }
                return null;

            case 'targetCountryOrRegion':
                if (!value || !(value as string).trim()) return 'Target country or region is required';
                return null;

            case 'timeframe':
                // Timeframe is optional now
                return null;

            case 'vendorConnectionPreference':
                if (!value) return 'Please select a vendor connection preference';
                return null;



            case 'consentGiven':
                if (!value) return 'You must consent to proceed';
                return null;

            default:
                return null;
        }
    }, [formData]);

    const updateField = useCallback(<K extends keyof BANTFormData>(field: K, value: BANTFormData[K]) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };

            // Real-time validation only if field has been touched
            setTouched((t) => ({ ...t, [field]: true }));

            const error = validateField(field, value, newData);
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                if (error) {
                    newErrors[field] = error;
                } else {
                    delete newErrors[field];
                }
                return newErrors;
            });

            return newData;
        });
    }, [validateField]);

    const toggleArrayField = useCallback((field: 'servicesLookingFor' | 'projectHighlights' | 'communicationMode', value: string) => {
        setFormData((prev) => {
            const currentArray = prev[field];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((item) => item !== value)
                : [...currentArray, value];

            const newData = { ...prev, [field]: newArray };

            // Mark as touched and validate
            setTouched((t) => ({ ...t, [field]: true }));

            const error = validateField(field, newArray, newData);
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                if (error) {
                    newErrors[field] = error;
                } else {
                    delete newErrors[field];
                }
                return newErrors;
            });

            return newData;
        });
    }, [validateField]);

    const validateSection = useCallback((section: number): boolean => {
        const newErrors: FormErrors = {};

        switch (section) {
            case 0: // Basic Information
                if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
                if (!formData.businessEmail.trim()) {
                    newErrors.businessEmail = 'Business email is required';
                } else if (!/^\S+@\S+\.\S+$/.test(formData.businessEmail)) {
                    newErrors.businessEmail = 'Please enter a valid email address';
                }
                if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
                break;

            case 1: // Business Objective
                if (formData.servicesLookingFor.length === 0) {
                    newErrors.servicesLookingFor = 'Please select at least one service';
                }
                if (formData.servicesLookingFor.includes('Other') && !formData.otherServiceDetails?.trim()) {
                    newErrors.otherServiceDetails = 'Please specify the other service';
                }
                if (!formData.targetCountryOrRegion.trim()) {
                    newErrors.targetCountryOrRegion = 'Target country or region is required';
                }
                break;

            case 2: // Connection Preference & Consent
                if (!formData.vendorConnectionPreference) {
                    newErrors.vendorConnectionPreference = 'Please select a vendor connection preference';
                }
                if (!formData.consentGiven) {
                    newErrors.consentGiven = 'You must consent to proceed';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Helper to get which fields belong to each section
    const getFieldsForSection = useCallback((section: number): string[] => {
        switch (section) {
            case 0:
                return ['fullName', 'businessEmail', 'companyName'];
            case 1:
                return ['servicesLookingFor', 'otherServiceDetails', 'targetCountryOrRegion'];
            case 2:
                return ['vendorConnectionPreference', 'consentGiven'];
            default:
                return [];
        }
    }, []);

    // Check if current section has any errors
    const currentSectionHasErrors = useMemo(() => {
        const fieldsInSection = getFieldsForSection(currentSection);
        return fieldsInSection.some(field => errors[field]);
    }, [currentSection, errors, getFieldsForSection]);

    const handleNext = useCallback(() => {
        // First, mark all fields in the current section as touched
        const fieldsInSection = getFieldsForSection(currentSection);
        const newTouched = { ...touched };
        fieldsInSection.forEach(field => {
            newTouched[field] = true;
        });
        setTouched(newTouched);

        // Validate the section
        if (validateSection(currentSection)) {
            // Track section completion
            GA4Events.bantFormSectionCompleted(currentSection + 1, source);
            setCurrentSection((prev) => Math.min(prev + 1, TOTAL_SECTIONS - 1));
        }
    }, [currentSection, validateSection, getFieldsForSection, touched]);

    const handleBack = useCallback(() => {
        setCurrentSection((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;
        if (!validateSection(currentSection)) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await bantApi.submit(formData);
            if (response.success) {
                // Track successful lead generation
                GA4Events.generateLead({
                    leadSource: source,
                    servicesRequested: formData.servicesLookingFor,
                    targetCountry: formData.targetCountryOrRegion,
                    submissionId: response.data?.id,
                });
                setSubmitSuccess(true);
                onSuccess?.();
            } else {
                setSubmitError(response.error || 'Something went wrong. Please try again.');
            }
        } catch (error: unknown) {
            console.error('Form submission error:', error);
            const parsedError = parseError(error);

            if (parsedError.isRateLimit) {
                setSubmitError(
                    `Too many submissions. Please wait ${formatRetryTime(parsedError.retryAfter || 60)} before trying again.`
                );
            } else if (parsedError.isNetworkError) {
                setSubmitError('Network error. Please check your internet connection and try again.');
            } else if (parsedError.isTimeout) {
                setSubmitError('Request timed out. Please try again.');
            } else {
                setSubmitError(parsedError.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [currentSection, formData, validateSection, onSuccess]);

    const handleBlur = useCallback((field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field as keyof BANTFormData]);
        if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    }, [formData, validateField]);

    const renderInput = (
        id: string,
        label: string,
        value: string,
        onChange: (value: string) => void,
        icon: React.ReactNode,
        required = false,
        type = 'text',
        placeholder = ''
    ) => {
        const hasError = touched[id] && errors[id];
        const isValid = touched[id] && !errors[id] && value.trim();

        return (
            <div className="space-y-1.5">
                <label htmlFor={id} className="block text-sm font-medium text-navy-900">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={() => handleBlur(id)}
                        placeholder={placeholder}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${hasError
                            ? 'border-red-500 bg-red-50 focus:ring-red-500'
                            : isValid
                                ? 'border-green-500 bg-green-50 focus:ring-green-500'
                                : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-navy-500'
                            }`}
                    />
                    {/* Validation icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {isValid && <Check className="w-5 h-5 text-green-500" />}
                    </div>
                </div>
                {hasError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors[id]}
                    </motion.p>
                )}
            </div>
        );
    };

    const renderTextarea = (
        id: string,
        label: string,
        value: string,
        onChange: (value: string) => void,
        placeholder = '',
        required = false
    ) => {
        const hasError = touched[id] && errors[id];
        const isValid = touched[id] && !errors[id] && value.trim();

        return (
            <div className="space-y-1.5">
                <label htmlFor={id} className="block text-sm font-medium text-navy-900">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                    <textarea
                        id={id}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={() => handleBlur(id)}
                        placeholder={placeholder}
                        rows={3}
                        className={`w-full px-4 py-3 pr-10 border rounded-xl text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${hasError
                            ? 'border-red-500 bg-red-50 focus:ring-red-500'
                            : isValid
                                ? 'border-green-500 bg-green-50 focus:ring-green-500'
                                : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-navy-500'
                            }`}
                    />
                    {/* Validation icon */}
                    <div className="absolute right-3 top-3">
                        {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {isValid && <Check className="w-5 h-5 text-green-500" />}
                    </div>
                </div>
                {hasError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors[id]}
                    </motion.p>
                )}
            </div>
        );
    };

    const renderCheckboxGroup = (
        id: string,
        label: string,
        options: readonly string[],
        selectedValues: string[],
        onChange: (value: string) => void,
        required = false
    ) => {
        const hasError = touched[id] && errors[id];
        const isValid = touched[id] && !errors[id] && selectedValues.length > 0;

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-navy-900">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {isValid && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {selectedValues.length} selected
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        return (
                            <label
                                key={option}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                    ? 'border-navy-500 bg-navy-50'
                                    : hasError
                                        ? 'border-red-300 bg-white hover:border-red-400'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onChange(option)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected
                                        ? 'bg-navy-600 text-white'
                                        : 'border-2 border-gray-300'
                                        }`}
                                >
                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-sm text-navy-900">{option}</span>
                            </label>
                        );
                    })}
                </div>
                {hasError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors[id]}
                    </motion.p>
                )}
            </div>
        );
    };

    const renderRadioGroup = (
        id: string,
        label: string,
        options: readonly string[],
        selectedValue: string,
        onChange: (value: string) => void,
        required = false
    ) => {
        const hasError = touched[id] && errors[id];
        const isValid = touched[id] && !errors[id] && selectedValue;

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-navy-900">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {isValid && (
                        <Check className="w-4 h-4 text-green-500" />
                    )}
                </div>
                <div className="space-y-2">
                    {options.map((option) => {
                        const isSelected = selectedValue === option;
                        return (
                            <label
                                key={option}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                    ? 'border-navy-500 bg-navy-50'
                                    : hasError
                                        ? 'border-red-300 bg-white hover:border-red-400'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={id}
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => {
                                        setTouched((prev) => ({ ...prev, [id]: true }));
                                        onChange(option);
                                    }}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                        ? 'border-2 border-navy-600'
                                        : 'border-2 border-gray-300'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="w-3 h-3 rounded-full bg-navy-600" />
                                    )}
                                </div>
                                <span className="text-sm text-navy-900">{option}</span>
                            </label>
                        );
                    })}
                </div>
                {hasError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors[id]}
                    </motion.p>
                )}
            </div>
        );
    };

    const renderSection1 = () => (
        <div className="space-y-5">
            {renderInput('fullName', 'Full Name', formData.fullName, (v) => updateField('fullName', v), <User className="w-5 h-5" />, true, 'text', 'John Doe')}
            {renderInput('businessEmail', 'Business Email', formData.businessEmail, (v) => updateField('businessEmail', v), <Mail className="w-5 h-5" />, true, 'email', 'john@company.com')}
            {renderInput('jobTitle', 'Job Title', formData.jobTitle || '', (v) => updateField('jobTitle', v), <Briefcase className="w-5 h-5" />, false, 'text', 'HR Director')}
            {renderInput('companyName', 'Company Name', formData.companyName, (v) => updateField('companyName', v), <Building2 className="w-5 h-5" />, true, 'text', 'Acme Corporation')}
        </div>
    );

    const renderSection2 = () => (
        <div className="space-y-6">
            {renderCheckboxGroup(
                'servicesLookingFor',
                'What are you looking for today?',
                SERVICE_OPTIONS,
                formData.servicesLookingFor,
                (v) => toggleArrayField('servicesLookingFor', v),
                true
            )}

            {formData.servicesLookingFor.includes('Other') && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    {renderTextarea(
                        'otherServiceDetails',
                        'Please specify other services',
                        formData.otherServiceDetails || '',
                        (v) => updateField('otherServiceDetails', v),
                        'Describe the services you need...',
                        true
                    )}
                </motion.div>
            )}

            {renderInput(
                'targetCountryOrRegion',
                'Target Country or Region for Service',
                formData.targetCountryOrRegion,
                (v) => updateField('targetCountryOrRegion', v),
                <Globe className="w-5 h-5" />,
                true,
                'text',
                'e.g., Singapore, UAE, Canada'
            )}

        </div>
    );



    const renderSection3 = () => (
        <div className="space-y-6">
            {renderRadioGroup(
                'vendorConnectionPreference',
                'Would you like Thhiya to connect you with shortlisted vendors?',
                VENDOR_CONNECTION_OPTIONS,
                formData.vendorConnectionPreference,
                (v) => updateField('vendorConnectionPreference', v),
                true
            )}

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Review & Consent</h3>

                <div className="prose prose-sm text-gray-600 mb-6">
                    <p>
                        By submitting this form, you agree to our{' '}
                        <RouterLink to="/privacy-policy" className="text-navy-600 hover:text-navy-800 underline" target="_blank">
                            Privacy Policy
                        </RouterLink>{' '}
                        and{' '}
                        <RouterLink to="/terms-of-service" className="text-navy-600 hover:text-navy-800 underline" target="_blank">
                            Terms of Service
                        </RouterLink>.
                    </p>
                </div>

                <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.consentGiven
                        ? 'border-navy-500 bg-navy-50'
                        : errors.consentGiven
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <div
                        className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${formData.consentGiven
                            ? 'bg-navy-600 text-white'
                            : 'border-2 border-gray-300'
                            }`}
                    >
                        {formData.consentGiven && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                        <input
                            type="checkbox"
                            checked={formData.consentGiven}
                            onChange={(e) => updateField('consentGiven', e.target.checked)}
                            className="sr-only"
                        />
                        <span className="text-sm text-navy-900">
                            I consent to Thhiya (A BUG Aeterium Company) processing my data for matching, insights delivery, and to contact me for further details.
                        </span>
                    </div>
                </label>
                {errors.consentGiven && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.consentGiven}
                    </p>
                )}
            </div>

            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{submitError}</p>
                </motion.div>
            )}
        </div>
    );



    const renderSuccessState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
        >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-3">
                Thank You for Your Submission!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
                Our team will review your requirements and get back to you shortly with tailored recommendations for your global expansion needs.
            </p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-navy-900 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors"
                >
                    Close
                </button>
            )}
        </motion.div>
    );

    const sections = [renderSection1, renderSection2, renderSection3];

    if (submitSuccess) {
        return (
            <div className={isModal ? '' : 'max-w-2xl mx-auto'}>
                {renderSuccessState()}
            </div>
        );
    }

    return (
        <div className={isModal ? '' : 'max-w-2xl mx-auto'}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
                                Find Your Ideal Partner
                            </h2>
                            <p className="text-sm text-gray-500">
                                Global Expansion Made Simple
                            </p>
                        </div>
                    </div>
                    {isModal && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-2">
                    {sectionTitles.map((title, index) => {
                        const Icon = sectionIcons[index];
                        const isActive = index === currentSection;
                        const isCompleted = index < currentSection;

                        return (
                            <React.Fragment key={index}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isActive
                                                ? 'bg-navy-600 text-white'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span
                                        className={`text-xs mt-1.5 font-medium hidden sm:block ${isActive ? 'text-navy-900' : 'text-gray-400'
                                            }`}
                                    >
                                        {title}
                                    </span>
                                </div>
                                {index < TOTAL_SECTIONS - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded-full transition-colors ${index < currentSection ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                <p className="text-sm text-gray-500 text-center sm:hidden mt-2">
                    Section {currentSection + 1}: {sectionTitles[currentSection]}
                </p>
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px]"
                >
                    {sections[currentSection]()}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentSection === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${currentSection === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>

                {currentSection < TOTAL_SECTIONS - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={currentSectionHasErrors}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${currentSectionHasErrors
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-navy-900 text-white hover:bg-navy-800'
                            }`}
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Get My Matches
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default BANTForm;
