import mongoose, { Schema, Document } from 'mongoose';

export enum BillingCycle {
    MONTHLY = 'monthly',
    YEARLY = 'yearly'
}

export interface IPlan extends Document {
    name: string;
    price: number;
    billingCycle: BillingCycle;
    features: string[];
    stripeProductId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    billingCycle: {
        type: String,
        enum: Object.values(BillingCycle),
        required: true
    },
    features: [{ type: String }],
    stripeProductId: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
});

export default mongoose.model<IPlan>('Plan', PlanSchema);
