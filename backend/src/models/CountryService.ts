import mongoose, { Schema, Document } from 'mongoose';

// Section content interfaces
export interface ITableRow {
  label: string;
  values: (string | number)[];
  highlight?: boolean;
}

export interface ITable {
  headers: string[];
  rows: ITableRow[];
}

export interface IStep {
  stepNumber?: number;
  title: string;
  description: string;
  icon?: string;
}

export interface IContentItem {
  title?: string;
  text: string;
  icon?: string;
  type?: 'info' | 'warning' | 'success' | 'tip';
}

export interface IDefinition {
  term: string;
  definition: string;
}

export interface IFAQItem {
  question: string;
  answer: string;
}

export interface ISectionContent {
  table?: ITable;
  steps?: IStep[];
  items?: IContentItem[];
  definitions?: IDefinition[];
  faqs?: IFAQItem[];
  html?: string;
  markdown?: string;
}

export interface ISectionStyling {
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string;
  iconColor?: string;
}

export interface IServiceSection {
  id: string;
  type: 'cost_breakdown' | 'key_steps' | 'essentials' | 'insights' | 'good_to_know' | 'deductions' | 'faq' | 'custom';
  title: string;
  subtitle?: string;
  description?: string;
  order: number;
  content: ISectionContent;
  styling?: ISectionStyling;
}

// Interactive component interfaces
export interface IDeduction {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  employerPaid?: boolean;
}

export interface IPhase {
  name: string;
  duration: string;
  description: string;
}

export interface IComparisonOption {
  label: string;
  value: number;
  description: string;
}

export interface IInteractiveComponentConfig {
  baseSalary?: { min: number; max: number; default: number; currency: string };
  deductions?: IDeduction[];
  phases?: IPhase[];
  options?: IComparisonOption[];
}

export interface IInteractiveComponent {
  id: string;
  type: 'salary_calculator' | 'cost_estimator' | 'comparison_slider' | 'compliance_checklist' | 'timeline_visualizer';
  sectionId: string;
  config: IInteractiveComponentConfig;
}

// Hero data interface
export interface IHeroData {
  title: string;
  subtitle: string;
  description: string;
  bestFor: string;
  icon?: string;
}

// Main document interface
export interface ICountryService extends Document {
  country: string;
  countryCode: string;
  countrySlug: string;
  region: string;
  service: string;
  serviceSlug: string;
  serviceNumber: number;

  heroData: IHeroData;
  sections: IServiceSection[];
  interactiveComponents?: IInteractiveComponent[];

  ctaText: string;
  ctaLink?: string;

  metadata: {
    lastUpdated: Date;
    version: string;
    contributors?: string[];
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const TableRowSchema = new Schema({
  label: { type: String, required: true },
  values: [{ type: Schema.Types.Mixed, required: true }],
  highlight: { type: Boolean, default: false }
}, { _id: false });

const TableSchema = new Schema({
  headers: [{ type: String, required: true }],
  rows: [TableRowSchema]
}, { _id: false });

const StepSchema = new Schema({
  stepNumber: { type: Number },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }
}, { _id: false });

const ContentItemSchema = new Schema({
  title: { type: String },
  text: { type: String, required: true },
  icon: { type: String },
  type: { type: String, enum: ['info', 'warning', 'success', 'tip'] }
}, { _id: false });

const DefinitionSchema = new Schema({
  term: { type: String, required: true },
  definition: { type: String, required: true }
}, { _id: false });

const FAQItemSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const SectionContentSchema = new Schema({
  table: TableSchema,
  steps: [StepSchema],
  items: [ContentItemSchema],
  definitions: [DefinitionSchema],
  faqs: [FAQItemSchema],
  html: { type: String },
  markdown: { type: String }
}, { _id: false });

const SectionStylingSchema = new Schema({
  bgColor: { type: String },
  textColor: { type: String },
  borderColor: { type: String },
  icon: { type: String },
  iconColor: { type: String }
}, { _id: false });

const ServiceSectionSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['cost_breakdown', 'key_steps', 'essentials', 'insights', 'good_to_know', 'deductions', 'faq', 'custom']
  },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  order: { type: Number, required: true },
  content: { type: SectionContentSchema, required: true },
  styling: SectionStylingSchema
}, { _id: false });

const DeductionSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  employerPaid: { type: Boolean, default: false }
}, { _id: false });

const PhaseSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const ComparisonOptionSchema = new Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  description: { type: String, required: true }
}, { _id: false });

const InteractiveComponentConfigSchema = new Schema({
  baseSalary: {
    min: { type: Number },
    max: { type: Number },
    default: { type: Number },
    currency: { type: String }
  },
  deductions: [DeductionSchema],
  phases: [PhaseSchema],
  options: [ComparisonOptionSchema]
}, { _id: false });

const InteractiveComponentSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['salary_calculator', 'cost_estimator', 'comparison_slider', 'compliance_checklist', 'timeline_visualizer']
  },
  sectionId: { type: String, required: true },
  config: { type: InteractiveComponentConfigSchema, required: true }
}, { _id: false });

const HeroDataSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  bestFor: { type: String, required: true },
  icon: { type: String }
}, { _id: false });

const CountryServiceSchema = new Schema<ICountryService>({
  country: {
    type: String,
    required: true,
    index: true
  },
  countryCode: {
    type: String,
    required: true,
    index: true
  },
  countrySlug: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
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
  serviceNumber: {
    type: Number,
    required: false
  },

  heroData: {
    type: HeroDataSchema,
    required: true
  },

  sections: {
    type: [ServiceSectionSchema],
    required: true,
    validate: {
      validator: function (sections: IServiceSection[]) {
        return sections.length > 0;
      },
      message: 'At least one section is required'
    }
  },

  interactiveComponents: [InteractiveComponentSchema],

  ctaText: {
    type: String,
    required: true
  },
  ctaLink: { type: String },

  metadata: {
    lastUpdated: { type: Date, default: Date.now },
    version: { type: String, default: '1.0' },
    contributors: [{ type: String }]
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
CountryServiceSchema.index({ country: 1, serviceSlug: 1 }, { unique: true });
CountryServiceSchema.index({ countrySlug: 1, serviceSlug: 1 }, { unique: true });
CountryServiceSchema.index({ countryCode: 1, service: 1 });
CountryServiceSchema.index({ isActive: 1, country: 1 });
CountryServiceSchema.index({ serviceSlug: 1, region: 1 });

export default mongoose.model<ICountryService>('CountryService', CountryServiceSchema);
