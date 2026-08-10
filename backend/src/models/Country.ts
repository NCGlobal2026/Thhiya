import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  code: string; // ISO country code like 'US', 'AE', 'IN'
  slug: string;
  flag: string; // URL or path to flag image
  region?: string;
  languages: string[];
  currency?: string;
  employmentCost?: string;
  annualLeave?: string;
  defaultService?: string;
  servicesOffered: string[];
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  flag: {
    type: String,
    required: true
  },
  region: {
    type: String,
    trim: true
  },
  languages: {
    type: [String],
    default: []
  },
  currency: {
    type: String,
    default: 'Local Currency'
  },
  employmentCost: {
    type: String,
    default: 'Varies'
  },
  annualLeave: {
    type: String
  },
  defaultService: {
    type: String,
    trim: true
  },
  servicesOffered: {
    type: [String],
    default: []
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexing for search performance
CountrySchema.index({ region: 1, isActive: 1 });
CountrySchema.index({ isActive: 1, updatedAt: -1 });
CountrySchema.index({ languages: 1 });
CountrySchema.index({ servicesOffered: 1 });
CountrySchema.index({ name: 1, isActive: 1 });
CountrySchema.index({ name: 'text', region: 'text', 'servicesOffered': 'text' }); // Text search index

export default mongoose.model<ICountry>('Country', CountrySchema);
