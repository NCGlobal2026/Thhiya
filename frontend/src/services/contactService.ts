import { api } from './api';

// Subject options for contact form
export const SUBJECT_OPTIONS = [
    'General Inquiry',
    'Partnership Opportunity',
    'Service Question',
    'Other',
] as const;

export interface ContactFormData {
    fullName: string;
    businessEmail: string;
    companyName: string;
    jobTitle?: string;
    phone?: string;
    subject: string;
    message: string;
    consentGiven: boolean;
    source?: string;
}

export interface ContactSubmissionResponse {
    success: boolean;
    message?: string;
    data?: {
        id: string;
        submittedAt: string;
    };
    error?: string;
    validationErrors?: Array<{ field: string; message: string }>;
}

export const contactApi = {
    /**
     * Submit a new contact form
     */
    submit: async (data: ContactFormData): Promise<ContactSubmissionResponse> => {
        const response = await api.post<ContactSubmissionResponse>('/contact/submit', data);
        return response.data;
    },
};
