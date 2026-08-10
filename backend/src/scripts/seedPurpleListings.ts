import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PurpleListing from '../models/PurpleListing.ts';

dotenv.config();

type FrontendCompany = {
    id?: string;
    slug: string;
    name: string;
    logo?: string;
    shortDescription?: string;
    fullDescription?: string;
    rating?: number;
    reviewCount?: number;
    categories?: string[];
    tags?: string[];
    foundedYear?: number;
    headquarters?: string;
    website?: string;
    pricing?: {
        startingAt?: string;
        model?: string;
        freeTrial?: boolean;
    };
    features?: string[];
    pros?: string[];
    cons?: string[];
    screenshots?: string[];
    supportedCountries?: string[];
    serviceFeatures?: string[];
};

const normalizeCompany = (company: FrontendCompany) => ({
    slug: company.slug,
    name: company.name,
    logo: company.logo ?? '',
    shortDescription: company.shortDescription ?? '',
    fullDescription: company.fullDescription ?? '',
    rating: Number(company.rating ?? 0),
    reviewCount: Number(company.reviewCount ?? 0),
    categories: Array.isArray(company.categories) ? company.categories : [],
    tags: Array.isArray(company.tags) ? company.tags : [],
    foundedYear: Number(company.foundedYear ?? 0),
    headquarters: company.headquarters ?? '',
    website: company.website ?? '',
    pricing: {
        startingAt: company.pricing?.startingAt ?? '',
        model: company.pricing?.model ?? '',
        freeTrial: Boolean(company.pricing?.freeTrial ?? false),
    },
    features: Array.isArray(company.features) ? company.features : [],
    pros: Array.isArray(company.pros) ? company.pros : [],
    cons: Array.isArray(company.cons) ? company.cons : [],
    screenshots: Array.isArray(company.screenshots) ? company.screenshots : [],
    supportedCountries: Array.isArray(company.supportedCountries) ? company.supportedCountries : [],
    serviceFeatures: Array.isArray(company.serviceFeatures) ? company.serviceFeatures : [],
});

async function loadCompanies(): Promise<FrontendCompany[]> {
    const module = await import('../../../frontend/src/features/purple-listings/data/companies.ts');
    return Array.isArray(module.COMPANIES) ? module.COMPANIES : [];
}

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set in environment');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const companies = await loadCompanies();
    if (!companies.length) {
        console.error('No companies found in frontend purple listings dataset');
        process.exit(1);
    }

    console.log(`Loaded ${companies.length} frontend companies`);

    let upsertedCount = 0;

    for (const company of companies) {
        const document = normalizeCompany(company);

        await PurpleListing.findOneAndUpdate(
            { slug: document.slug },
            { $set: document },
            { upsert: true, new: true, runValidators: false }
        );

        upsertedCount += 1;
    }

    const totalPurpleListings = await PurpleListing.countDocuments({});
    console.log(`Upserted ${upsertedCount} purple listings`);
    console.log(`Purple listings now in database: ${totalPurpleListings}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

main().catch(async (error) => {
    console.error('Fatal error while seeding purple listings:', error);
    try {
        await mongoose.disconnect();
    } catch { }
    process.exit(1);
});
