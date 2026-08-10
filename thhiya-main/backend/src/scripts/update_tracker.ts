import fs from 'fs';
import path from 'path';

const TRACKER_PATH = path.join(__dirname, '../../data/seed/countries/COUNTRY_BATCH_TRACKER.md');
const PROCESSED_DIR = path.join(__dirname, '../../data/seed/countries/processed');

function main() {
    if (!fs.existsSync(TRACKER_PATH)) {
        console.error('Tracker file not found');
        process.exit(1);
    }

    let content = fs.readFileSync(TRACKER_PATH, 'utf8');
    const existingFiles = fs.readdirSync(PROCESSED_DIR).filter(f => f.endsWith('.json'));

    // meaningful map of Country Name -> File Name (slug)
    // Actually, generating the slug from the name in the tracker is safer?
    // Or reading the name from the JSON files?

    // Let's create a map of Name -> exists
    const existingNames = new Set<string>();

    for (const file of existingFiles) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(PROCESSED_DIR, file), 'utf8'));
            if (data.name) {
                existingNames.add(data.name.trim());
            }
        } catch (e) { }
    }

    // Now process the tracker line by line
    const lines = content.split('\n');
    let updatedLines: string[] = [];
    let updatedCount = 0;

    for (let line of lines) {
        // Match table row: | Name | Tier | Status | ...
        const match = line.match(/^\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*([A-Z_]+)\s*\|(.*)$/);

        if (match) {
            const countryName = match[1].trim();
            const currentStatus = match[3].trim();

            if (currentStatus === 'NOT_STARTED' && existingNames.has(countryName)) {
                // Update to NEEDS_MORE
                line = line.replace('NOT_STARTED', 'NEEDS_MORE '); // Add space to maintain padding roughly
                updatedCount++;
            }
        }
        updatedLines.push(line);
    }

    if (updatedCount > 0) {
        const newContent = updatedLines.join('\n');
        fs.writeFileSync(TRACKER_PATH, newContent);
        console.log(`Updated ${updatedCount} entries in tracker to NEEDS_MORE.`);
    } else {
        console.log('No tracker updates needed.');
    }
}

main();
