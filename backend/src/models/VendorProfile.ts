import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Basic Info
  companyName: string;
  website: string;
  contactPerson: {
    name: string;
    role: string;
    phone?: string;
  };
  
  // Matrix: Country -> Services[]
  // Stored as Map for flexibility or Array of Objects
  serviceCoverage: {
    country: string;
    services: string[];
  }[];

  // The "Big List" Questionnaire Responses
  // Structure: { [countryIso]: { [serviceSlug]: { [questionId]: answer } } }
  // We use Mixed because the schema is highly dynamic based on service/country
  questionnaireAnswers: Record<string, any>;

  onboardingStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  createdAt: Date;
  updatedAt: Date;
}

const VendorProfileSchema = new Schema<IVendorProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  companyName: { type: String, required: true, trim: true },
  website: { type: String, required: true, trim: true },
  
  contactPerson: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String }
  },

  serviceCoverage: [{
    country: { type: String, required: true },
    services: { type: [String], required: true }
  }],

  questionnaireAnswers: { type: Schema.Types.Mixed, default: {} },

  onboardingStatus: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'rejected'], 
    default: 'draft' 
  }
}, {
  timestamps: true,
});

export default mongoose.model<IVendorProfile>('VendorProfile', VendorProfileSchema);
