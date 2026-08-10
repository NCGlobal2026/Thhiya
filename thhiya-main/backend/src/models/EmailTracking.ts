import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTracking extends Document {
    // Email identification
    messageId: string;
    trackingId: string;
    
    // Email details
    type: 'user_acknowledgement' | 'admin_notification';
    recipient: string;
    subject: string;
    
    // Related submission
    bantSubmissionId?: mongoose.Types.ObjectId;
    
    // Tracking events
    sentAt: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    openCount: number;
    clickedAt?: Date;
    clickCount: number;
    clickedLinks: Array<{
        url: string;
        clickedAt: Date;
    }>;
    
    // Bounce/failure tracking
    bouncedAt?: Date;
    bounceType?: 'hard' | 'soft';
    bounceReason?: string;
    failedAt?: Date;
    failureReason?: string;
    
    // Status
    status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
    
    // Metadata
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    location?: {
        country?: string;
        region?: string;
        city?: string;
    };
    
    createdAt: Date;
    updatedAt: Date;
}

const EmailTrackingSchema = new Schema<IEmailTracking>(
    {
        messageId: {
            type: String,
            required: true,
            index: true,
        },
        trackingId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['user_acknowledgement', 'admin_notification'],
        },
        recipient: {
            type: String,
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
        },
        bantSubmissionId: {
            type: Schema.Types.ObjectId,
            ref: 'BANTSubmission',
            index: true,
        },
        sentAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        deliveredAt: {
            type: Date,
        },
        openedAt: {
            type: Date,
        },
        openCount: {
            type: Number,
            default: 0,
        },
        clickedAt: {
            type: Date,
        },
        clickCount: {
            type: Number,
            default: 0,
        },
        clickedLinks: [{
            url: String,
            clickedAt: Date,
        }],
        bouncedAt: {
            type: Date,
        },
        bounceType: {
            type: String,
            enum: ['hard', 'soft'],
        },
        bounceReason: {
            type: String,
        },
        failedAt: {
            type: Date,
        },
        failureReason: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
            default: 'sent',
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        device: {
            type: String,
        },
        location: {
            country: String,
            region: String,
            city: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
EmailTrackingSchema.index({ status: 1 });
EmailTrackingSchema.index({ sentAt: -1 });
EmailTrackingSchema.index({ type: 1, status: 1 });
EmailTrackingSchema.index({ recipient: 1, sentAt: -1 });

export default mongoose.model<IEmailTracking>('EmailTracking', EmailTrackingSchema);
