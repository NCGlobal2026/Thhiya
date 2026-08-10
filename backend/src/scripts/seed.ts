import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Country from '../models/Country.ts';
import CountryService from '../models/CountryService.ts';

dotenv.config();

const PROCESSED_DIR = path.join(process.cwd(), process.cwd().endsWith('backend') ? 'data/seed/countries/processed' : 'backend/data/seed/countries/processed');

function normalizeCurrency(currencies: any[]): string {
    if (!Array.isArray(currencies) || currencies.length === 0) {
        return 'Local Currency';
    }

    const first = currencies[0];
    if (typeof first === 'string' && first.trim()) {
        return first.trim();
    }

    if (first && typeof first === 'object') {
        const code = typeof first.code === 'string' ? first.code.trim() : '';
        const name = typeof first.name === 'string' ? first.name.trim() : '';
        const symbol = typeof first.symbol === 'string' ? first.symbol.trim() : '';

        if (code && name) return `${code} (${name})`;
        if (code) return code;
        if (name) return name;
        if (symbol) return symbol;
    }

    return 'Local Currency';
}

function transformSections(sections: any[]): any[] {
    return sections.map((section, index) => ({
        id: section.id || `section-${index + 1}`,
        type: section.type,
        title: section.title || 'Information',
        subtitle: section.subtitle || '',
        description: section.description || '',
        order: section.order || index + 1,
        content: section.content || {},
        styling: section.styling || {}
    }));
}

async function seedCountry(file: string) {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const {
        name,
        code,
        slug,
        region,
        flag,
        languages = [],
        currencies = [],
        services = []
    } = content;

    console.log(`\nProcessing: ${name}`);

    // Upsert Country
    const countryDoc = {
        name,
        code,
        slug,
        flag,
        region,
        languages,
        currency: normalizeCurrency(currencies),
        isActive: true,
        servicesOffered: services.map((s: any) => s.name)
    };

    await Country.findOneAndUpdate({ code }, countryDoc, { upsert: true, new: true });
    console.log(`  [OK] Country: ${name}`);

    // Process Services
    let successCount = 0;
    let errorCount = 0;

    for (const s of services) {
        const targetSlug = s.serviceSlug || s.slug;
        try {
            const transformedSections = transformSections(s.sections || []);

            const serviceDoc = {
                country: name,
                countryCode: code,
                countrySlug: slug,
                region: region || 'Global',
                service: s.name,
                serviceSlug: targetSlug,
                heroData: s.heroData || {
                    title: s.name,
                    subtitle: '',
                    description: s.description || '',
                    bestFor: '',
                    icon: targetSlug
                },
                sections: transformedSections,
                ctaText: s.ctaText || `Get Started with ${s.name}`,
                isActive: true,
                metadata: {
                    lastUpdated: new Date(),
                    version: '1.0'
                }
            };

            await CountryService.findOneAndUpdate(
                { countrySlug: slug, serviceSlug: targetSlug },
                { $set: serviceDoc },
                { upsert: true, new: true, runValidators: false }
            );
            console.log(`  [OK] Service: ${s.name} (${targetSlug})`);
            successCount++;
        } catch (err: any) {
            console.error(`  [ERR] Service: ${s.name} - ${err.message}`);
            errorCount++;
        }
    }

    return { name, successCount, errorCount };
}

async function main() {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
        console.error('MONGODB_URI not set in environment');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get all JSON files in processed directory
    // Recursive file finding
    const getAllFiles = (dir: string): string[] => {
        let results: string[] = [];
        try {
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(getAllFiles(filePath));
                } else if (file.endsWith('.json')) {
                    results.push(filePath);
                }
            });
        } catch (e) {
            console.error(`Error reading directory ${dir}:`, e);
        }
        return results;
    };

    const args = process.argv.slice(2);
    let targetCountry = '';

    // Simple argument parsing
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--country' || args[i] === '-c') {
            targetCountry = args[i + 1]?.toLowerCase();
        }
    }

    let files = getAllFiles(PROCESSED_DIR);

    if (targetCountry) {
        console.log(`\nFiltering for country containing: "${targetCountry}"`);
        files = files.filter(file => {
            const baseName = path.basename(file).toLowerCase();
            return baseName.includes(targetCountry);
        });
    }

    if (files.length === 0) {
        console.log('No JSON files found (check directory or filter)');
        process.exit(0);
    }

    console.log(`Found ${files.length} country file(s) to seed`);
    console.log('='.repeat(50));

    const results: { name: string; successCount: number; errorCount: number }[] = [];

    for (const file of files) {
        try {
            const result = await seedCountry(file);
            results.push(result);
        } catch (err: any) {
            console.error(`Failed to seed ${path.basename(file)}: ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('SEEDING SUMMARY');
    console.log('='.repeat(50));

    let totalServices = 0;
    let totalErrors = 0;

    for (const r of results) {
        console.log(`${r.name}: ${r.successCount} services, ${r.errorCount} errors`);
        totalServices += r.successCount;
        totalErrors += r.errorCount;
    }

    console.log('-'.repeat(50));
    console.log(`TOTAL: ${results.length} countries, ${totalServices} services, ${totalErrors} errors`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
