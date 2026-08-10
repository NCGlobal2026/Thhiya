import { api } from './api';

// Service options for "What are you looking for today?"
export const SERVICE_OPTIONS = [
    'Employer of Record (EOR) / Professional Employer Organization (PEO) / Agent of Record (AOR)',
    'Global Payroll',
    'Incorporation / Entity Set-up',
    'Staffing / Talent Acquisition',
    'HRIS / Workforce Software (SaaS)',
    'Accounting Services',
    'Tax Services',
    'Compliance Services',
    'M&A or Market Entry Advisory',
    'Software Solutions',
    'Marketing Agencies',
    'Payroll Calculator',
    'Other',
] as const;

// Budget range options
export const BUDGET_OPTIONS = [
    '<$10,000',
    '$10,000–$50,000',
    '$50,000–$100,000',
    '$100,000+',
    'Not decided yet',
] as const;

// Decision making role options
export const DECISION_ROLE_OPTIONS = [
    'Final Decision Maker',
    'Recommender/Influencer',
    'Evaluator/Researcher',
    'Other',
] as const;

// Project highlights / problems to solve
export const PROJECT_HIGHLIGHTS_OPTIONS = [
    'Faster hiring and onboarding',
    'Compliance assurance',
    'Cost efficiency',
    'Market entry and incorporation',
    'Vendor consolidation',
    'Technology integration / HR automation',
    'Other',
] as const;

// Timeframe options
export const TIMEFRAME_OPTIONS = [
    'Immediately (within 30 days)',
    '1–3 months',
    '3–6 months',
    '6+ months',
    'Just exploring',
] as const;

// Vendor connection preference
export const VENDOR_CONNECTION_OPTIONS = [
    'Yes, share my details with matched vendors',
    "No, I'd like to get more details from Thhiya's team",
] as const;

// Communication mode options
export const COMMUNICATION_MODE_OPTIONS = ['Email', 'Call', 'Video Conference'] as const;

export interface BANTFormData {
    // Section 1: Basic Information
    fullName: string;
    businessEmail: string;
    jobTitle?: string;
    companyName: string;
    hqLocation?: string;
    websiteUrl?: string;

    // Section 2: Business Objective
    servicesLookingFor: string[];
    otherServiceDetails?: string;
    targetCountryOrRegion: string;
    additionalDetails?: string;

    // Section 3: Further Information
    budget?: string;
    decisionMakingRole?: string;
    otherDecisionRole?: string;
    projectHighlights: string[];
    otherProjectHighlights?: string;
    timeframe: string;

    // Section 4: Connection Preference
    vendorConnectionPreference: string;
    communicationMode: string[];

    // Section 5: Consent
    consentGiven: boolean;

    // Meta
    source?: string;
}

export interface BANTSubmissionResponse {
    success: boolean;
    message?: string;
    data?: {
        id: string;
        submittedAt: string;
    };
    error?: string;
    validationErrors?: Array<{ field: string; message: string }>;
}

export interface BANTSubmission extends BANTFormData {
    _id: string;
    status: 'new' | 'in-progress' | 'matched' | 'closed';
    notes?: string;
    assignedTo?: string;
    matchedVendors?: string[];
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BANTStatsResponse {
    success: boolean;
    data: {
        total: number;
        byStatus: {
            new: number;
            'in-progress': number;
            matched: number;
            closed: number;
        };
        recentSubmissions: Array<{
            _id: string;
            fullName: string;
            companyName: string;
            businessEmail: string;
            createdAt: string;
            status: string;
        }>;
        serviceBreakdown: Array<{ _id: string; count: number }>;
        countryBreakdown: Array<{ _id: string; count: number }>;
    };
}

export const bantApi = {
    /**
     * Submit a new BANT/MEDDIC/INTENT(BMI) form
     */
    submit: async (data: BANTFormData): Promise<BANTSubmissionResponse> => {
        const response = await api.post<BANTSubmissionResponse>('/bant/submit', data);
        return response.data;
    },

    /**
     * Get all submissions (admin)
     */
    getSubmissions: async (params?: {
        status?: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        success: boolean;
        data: BANTSubmission[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> => {
        const response = await api.get('/bant/submissions', { params });
        return response.data;
    },

    /**
     * Get a single submission by ID (admin)
     */
    getSubmission: async (id: string): Promise<{ success: boolean; data: BANTSubmission }> => {
        const response = await api.get(`/bant/submissions/${id}`);
        return response.data;
    },

    /**
     * Update a submission (admin)
     */
    updateSubmission: async (
        id: string,
        data: Partial<Pick<BANTSubmission, 'status' | 'notes' | 'assignedTo' | 'matchedVendors'>>
    ): Promise<{ success: boolean; data: BANTSubmission }> => {
        const response = await api.patch(`/bant/submissions/${id}`, data);
        return response.data;
    },

    /**
     * Get submission statistics (admin)
     */
    getStats: async (): Promise<BANTStatsResponse> => {
        const response = await api.get('/bant/submissions/stats');
        return response.data;
    },

    /**
     * Delete a submission (admin)
     */
    deleteSubmission: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/bant/submissions/${id}`);
        return response.data;
    },
};
