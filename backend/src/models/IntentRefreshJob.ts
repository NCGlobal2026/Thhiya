import mongoose, { Document, Schema } from 'mongoose';

export interface IIntentRefreshJobItem {
    providerId: mongoose.Types.ObjectId;
    providerName: string;
    status: 'updated' | 'skipped' | 'failed';
    message?: string;
    previousLastUpdated?: Date;
    newLastUpdated?: Date;
    startedAt: Date;
    completedAt?: Date;
}

export interface IIntentRefreshJob extends Document {
    jobKey: string;
    trigger: 'startup' | 'cron' | 'manual' | 'backlog';
    status: 'running' | 'completed' | 'completed_with_errors' | 'failed';
    refreshWindowDays: number;
    staleCutoff: Date;
    startedAt: Date;
    completedAt?: Date;
    checkedProviderCount: number;
    staleProviderCount: number;
    updatedCount: number;
    skippedCount: number;
    failedCount: number;
    items: IIntentRefreshJobItem[];
    errorMessage?: string;
    nextEligibleRunAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const IntentRefreshJobItemSchema = new Schema<IIntentRefreshJobItem>(
    {
        providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
        providerName: { type: String, required: true },
        status: { type: String, enum: ['updated', 'skipped', 'failed'], required: true },
        message: { type: String },
        previousLastUpdated: { type: Date },
        newLastUpdated: { type: Date },
        startedAt: { type: Date, required: true },
        completedAt: { type: Date },
    },
    { _id: false },
);

const IntentRefreshJobSchema = new Schema<IIntentRefreshJob>(
    {
        jobKey: { type: String, required: true, unique: true, index: true },
        trigger: { type: String, enum: ['startup', 'cron', 'manual', 'backlog'], required: true },
        status: { type: String, enum: ['running', 'completed', 'completed_with_errors', 'failed'], required: true },
        refreshWindowDays: { type: Number, required: true },
        staleCutoff: { type: Date, required: true },
        startedAt: { type: Date, required: true },
        completedAt: { type: Date },
        checkedProviderCount: { type: Number, default: 0 },
        staleProviderCount: { type: Number, default: 0 },
        updatedCount: { type: Number, default: 0 },
        skippedCount: { type: Number, default: 0 },
        failedCount: { type: Number, default: 0 },
        items: { type: [IntentRefreshJobItemSchema], default: [] },
        errorMessage: { type: String },
        nextEligibleRunAt: { type: Date },
    },
    {
        timestamps: true,
    },
);

IntentRefreshJobSchema.index({ startedAt: -1 });
IntentRefreshJobSchema.index({ status: 1, startedAt: -1 });

export default mongoose.model<IIntentRefreshJob>('IntentRefreshJob', IntentRefreshJobSchema);
