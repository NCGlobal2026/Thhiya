import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Provider from '../models/Provider.ts';
import providerService from '../services/providerService.ts';

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ProviderTarget = {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug?: string;
    country?: string;
    service?: string;
    details?: {
        website?: string;
        source?: string;
    };
    intentScore?: number;
    scoringFactors?: Partial<Record<'marketMomentum' | 'userSentiment' | 'featureInnovation' | 'transparency', number>>;
    sentimentAnalysis?: {
        positiveReviews?: string[];
        negativeReviews?: string[];
        lastUpdated?: Date;
    };
    intentAnalysisStatus?: string;
    intentAnalysisMeta?: {
        nextRetryAt?: Date;
        lastAttemptedAt?: Date;
        failureCount?: number;
    };
};

function hasCoreIntentFields(provider: ProviderTarget) {
    return (
        typeof provider.intentScore === 'number' &&
        typeof provider.scoringFactors?.marketMomentum === 'number' &&
        typeof provider.scoringFactors?.userSentiment === 'number' &&
        typeof provider.scoringFactors?.featureInnovation === 'number' &&
        typeof provider.scoringFactors?.transparency === 'number' &&
        !!provider.sentimentAnalysis?.lastUpdated
    );
}

function hasCompleteSentimentLists(provider: ProviderTarget) {
    const positiveCount = provider.sentimentAnalysis?.positiveReviews?.filter(Boolean).length ?? 0;
    const negativeCount = provider.sentimentAnalysis?.negativeReviews?.filter(Boolean).length ?? 0;
    return positiveCount >= 5 && negativeCount >= 5;
}

