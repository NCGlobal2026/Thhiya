import mongoose, { Schema, Document } from 'mongoose';

// Service options for "What are you looking for today?"
export const SERVICE_OPTIONS = [
    'Employer of Record (EOR) / Professional Employer Organization (PEO) / Agent of Record (AOR)',
    'Incorporation / Entity Set-up',
    'Staffing / Talent Acquisition',
    'Global Payroll',
    'HRIS / Workforce Software (SaaS)',
    'Accounting / Tax / Compliance',
    'M&A or Market Entry Advisory',
    'Marketing Agencies',
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
    'No, I\'d like to get more details from Thhiya\'s team',
] as const;

// Communication mode options
export const COMMUNICATION_MODE_OPTIONS = [
    'Email',
    'Call',
    'Video Conference',
] as const;

export interface IBANTSubmission extends Document {
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

    // Meta fields
    status: 'new' | 'in-progress' | 'matched' | 'closed';
    notes?: string;
    assignedTo?: string;
    matchedVendors?: string[];
    source?: string; // Where the form was submitted from (e.g., 'landing-page', 'insights-hub')
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BANTSubmissionSchema = new Schema<IBANTSubmission>(
    {
        // Section 1: Basic Information
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            maxlength: [100, 'Full name cannot exceed 100 characters'],
        },
        businessEmail: {
            type: String,
            required: [true, 'Business email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        jobTitle: {
            type: String,
            trim: true,
            maxlength: [100, 'Job title cannot exceed 100 characters'],
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: [200, 'Company name cannot exceed 200 characters'],
        },
        hqLocation: {
            type: String,
            trim: true,
            maxlength: [200, 'HQ location cannot exceed 200 characters'],
        },
        websiteUrl: {
            type: String,
            trim: true,
            maxlength: [500, 'Website URL cannot exceed 500 characters'],
        },

        // Section 2: Business Objective
        servicesLookingFor: {
            type: [String],
            required: [true, 'Please select at least one service'],
            validate: {
                validator: function (v: string[]) {
                    return v && v.length > 0;
                },
                message: 'Please select at least one service',
            },
        },
        otherServiceDetails: {
            type: String,
            trim: true,
            maxlength: [1000, 'Other service details cannot exceed 1000 characters'],
            validate: {
                validator: function (v: string): boolean {
                    // If 'Other' is selected in servicesLookingFor, otherServiceDetails is required
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const doc = this as any;
                    if (doc.servicesLookingFor && doc.servicesLookingFor.includes('Other')) {
                        return Boolean(v && v.trim().length > 0);
                    }
                    return true;
                },
                message: 'Please specify the other service',
            },
        },
        targetCountryOrRegion: {
            type: String,
            required: [true, 'Target country or region is required'],
            trim: true,
            maxlength: [500, 'Target country or region cannot exceed 500 characters'],
        },
        additionalDetails: {
            type: String,
            trim: true,
            maxlength: [2000, 'Additional details cannot exceed 2000 characters'],
        },

        // Section 3: Further Information
        budget: {
            type: String,
            enum: [...BUDGET_OPTIONS, ''],
        },
        decisionMakingRole: {
            type: String,
            enum: [...DECISION_ROLE_OPTIONS, ''],
        },
        otherDecisionRole: {
            type: String,
            trim: true,
            maxlength: [200, 'Other decision role cannot exceed 200 characters'],
            validate: {
                validator: function (v: string): boolean {
                    // If 'Other' is selected in decisionMakingRole, otherDecisionRole is required
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const doc = this as any;
                    if (doc.decisionMakingRole === 'Other') {
                        return Boolean(v && v.trim().length > 0);
                    }
                    return true;
                },
                message: 'Please specify your role',
            },
        },
        projectHighlights: {
            type: [String],
            default: [],
        },
        otherProjectHighlights: {
            type: String,
            trim: true,
            maxlength: [1000, 'Other project highlights cannot exceed 1000 characters'],
            validate: {
                validator: function (v: string): boolean {
                    // If 'Other' is selected in projectHighlights, otherProjectHighlights is required
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const doc = this as any;
                    if (doc.projectHighlights && doc.projectHighlights.includes('Other')) {
                        return Boolean(v && v.trim().length > 0);
                    }
                    return true;
                },
                message: 'Please specify other highlights',
            },
        },
        timeframe: {
            type: String,
            enum: [...TIMEFRAME_OPTIONS, ''],
        },

        // Section 4: Connection Preference
        vendorConnectionPreference: {
            type: String,
            required: [true, 'Vendor connection preference is required'],
            enum: VENDOR_CONNECTION_OPTIONS,
        },
        communicationMode: {
            type: [String],
            default: [],
        },

        // Section 5: Consent
        consentGiven: {
            type: Boolean,
            required: [true, 'Consent is required'],
            validate: {
                validator: function (v: boolean) {
                    return v === true;
                },
                message: 'You must consent to proceed',
            },
        },

        // Meta fields
        status: {
            type: String,
            enum: ['new', 'in-progress', 'matched', 'closed'],
            default: 'new',
        },
        notes: {
            type: String,
            trim: true,
        },
        assignedTo: {
            type: String,
            trim: true,
        },
        matchedVendors: {
            type: [String],
            default: [],
        },
        source: {
            type: String,
            trim: true,
        },
        ipAddress: {
            type: String,
            trim: true,
        },
        userAgent: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
BANTSubmissionSchema.index({ businessEmail: 1 });
BANTSubmissionSchema.index({ companyName: 1 });
BANTSubmissionSchema.index({ status: 1 });
BANTSubmissionSchema.index({ createdAt: -1 });
BANTSubmissionSchema.index({ targetCountryOrRegion: 'text', companyName: 'text', fullName: 'text' });

export default mongoose.model<IBANTSubmission>('BANTSubmission', BANTSubmissionSchema);
