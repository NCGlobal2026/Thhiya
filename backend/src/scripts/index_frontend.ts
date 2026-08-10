
import fs from 'fs';
import path from 'path';

const PROCESSED_DIR = path.join(process.cwd(), 'backend/data/seed/countries/processed');
const OUTPUT_FILE = path.join(process.cwd(), 'frontend/public/data/country-index.json');
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

// Output file path
// const OUTPUT_FILE = path.join(process.cwd(), 'frontend/public/data/country-index.json');

// Recursive file finding
function getAllFiles(dir: string): string[] {
    let results: string[] = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach((file: string) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(getAllFiles(filePath));
            } else if (file.endsWith('.json')) {
                results.push(filePath);
            }
        });
    } catch (e) {
        console.error(`Error reading ${dir}:`, e);
    }
    return results;
}

interface CountryIndexItem {
    id: string; // slug
    name: string;
    code: string;
    flag: string;
    region: string;
    languages: string[];
    services: string[]; // List of service slugs
    currency: string;
    count: number; // Insight count (number of sections + services)
}

function generateIndex() {
    console.log(`Scanning ${PROCESSED_DIR}...`);
    const files = getAllFiles(PROCESSED_DIR);
    console.log(`Found ${files.length} files.`);

    const indexData: CountryIndexItem[] = [];

    for (const file of files) {
        try {
            const raw = fs.readFileSync(file, 'utf8');
            const data = JSON.parse(raw);

            // Calculate Insight Count (proxy)
            // Ideally: number of services + number of sections across all services
            let insightCount = 0;
            if (data.services && Array.isArray(data.services)) {
                insightCount += data.services.length;
                data.services.forEach((s: any) => {
                    if (s.sections) insightCount += s.sections.length;
                });
            }

            const item: CountryIndexItem = {
                id: data.slug,
                name: data.name,
                code: data.code,
                flag: data.flag,
                region: data.region || 'Global',
                languages: data.languages || ['English'],
                services: data.services ? data.services.map((s: any) => s.serviceSlug) : [],
                currency: data.currencies?.[0] || 'Local Currency',
                count: insightCount > 0 ? insightCount : 12 // Fallback
            };

            indexData.push(item);
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }

    // Sort by name
    indexData.sort((a, b) => a.name.localeCompare(b.name));

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(indexData, null, 2));
    console.log(`Generated index with ${indexData.length} countries at: ${OUTPUT_FILE}`);
}

generateIndex();
