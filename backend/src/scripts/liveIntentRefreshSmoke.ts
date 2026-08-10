import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Provider from '../models/Provider.ts';
import providerService from '../services/providerService.ts';

dotenv.config();

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        throw new Error('MONGODB_URI not set');
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set');
    }

    const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1];
    const limit = Number(limitArg ?? 3);

    await mongoose.connect(uri);
    console.log(`Connected to MongoDB. Running live Gemini smoke test for up to ${limit} provider(s).`);

    const providers = await Provider.find({ isActive: true })
        .sort({ 'sentimentAnalysis.lastUpdated': 1, updatedAt: 1, name: 1 })
        .limit(limit);

    if (providers.length === 0) {
        console.log('No providers found.');
        await mongoose.disconnect();
        return;
    }

    for (const provider of providers) {
        console.log(`Testing ${provider.name} (${provider.slug})...`);
        const result = await providerService.refreshCompanyAnalysis(provider.id, 0);
        console.log(
            JSON.stringify(
                {
                    providerId: result.providerId,
                    providerName: result.providerName,
                    status: result.status,
                    message: result.message,
                    intentScore: result.intentScore,
                    previousLastUpdated: result.previousLastUpdated,
                    newLastUpdated: result.newLastUpdated,
                    retryAfterMs: result.retryAfterMs,
                },
                null,
                2,
            ),
        );

        if (result.status === 'quota_exceeded') {
            break;
        }
    }

    const totalProviders = await Provider.countDocuments({ isActive: true });
    const withIntent = await Provider.countDocuments({
        isActive: true,
        intentScore: { $exists: true },
        scoringFactors: { $exists: true },
        sentimentAnalysis: { $exists: true },
    });

    console.log(
        JSON.stringify(
            {
                totalProviders,
                withIntent,
                missingIntent: totalProviders - withIntent,
            },
            null,
            2,
        ),
    );

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
}

main().catch(async (error) => {
    console.error('Fatal:', error);
    try {
        await mongoose.disconnect();
    } catch { }
    process.exit(1);
});
