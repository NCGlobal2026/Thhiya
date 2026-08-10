import mongoose, { Schema, Document } from 'mongoose';

export interface IProvider extends Document {
  name: string;
  slug?: string;
  country: string;
  service: string;
  logo?: string;
  matchingScore?: string;
  rating?: string;
  productBudget?: string;
  averageSatisfaction?: string;
  clientType?: string;
  badges?: string[];
  details?: Record<string, unknown>;
  isActive?: boolean;
  intentScore?: number;
  scoringFactors?: {
    marketMomentum: string;
    userSentiment: string;
    featureInnovation: string;
    transparency: string;
  };
  sentimentAnalysis?: {
    positiveReviews: string[];
    negativeReviews: string[];
    lastUpdated: Date;
  };
  intentAnalysisStatus?: 'pending' | 'core_complete' | 'enriched' | 'failed' | 'quota_exceeded';
  intentAnalysisMeta?: {
    lastCoreUpdated?: Date;
    lastEnrichedUpdated?: Date;
    lastAttemptedAt?: Date;
    lastFailureAt?: Date;
    lastFailureReason?: string;
    lastQuotaExceededAt?: Date;
    nextRetryAt?: Date;
    failureCount?: number;
    enrichmentComplete?: boolean;
    positiveReviewCount?: number;
    negativeReviewCount?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ProviderSchema = new Schema<IProvider>({
  name: { type: String, required: true },
  slug: { type: String, trim: true, lowercase: true },
  country: { type: String, required: true },
  service: { type: String, required: true },
  logo: { type: String },
  matchingScore: { type: String },
  rating: { type: String },
  productBudget: { type: String },
  averageSatisfaction: { type: String },
  clientType: { type: String },
  badges: { type: [String], default: [] },
  details: { type: Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  intentScore: { type: Number, min: 0, max: 10 },
  scoringFactors: {
    marketMomentum: { type: String },
    userSentiment: { type: String },
    featureInnovation: { type: String },
    transparency: { type: String }
  },
  sentimentAnalysis: {
    positiveReviews: { type: [String], default: [] },
    negativeReviews: { type: [String], default: [] },
    lastUpdated: { type: Date }
  },
  intentAnalysisStatus: {
    type: String,
    enum: ['pending', 'core_complete', 'enriched', 'failed', 'quota_exceeded'],
    default: 'pending'
  },
  intentAnalysisMeta: {
    lastCoreUpdated: { type: Date },
    lastEnrichedUpdated: { type: Date },
    lastAttemptedAt: { type: Date },
    lastFailureAt: { type: Date },
    lastFailureReason: { type: String },
    lastQuotaExceededAt: { type: Date },
    nextRetryAt: { type: Date },
    failureCount: { type: Number, default: 0 },
    enrichmentComplete: { type: Boolean, default: false },
    positiveReviewCount: { type: Number, default: 0 },
    negativeReviewCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
});

ProviderSchema.index({ service: 1, country: 1 });
ProviderSchema.index({ slug: 1 });
ProviderSchema.index({ isActive: 1, 'sentimentAnalysis.lastUpdated': 1 });
ProviderSchema.index({ intentAnalysisStatus: 1, 'intentAnalysisMeta.lastCoreUpdated': 1 });
ProviderSchema.index({ intentAnalysisStatus: 1, 'intentAnalysisMeta.lastEnrichedUpdated': 1 });
ProviderSchema.index({ intentAnalysisStatus: 1, 'intentAnalysisMeta.nextRetryAt': 1 });

export default mongoose.model<IProvider>('Provider', ProviderSchema);
