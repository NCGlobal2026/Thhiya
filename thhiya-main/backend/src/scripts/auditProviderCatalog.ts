import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Provider from '../models/Provider.ts';
import { PROVIDER_CATALOG } from '../constants/providerCatalog.ts';

dotenv.config();

type ProviderLike = {
    slug?: string;
    name?: string;
    intentScore?: number;
    scoringFactors?: unknown;
    sentimentAnalysis?: unknown;
};

function normalizeSlug(value?: string) {
    return (value || '').trim().toLowerCase();
}

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const dbProviders = await Provider.find({}, {
        slug: 1,
        name: 1,
        intentScore: 1,
        scoringFactors: 1,
        sentimentAnalysis: 1,
    }).lean<ProviderLike[]>();

    const catalogSlugs = new Set(PROVIDER_CATALOG.map((provider) => normalizeSlug(provider.slug)));
    const dbSlugs = new Set(dbProviders.map((provider) => normalizeSlug(provider.slug)).filter(Boolean));

    const missingDbProviders = PROVIDER_CATALOG
        .filter((provider) => !dbSlugs.has(normalizeSlug(provider.slug)))
        .map((provider) => provider.slug)
        .sort();

    const extraDbProviders = dbProviders
        .map((provider) => normalizeSlug(provider.slug))
        .filter((slug) => slug && !catalogSlugs.has(slug))
        .sort();

    const missingScores = dbProviders
        .filter((provider) => {
            const hasIntentScore = typeof provider.intentScore === 'number';
            const hasScoringFactors = !!provider.scoringFactors;
            const hasSentimentAnalysis = !!provider.sentimentAnalysis;
            return !hasIntentScore || !hasScoringFactors || !hasSentimentAnalysis;
        })
        .map((provider) => normalizeSlug(provider.slug))
        .filter(Boolean)
        .sort();

    console.log('\nProvider Catalog Audit');
    console.log('======================');
    console.log(`total catalog providers: ${PROVIDER_CATALOG.length}`);
    console.log(`total db providers: ${dbProviders.length}`);
    console.log(`missing db providers: ${missingDbProviders.length}`);
    console.log(`missing scores: ${missingScores.length}`);
    console.log(`slug mismatches: ${extraDbProviders.length}`);

    if (missingDbProviders.length) {
        console.log('\nMissing DB providers:');
        for (const slug of missingDbProviders) {
            console.log(`- ${slug}`);
        }
    }

    if (missingScores.length) {
        console.log('\nProviders missing intent fields:');
        for (const slug of missingScores) {
            console.log(`- ${slug}`);
        }
    }

    if (extraDbProviders.length) {
        console.log('\nDB providers not found in catalog:');
        for (const slug of extraDbProviders) {
            console.log(`- ${slug}`);
        }
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
}

main().catch((error) => {
    console.error('Fatal:', error);
    process.exit(1);
});
