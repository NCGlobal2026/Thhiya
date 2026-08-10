import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Provider from '../models/Provider.ts';
import { PROVIDER_CATALOG } from '../constants/providerCatalog.ts';

dotenv.config();

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log(`Connected to MongoDB`);
    console.log(`Syncing ${PROVIDER_CATALOG.length} catalog provider(s)...`);

    const ops = PROVIDER_CATALOG.map((provider) => ({
        updateOne: {
            filter: { slug: provider.slug },
            update: {
                $set: {
                    name: provider.name,
                    slug: provider.slug,
                    country: provider.country,
                    service: provider.service,
                    isActive: true,
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            upsert: true,
        },
    }));

    const result = await Provider.bulkWrite(ops, { ordered: false });

    console.log('Catalog sync complete.');
    console.log(`  matched: ${result.matchedCount}`);
    console.log(`  modified: ${result.modifiedCount}`);
    console.log(`  upserted: ${result.upsertedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

main().catch((error) => {
    console.error('Fatal:', error);
    process.exit(1);
});
