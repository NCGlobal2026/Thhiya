import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Service from '../models/Service.ts';

dotenv.config();

const BASE_SERVICES_PATH = path.join(process.cwd(), process.cwd().endsWith('backend') ? 'data/seed/base_services.json' : 'backend/data/seed/base_services.json');

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set in environment');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const content = fs.readFileSync(BASE_SERVICES_PATH, 'utf-8');
    const services = JSON.parse(content);

    console.log(`Found ${services.length} services to seed.`);

    for (const s of services) {
        const serviceDoc = {
            name: s.name,
            slug: s.slug || s.serviceSlug,
            description: s.description || `Information about ${s.name}`,
            category: s.category || 'General',
            isActive: true
        };

        try {
            await Service.findOneAndUpdate(
                { slug: serviceDoc.slug },
                { $set: serviceDoc },
                { upsert: true, new: true }
            );
            console.log(`  [OK] Upserted Service: ${serviceDoc.name}`);
        } catch (err: any) {
            console.error(`  [ERR] Failed to upsert Service ${serviceDoc.name}:`, err.message);
        }
    }

    await mongoose.disconnect();
    console.log('Done!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
