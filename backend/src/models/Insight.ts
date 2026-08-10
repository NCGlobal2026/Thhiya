import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryBreakdownItem {
  label: string;
  amount: string;
  percent?: string;
  note?: string;
}

export interface IPayrollInsightItem {
  title: string;
  description: string;
}

export interface IEmploymentRequirementPoint {
  subtitle?: string;
  text: string;
}

export interface IBusinessGuideSection {
  title: string;
  text: string;
  icon?: string;
}

export interface IInsight extends Document {
  service: string;
  serviceSlug: string;
  country: string;

  // Salary Breakdown
  salaryBreakdown: {
    title: string;
    subtitle: string;
    description: string;
    breakdown: ISalaryBreakdownItem[];
  };

  // Payroll Insights
  payrollInsights: {
    heading: string;
    image?: string;
    items: IPayrollInsightItem[];
  };

  // Employment Requirements
  employmentRequirements: {
    title: string;
    image?: string;
    points: IEmploymentRequirementPoint[];
  };

  // Business Guide
  businessGuide: {
    title: string;
    subtitle: string;
    description: string;
    flag?: string;
    sections: IBusinessGuideSection[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const SalaryBreakdownItemSchema = new Schema({
  label: { type: String, required: true },
  amount: { type: String },
  percent: { type: String },
  note: { type: String }
}, { _id: false });

const PayrollInsightItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const EmploymentRequirementPointSchema = new Schema({
  subtitle: { type: String },
  text: { type: String, required: true }
}, { _id: false });

const BusinessGuideSectionSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  icon: { type: String }
}, { _id: false });

const InsightSchema = new Schema<IInsight>({
  service: {
    type: String,
    required: true,
    index: true
  },
  serviceSlug: {
    type: String,
    required: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },

  salaryBreakdown: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    breakdown: [SalaryBreakdownItemSchema]
  },

  payrollInsights: {
    heading: { type: String, required: true },
    image: { type: String },
    items: [PayrollInsightItemSchema]
  },

  employmentRequirements: {
    title: { type: String, required: true },
    image: { type: String },
    points: [EmploymentRequirementPointSchema]
  },

  businessGuide: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    flag: { type: String },
    sections: [BusinessGuideSectionSchema]
  }
}, {
  timestamps: true
});

// Compound index for efficient querying using canonical service slug
InsightSchema.index({ serviceSlug: 1, country: 1 }, { unique: true });

// Fallback index for human-friendly service label
InsightSchema.index({ service: 1, country: 1 }, { unique: false });

// Sorting and filtering performance
InsightSchema.index({ updatedAt: -1 });
InsightSchema.index({ serviceSlug: 1, updatedAt: -1 });

export default mongoose.model<IInsight>('Insight', InsightSchema);
