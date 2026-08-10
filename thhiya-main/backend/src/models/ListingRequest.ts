import mongoose, { Schema, Document } from 'mongoose';

export interface IListingRequest extends Document {
    userId?: mongoose.Types.ObjectId;
    companyName: string;
    website: string;
    contactName: string;
    contactRole: string;
    contactPhone: string;
    email: string;
    serviceMatrix: {
        countries: string[];
        services: string[];
    }[];
    answers: Record<string, any>;
    selectedPlan?: string | null;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    approvedAt?: Date;
}

const listingRequestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    companyName: { type: String, required: true },
    website: { type: String, required: true },
    contactName: { type: String, required: true },
    contactRole: { type: String, required: true },
    contactPhone: { type: String },
    email: { type: String, required: true },
    serviceMatrix: [{
        countries: [{ type: String }],
        services: [{ type: String }]
    }],
    answers: { type: Schema.Types.Mixed, default: {} },
    selectedPlan: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date }
});

export default mongoose.model<IListingRequest>('ListingRequest', listingRequestSchema);
