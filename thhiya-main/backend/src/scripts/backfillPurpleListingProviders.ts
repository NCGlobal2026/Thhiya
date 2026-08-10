import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PurpleListing from '../models/PurpleListing.ts';
import Provider from '../models/Provider.ts';

dotenv.config();

type PurpleListingDoc = {
    _id: mongoose.Types.ObjectId;
    slug: string;
    name: string;
    website: string;
    categories?: string[];
    supportedCountries?: string[];
};

type ProviderDoc = {
    _id: mongoose.Types.ObjectId;
    slug?: string;
    name: string;
    country: string;
    service: string;
};

const DEFAULT_COUNTRY = 'Global';
const DEFAULT_SERVICE = 'Employer of Record';

const toComparableValue = (value: unknown) =>
    typeof value === 'string' ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') : '';

const buildProviderLookupVariants = (name: string, slug: string, website?: string) => {
    const normalizedName = name.trim().toLowerCase();
    const normalizedSlug = slug.trim().toLowerCase();
    const hostname = (() => {
        if (!website) return null;
        try {
            return new URL(website).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
            return null;
        }
    })();

    const nameWithoutPunctuation = normalizedName.replace(/[^a-z0-9]+/g, '');
    const slugWithoutPunctuation = normalizedSlug.replace(/[^a-z0-9]+/g, '');

    return Array.from(
        new Set(
            [
                normalizedName,
                normalizedSlug,
                nameWithoutPunctuation,
                slugWithoutPunctuation,
                hostname,
                hostname?.replace(/\.[a-z.]+$/, ''),
            ].filter(Boolean),
        ),
    );
};

const buildProviderIndexKeys = (provider: ProviderDoc) =>
    Array.from(
        new Set(
            [
                provider.slug,
                provider.name,
                toComparableValue(provider.slug),
                toComparableValue(provider.name),
            ].filter(Boolean),
        ),
    );

const findBestProviderMatch = (listing: PurpleListingDoc, providers: ProviderDoc[]) => {
    const lookupValues = buildProviderLookupVariants(listing.name, listing.slug, listing.website);
    const comparableLookupValues = lookupValues.map((value) => toComparableValue(value)).filter(Boolean);

    for (const provider of providers) {
        const providerKeys = buildProviderIndexKeys(provider);

        if (
            providerKeys.some((key) => {
                const comparableKey = toComparableValue(key);
                return lookupValues.includes(String(key)) || comparableLookupValues.includes(comparableKey);
            })
        ) {
            return provider;
        }
    }

    return null;
};

const inferCountry = (listing: PurpleListingDoc) =>
    listing.supportedCountries?.find(Boolean)?.trim() || DEFAULT_COUNTRY;

const inferService = (listing: PurpleListingDoc) =>
    listing.categories?.find(Boolean)?.trim() || DEFAULT_SERVICE;

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set');
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const createMode = args.includes('--create');
    const limitArg = args.find((arg) => arg.startsWith('--limit='));
    const limit = limitArg ? Math.max(Number(limitArg.split('=')[1]) || 0, 0) : 0;

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const listings = await PurpleListing.find(
        {},
        {
            slug: 1,
            name: 1,
            website: 1,
            categories: 1,
            supportedCountries: 1,
        },
    ).lean<PurpleListingDoc[]>();

    const providers = await Provider.find(
        {},
        {
            slug: 1,
            name: 1,
            country: 1,
            service: 1,
        },
    ).lean<ProviderDoc[]>();

    const unmatched = listings.filter((listing) => !findBestProviderMatch(listing, providers));
    const targets = limit > 0 ? unmatched.slice(0, limit) : unmatched;

    console.log(
        JSON.stringify(
            {
                totalPurpleListings: listings.length,
                totalProviders: providers.length,
                unmatchedPurpleListings: unmatched.length,
                processingTargets: targets.length,
                mode: createMode ? (dryRun ? 'create-dry-run' : 'create') : 'audit',
                sampleUnmatched: unmatched.slice(0, 10).map((listing) => ({
                    slug: listing.slug,
                    name: listing.name,
                    website: listing.website,
                    inferredCountry: inferCountry(listing),
                    inferredService: inferService(listing),
                })),
            },
            null,
            2,
        ),
    );

    if (!createMode) {
        await mongoose.disconnect();
        console.log('Audit complete. Use --create to insert missing providers.');
        return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const listing of targets) {
        const payload = {
            name: listing.name,
            slug: listing.slug,
            country: inferCountry(listing),
            service: inferService(listing),
            isActive: true,
            details: {
                source: 'purple-listing-backfill',
                purpleListingId: listing._id,
                purpleListingSlug: listing.slug,
                website: listing.website,
            },
        };

        if (dryRun) {
            console.log(`[DRY-RUN] Would create provider for ${listing.name} (${listing.slug})`);
            createdCount += 1;
            continue;
        }

        const existing = await Provider.findOne({
            $or: [{ slug: listing.slug }, { name: listing.name }],
        }).lean();

        if (existing) {
            console.log(`[SKIP] Provider already exists for ${listing.name} (${listing.slug})`);
            skippedCount += 1;
            continue;
        }

        await Provider.create(payload);
        console.log(`[CREATE] ${listing.name} (${listing.slug})`);
        createdCount += 1;
    }

    await mongoose.disconnect();
    console.log(
        JSON.stringify(
            {
                processed: targets.length,
                createdCount,
                skippedCount,
                nextStep: 'Run backfillProviderIntentScores or allow the refresh cron to score newly created providers.',
            },
            null,
            2,
        ),
    );
}

main().catch(async (error) => {
    console.error('Fatal:', error);
    try {
        await mongoose.disconnect();
    } catch { }
    process.exit(1);
});
