import mongoose, { Schema, Document } from 'mongoose';

export interface IPurpleListing extends Document {
    slug: string;
    name: string;
    logo: string;
    shortDescription: string;
    fullDescription: string;
    rating: number;
    reviewCount: number;
    categories: string[];
    tags: string[];
    foundedYear: number;
    headquarters: string;
    website: string;
    pricing: {
        startingAt: string;
        model: string;
        freeTrial: boolean;
    };
    features: string[];
    pros: string[];
    cons: string[];
    screenshots: string[];
    supportedCountries: string[];
    serviceFeatures: string[];
    createdAt: Date;
    updatedAt: Date;
}

const purpleListingSchema = new Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    rating: { type: Number, required: true },
    reviewCount: { type: Number, required: true },
    categories: [{ type: String }],
    tags: [{ type: String }],
    foundedYear: { type: Number, required: true },
    headquarters: { type: String, required: true },
    website: { type: String, required: true },
    pricing: {
        startingAt: { type: String },
        model: { type: String },
        freeTrial: { type: Boolean }
    },
    features: [{ type: String }],
    pros: [{ type: String }],
    cons: [{ type: String }],
    screenshots: [{ type: String }],
    supportedCountries: [{ type: String }],
    serviceFeatures: [{ type: String }]
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model<IPurpleListing>('PurpleListing', purpleListingSchema);
