import mongoose, { Schema, Document } from 'mongoose';

// Subject options for contact form
export const SUBJECT_OPTIONS = [
    'General Inquiry',
    'Partnership Opportunity',
    'Service Question',
    'Other',
] as const;

export interface IContactSubmission extends Document {
    fullName: string;
    businessEmail: string;
    companyName: string;
    jobTitle?: string;
    phone?: string;
    subject: string;
    message: string;
    consentGiven: boolean;

    // Meta fields
    status: 'new' | 'responded' | 'closed';
    notes?: string;
    source?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
    {
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
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: [200, 'Company name cannot exceed 200 characters'],
        },
        jobTitle: {
            type: String,
            trim: true,
            maxlength: [100, 'Job title cannot exceed 100 characters'],
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [50, 'Phone number cannot exceed 50 characters'],
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            enum: SUBJECT_OPTIONS,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: [5000, 'Message cannot exceed 5000 characters'],
        },
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
            enum: ['new', 'responded', 'closed'],
            default: 'new',
        },
        notes: {
            type: String,
            trim: true,
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
ContactSubmissionSchema.index({ businessEmail: 1 });
ContactSubmissionSchema.index({ companyName: 1 });
ContactSubmissionSchema.index({ status: 1 });
ContactSubmissionSchema.index({ createdAt: -1 });
ContactSubmissionSchema.index({ companyName: 'text', fullName: 'text', message: 'text' });

export default mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
