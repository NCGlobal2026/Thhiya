import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Building2,
    Mail,
    Briefcase,
    Phone,
    MessageSquare,
    Shield,
    Check,
    Loader2,
    AlertCircle,
    Sparkles,
    X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    contactApi,
    ContactFormData,
    SUBJECT_OPTIONS,
} from '../../services/contactService';
import { parseError, formatRetryTime } from '../../utils/errorHandler';
import { GA4Events } from '../../services/analytics';

interface ContactFormProps {
    source?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    isModal?: boolean;
}

interface FormErrors {
    [key: string]: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ source = 'direct', onClose, onSuccess, isModal = false }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const [formData, setFormData] = useState<ContactFormData>({
        fullName: '',
        businessEmail: '',
        companyName: '',
        jobTitle: '',
        phone: '',
        subject: '',
        message: '',
        consentGiven: false,
        source,
    });

    const validateField = useCallback((field: string, value: unknown): string | null => {
        switch (field) {
            case 'fullName':
                if (!value || !(value as string).trim()) return 'Full name is required';
                if ((value as string).trim().length < 2) return 'Name must be at least 2 characters';
                return null;

            case 'businessEmail':
                if (!value || !(value as string).trim()) return 'Business email is required';
                if (!/^\S+@\S+\.\S+$/.test(value as string)) return 'Please enter a valid email address';
                const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
                const domain = (value as string).split('@')[1]?.toLowerCase();
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

            case 'subject':
                if (!value) return 'Please select a subject';
                return null;

            case 'message':
                if (!value || !(value as string).trim()) return 'Message is required';
                if ((value as string).trim().length < 10) return 'Message must be at least 10 characters';
                return null;

            case 'consentGiven':
                if (!value) return 'You must consent to proceed';
                return null;

            default:
                return null;
        }
    }, []);

    const updateField = useCallback(<K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            setTouched((t) => ({ ...t, [field]: true }));

            const error = validateField(field, value);
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

    const handleBlur = useCallback((field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field as keyof ContactFormData]);
        if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    }, [formData, validateField]);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.businessEmail.trim()) {
            newErrors.businessEmail = 'Business email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.businessEmail)) {
            newErrors.businessEmail = 'Please enter a valid email address';
        }
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.subject) newErrors.subject = 'Please select a subject';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        if (!formData.consentGiven) newErrors.consentGiven = 'You must consent to proceed';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;

        // Mark all fields as touched
        setTouched({
            fullName: true,
            businessEmail: true,
            companyName: true,
            subject: true,
            message: true,
            consentGiven: true,
        });

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await contactApi.submit(formData);
            if (response.success) {
                // Track contact form submission
                GA4Events.contactFormSubmit({
                    formType: 'contact',
                    subject: formData.subject,
                    source: source,
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
    }, [formData, validateForm, onSuccess]);

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

    // Success state
    if (submitSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-3">Thank You!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We've received your message and will get back to you within 24-48 business hours.
                </p>
                {isModal && onClose && (
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition-colors"
                    >
                        Close
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">Contact Us</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Get in Touch</h2>
                    <p className="text-gray-600 mt-1">Have a question? We'd love to hear from you.</p>
                </div>
                {isModal && onClose && (
                    <button
                        title='contact'
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Form */}
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput('fullName', 'Full Name', formData.fullName, (v) => updateField('fullName', v), <User className="w-5 h-5" />, true, 'text', 'John Doe')}
                    {renderInput('businessEmail', 'Business Email', formData.businessEmail, (v) => updateField('businessEmail', v), <Mail className="w-5 h-5" />, true, 'email', 'john@company.com')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput('companyName', 'Company Name', formData.companyName, (v) => updateField('companyName', v), <Building2 className="w-5 h-5" />, true, 'text', 'Acme Corporation')}
                    {renderInput('jobTitle', 'Job Title', formData.jobTitle || '', (v) => updateField('jobTitle', v), <Briefcase className="w-5 h-5" />, false, 'text', 'HR Director')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput('phone', 'Phone', formData.phone || '', (v) => updateField('phone', v), <Phone className="w-5 h-5" />, false, 'tel', '+1 (555) 123-4567')}

                    {/* Subject dropdown */}
                    <div className="space-y-1.5">
                        <label htmlFor="subject" className="block text-sm font-medium text-navy-900">
                            Subject<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <select
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => updateField('subject', e.target.value)}
                                onBlur={() => handleBlur('subject')}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-navy-900 focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${touched.subject && errors.subject
                                    ? 'border-red-500 bg-red-50 focus:ring-red-500'
                                    : touched.subject && formData.subject
                                        ? 'border-green-500 bg-green-50 focus:ring-green-500'
                                        : 'border-gray-200 hover:border-gray-300 focus:ring-navy-500'
                                    }`}
                            >
                                <option value="">Select a subject</option>
                                {SUBJECT_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        {touched.subject && errors.subject && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-500 flex items-center gap-1 mt-1"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {errors.subject}
                            </motion.p>
                        )}
                    </div>
                </div>

                {/* Message textarea */}
                <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-sm font-medium text-navy-900">
                        Message<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => updateField('message', e.target.value)}
                            onBlur={() => handleBlur('message')}
                            placeholder="Tell us about your inquiry..."
                            rows={4}
                            className={`w-full px-4 py-3 pr-10 border rounded-xl text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${touched.message && errors.message
                                ? 'border-red-500 bg-red-50 focus:ring-red-500'
                                : touched.message && formData.message.trim()
                                    ? 'border-green-500 bg-green-50 focus:ring-green-500'
                                    : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-navy-500'
                                }`}
                        />
                        <div className="absolute right-3 top-3">
                            {touched.message && errors.message && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {touched.message && !errors.message && formData.message.trim() && <Check className="w-5 h-5 text-green-500" />}
                        </div>
                    </div>
                    {touched.message && errors.message && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 flex items-center gap-1 mt-1"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {errors.message}
                        </motion.p>
                    )}
                </div>

                {/* Consent checkbox */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className={`flex items-start gap-3 cursor-pointer ${touched.consentGiven && errors.consentGiven ? 'text-red-600' : ''}`}>
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={formData.consentGiven}
                                onChange={(e) => updateField('consentGiven', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${formData.consentGiven
                                ? 'bg-navy-600 text-white'
                                : touched.consentGiven && errors.consentGiven
                                    ? 'border-2 border-red-500'
                                    : 'border-2 border-gray-300'
                                }`}>
                                {formData.consentGiven && <Check className="w-3.5 h-3.5" />}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">
                                I agree to the{' '}
                                <Link to="/privacy-policy" className="text-navy-600 hover:text-navy-800 underline" target="_blank">
                                    Privacy Policy
                                </Link>{' '}
                                and{' '}
                                <Link to="/terms-of-service" className="text-navy-600 hover:text-navy-800 underline" target="_blank">
                                    Terms of Service
                                </Link>
                                <span className="text-red-500 ml-1">*</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                We respect your privacy and will not share your information with third parties without your consent.
                            </p>
                        </div>
                    </label>
                    {touched.consentGiven && errors.consentGiven && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 flex items-center gap-1 mt-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {errors.consentGiven}
                        </motion.p>
                    )}
                </div>

                {/* Error message */}
                {submitError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{submitError}</p>
                    </motion.div>
                )}

                {/* Submit button */}
                <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                    className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Shield className="w-5 h-5" />
                            Send Message
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default ContactForm;