function classifyTarget(provider: ProviderTarget) {
    if (!hasCoreIntentFields(provider)) {
        return 'core_missing';
    }

    if (!hasCompleteSentimentLists(provider)) {
        return 'enrichment_needed';
    }

    return 'complete';
}

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set');
        process.exit(1);
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not set');
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const onlyBackfilled = args.includes('--only-backfilled');
    const coreOnly = args.includes('--core-only');
    const enrichmentOnly = args.includes('--enrichment-only');
    const limitArg = args.find((arg) => arg.startsWith('--limit='));
    const startArg = args.find((arg) => arg.startsWith('--start='));
    const delayArg = args.find((arg) => arg.startsWith('--delay-ms='));
    const freshnessArg = args.find((arg) => arg.startsWith('--freshness-hours='));
    const limit = limitArg ? Math.max(Number(limitArg.split('=')[1]) || 0, 0) : 2;
    const start = startArg ? Math.max(Number(startArg.split('=')[1]) || 0, 0) : 0;
    const delayMs = delayArg ? Math.max(Number(delayArg.split('=')[1]) || 0, 0) : 15000;
    const freshnessHours = freshnessArg ? Math.max(Number(freshnessArg.split('=')[1]) || 0, 0) : 24;

    if (coreOnly && enrichmentOnly) {
        console.error('Use either --core-only or --enrichment-only, not both.');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const candidateQuery: Record<string, unknown> = {
        $or: [
            { intentScore: { $exists: false } },
            { scoringFactors: { $exists: false } },
            { sentimentAnalysis: { $exists: false } },
            { 'sentimentAnalysis.lastUpdated': { $exists: false } },
            { 'sentimentAnalysis.positiveReviews.4': { $exists: false } },
            { 'sentimentAnalysis.negativeReviews.4': { $exists: false } },
            { intentAnalysisStatus: { $in: ['pending', 'core_complete', 'failed', 'quota_limited'] } },
        ],
    };

    if (onlyBackfilled) {
        candidateQuery['details.source'] = 'purple-listing-backfill';
    }

    const allTargets = await Provider.find(
        candidateQuery,
        {
            name: 1,
            slug: 1,
            country: 1,
            service: 1,
            details: 1,
            intentScore: 1,
            scoringFactors: 1,
            sentimentAnalysis: 1,
            intentAnalysisStatus: 1,
            intentAnalysisMeta: 1,
        },
    )
        .sort({
            intentScore: 1,
            'sentimentAnalysis.lastUpdated': 1,
            'intentAnalysisMeta.nextRetryAt': 1,
            createdAt: 1,
            name: 1,
        })
        .lean<ProviderTarget[]>();

    const now = new Date();
    const eligibleTargets = allTargets
        .filter((provider) => {
            const nextRetryAt = provider.intentAnalysisMeta?.nextRetryAt
                ? new Date(provider.intentAnalysisMeta.nextRetryAt)
                : null;

            if (nextRetryAt && nextRetryAt > now) {
                return false;
            }

            const targetType = classifyTarget(provider);

            if (coreOnly) {
                return targetType === 'core_missing';
            }

            if (enrichmentOnly) {
                return targetType === 'enrichment_needed';
            }

            return targetType !== 'complete';
        })
        .sort((left, right) => {
            const leftType = classifyTarget(left);
            const rightType = classifyTarget(right);

            if (leftType !== rightType) {
                return leftType === 'core_missing' ? -1 : 1;
            }

            const leftRetry = left.intentAnalysisMeta?.nextRetryAt
                ? new Date(left.intentAnalysisMeta.nextRetryAt).getTime()
                : 0;
            const rightRetry = right.intentAnalysisMeta?.nextRetryAt
                ? new Date(right.intentAnalysisMeta.nextRetryAt).getTime()
                : 0;

            return leftRetry - rightRetry;
        });

    const slicedTargets = eligibleTargets.slice(start, start + Math.max(limit, 0));

    console.log(
        JSON.stringify(
            {
                totalEligibleProviders: eligibleTargets.length,
                selectedTargets: slicedTargets.length,
                start,
                limit,
                delayMs,
                freshnessHours,
                mode: dryRun ? 'dry-run' : 'write',
                onlyBackfilled,
                coreOnly,
                enrichmentOnly,
                sampleTargets: slicedTargets.slice(0, 10).map((provider) => ({
                    name: provider.name,
                    slug: provider.slug,
                    country: provider.country,
                    service: provider.service,
                    website: provider.details?.website || null,
                    source: provider.details?.source || null,
                    targetType: classifyTarget(provider),
                    intentAnalysisStatus: provider.intentAnalysisStatus || null,
                })),
            },
            null,
            2,
        ),
    );

    if (dryRun) {
        await mongoose.disconnect();
        console.log('Dry run complete.');
        return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let quotaLimitedCount = 0;

    for (let index = 0; index < slicedTargets.length; index += 1) {
        const provider = slicedTargets[index];
        const targetType = classifyTarget(provider);

        console.log(`[${index + 1}/${slicedTargets.length}] Refreshing ${provider.name} (${targetType})`);

        const result = await providerService.refreshCompanyAnalysis(provider._id.toString(), freshnessHours);

        if (result.status === 'updated') {
            console.log(`[OK] ${provider.name} → ${result.intentScore ?? 'n/a'}/10`);
            updatedCount += 1;
        } else if (result.status === 'skipped') {
            console.log(`[SKIP] ${result.message}`);
            skippedCount += 1;
        } else if (result.status === 'quota_exceeded') {
            console.warn(`[QUOTA] ${provider.name}: ${result.message}`);
            quotaLimitedCount += 1;
            continue;
        } else {
            console.error(`[FAIL] ${provider.name}: ${result.message}`);
            failedCount += 1;
        }

        if (index < slicedTargets.length - 1 && delayMs > 0) {
            console.log(`Waiting ${delayMs}ms before next request...`);
            await delay(delayMs);
        }
    }

    await mongoose.disconnect();
    console.log(
        JSON.stringify(
            {
                updatedCount,
                skippedCount,
                failedCount,
                quotaLimitedCount,
                remainingAfterRun: Math.max(eligibleTargets.length - start - slicedTargets.length, 0),
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
