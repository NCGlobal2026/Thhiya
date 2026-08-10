import mongoose, { Schema, Document } from 'mongoose';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    TRIALING = 'trialing'
}

export interface ISubscription extends Document {
    vendorProfileId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    stripeSubscriptionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
    vendorProfileId: { type: Schema.Types.ObjectId, ref: 'VendorProfile', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.TRIALING
    },
    currentPeriodEnd: { type: Date, required: true },
    stripeSubscriptionId: { type: String, trim: true }
}, {
    timestamps: true,
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
