import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Provider from '../models/Provider.ts';
import { analyzeCompany, GeminiQuotaExceededError } from '../services/geminiService.ts';
import { PROVIDER_CATALOG } from '../constants/providerCatalog.ts';

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function hasIntentFields(provider: {
    intentScore?: number;
    scoringFactors?: unknown;
    sentimentAnalysis?: unknown;
}) {
    return (
        typeof provider.intentScore === 'number' &&
        !!provider.scoringFactors &&
        !!provider.sentimentAnalysis
    );
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

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const args = process.argv.slice(2);
    const allMode = args.includes('--all');
    const slugFilter = args.find((arg) => !arg.startsWith('--'))?.toLowerCase();
    const dryRun = args.includes('--dry-run');
    const delayMs = Number(args.find((arg) => arg.startsWith('--delay-ms='))?.split('=')[1] || 8000);

    if (!allMode && !slugFilter) {
        console.error('Provide a slug filter or pass --all to process the entire provider catalog.');
        process.exit(1);
    }

    const catalogTargets = slugFilter
        ? PROVIDER_CATALOG.filter((provider) => provider.slug.includes(slugFilter))
        : PROVIDER_CATALOG;

    const providers = await Provider.find({
        slug: { $in: catalogTargets.map((provider) => provider.slug) },
    }).lean();

    const providerBySlug = new Map(
        providers.map((provider) => [provider.slug?.toLowerCase(), provider]),
    );

    const targets = catalogTargets.filter((provider) => {
        const existing = providerBySlug.get(provider.slug.toLowerCase());
        return !existing || !hasIntentFields(existing);
    });

    console.log(
        `Backfill targets: ${targets.length}/${catalogTargets.length}` +
        `${allMode ? ' [all-mode]' : ''}` +
        `${dryRun ? ' [dry-run]' : ''}`,
    );

    for (let index = 0; index < targets.length; index += 1) {
        const target = targets[index];
        console.log(`[${index + 1}/${targets.length}] Analyzing ${target.name} (${target.slug})...`);

        if (dryRun) {
            continue;
        }

        let analysis;
        try {
            analysis = await analyzeCompany(target.name);
        } catch (error) {
            if (error instanceof GeminiQuotaExceededError) {
                const retryAfter = error.retryAfterMs
                    ? ` Retry after ~${Math.ceil(error.retryAfterMs / 1000)}s.`
                    : '';
                console.error(`  [STOP] ${error.message}.${retryAfter}`);
                break;
            }
            throw error;
        }

        if (!analysis) {
            console.warn(`  [SKIP] Gemini returned null for ${target.name}`);
            continue;
        }

        await Provider.findOneAndUpdate(
            { slug: target.slug },
            {
                $set: {
                    name: target.name,
                    slug: target.slug,
                    country: target.country,
                    service: target.service,
                    isActive: true,
                    intentScore: analysis.intentScore,
                    scoringFactors: analysis.scoringFactors,
                    sentimentAnalysis: analysis.sentimentAnalysis,
                },
            },
            { upsert: true, new: true },
        );

        console.log(`  [OK] ${target.name} → ${analysis.intentScore}/10`);

        if (index < targets.length - 1 && delayMs > 0) {
            console.log(`  Waiting ${delayMs}ms (rate limit)...`);
            await delay(delayMs);
        }
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log(
        'Tip: use --all for the full catalog, --dry-run to preview, and --delay-ms=VALUE to control pacing.',
    );
}

main().catch((error) => {
    console.error('Fatal:', error);
    process.exit(1);
});
