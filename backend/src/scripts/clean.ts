import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
// IMPORTANT: Path must be relative to where this script is run from (project root via ts-node usually)
// or absolute. Since we are in backend/src/scripts, we go up to find the data.
const PROCESSED_DIR = path.join(process.cwd(), 'backend/data/seed/countries/processed');

// --- CONSTANTS: Canonical Services ---
import { TOP_13_SERVICES, VALID_SECTION_TYPES } from '../constants/canonicalServices.ts';

// --- MIGRATION & CLEANING LOGIC ---

function migrateAndValidateSection(section: any): { isValid: boolean, migratedSection?: any, reason?: string } {
    if (!section.type) return { isValid: false, reason: "Missing 'type'" };
    if (!VALID_SECTION_TYPES.includes(section.type)) return { isValid: false, reason: `Invalid type '${section.type}'` };

    const content = section.content || {};
    const items = section.items || content.items || []; // Legacy items location

    // Prepare migrated structure
    const migratedContent: any = { ...content };
    delete migratedContent.items; // Clean up legacy items from content if we use specific fields

    switch (section.type) {
        case 'cost_breakdown':
            if (content.table) {
                // Already in new format
                return { isValid: true, migratedSection: section };
            } else if (items.length > 0) {
                // Migrate items -> table
                migratedContent.table = {
                    headers: ['Item', 'Cost', 'Description'],
                    rows: items.map((item: any) => ({
                        label: item.label || item.title || 'Item',
                        values: [item.value || 'Varies', item.description || item.text || ''],
                        highlight: !!item.highlight
                    }))
                };
                section.content = migratedContent;
                return { isValid: true, migratedSection: section };
            }
            return { isValid: false, reason: "cost_breakdown requires table or items" };

        case 'key_steps':
            if (content.steps) {
                return { isValid: true, migratedSection: section };
            } else if (items.length > 0) {
                migratedContent.steps = items.map((item: any, idx: number) => ({
                    stepNumber: item.step || item.stepNumber || idx + 1,
                    title: item.title || item.label || 'Step',
                    description: item.description || item.text || ''
                }));
                section.content = migratedContent;
                return { isValid: true, migratedSection: section };
            }
            return { isValid: false, reason: "key_steps requires steps or items" };

        case 'insights':
        case 'good_to_know':
        case 'essentials':
            if (items.length > 0) {
                migratedContent.items = items.map((item: any) => ({
                    type: item.type || (section.type === 'good_to_know' ? 'tip' : 'info'),
                    title: item.title || item.label || '',
                    text: item.text || item.description || item.value || ''
                }));
                section.content = migratedContent;
                return { isValid: true, migratedSection: section };
            }
            return { isValid: false, reason: `${section.type} requires items` };

        case 'table':
            if (content.table) {
                return { isValid: true, migratedSection: section };
            }
            return { isValid: false, reason: "table requires content.table" };

        case 'faq':
            if (content.faqs) {
                return { isValid: true, migratedSection: section };
            } else if (items.length > 0) {
                migratedContent.faqs = items.map((item: any) => ({
                    question: item.question || item.title || '',
                    answer: item.answer || item.description || item.text || ''
                }));
                section.content = migratedContent;
                return { isValid: true, migratedSection: section };
            }
            return { isValid: false, reason: "faq requires faqs or items" };

        case 'custom':
            if (content.html || content.markdown) return { isValid: true, migratedSection: section };
            return { isValid: false, reason: "custom requires html or markdown" };
    }

    return { isValid: true, migratedSection: section };
}

function processCountryFile(filePath: string) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);

        if (!data.services || !Array.isArray(data.services)) return;

        let modified = false;

        // 1. Remove Unnecessary Root Keys (Keep only what models expect)
        const ALLOWED_ROOT_KEYS = ['name', 'code', 'slug', 'region', 'flag', 'languages', 'currencies', 'services', 'isActive'];
        Object.keys(data).forEach(key => {
            if (!ALLOWED_ROOT_KEYS.includes(key)) {
                delete data[key];
                modified = true;
            }
        });

        // 2. Process Services (Filter Canonical)
        const originalServiceCount = data.services.length;
        data.services = data.services.filter((s: any) => TOP_13_SERVICES.includes(s.serviceSlug));
        if (data.services.length !== originalServiceCount) {
            console.log(`   [REMOVED] ${originalServiceCount - data.services.length} non-canonical services from ${data.name}`);
            modified = true;
        }

        data.services.forEach((service: any) => {
            if (!service.sections) service.sections = [];

            const validSections: any[] = [];
            service.sections.forEach((section: any) => {
                const result = migrateAndValidateSection(section);
                if (result.isValid) {
                    validSections.push(result.migratedSection);
                } else {
                    console.log(`   [REMOVED] ${data.name} -> ${service.serviceSlug} -> ${section.type || 'unknown'}: ${result.reason}`);
                }
            });

            if (validSections.length !== service.sections.length) modified = true;

            // Final Section Cleanup: Remove legacy fields outside of 'content'
            service.sections = validSections.map((s: any) => {
                if (!s.id) modified = true;
                const cleanSection = {
                    id: s.id || `section-${Math.random().toString(36).substr(2, 9)}`,
                    type: s.type,
                    title: s.title || 'Information',
                    subtitle: s.subtitle || '',
                    description: s.description || '',
                    order: s.order || 1,
                    content: s.content,
                    styling: s.styling
                };
                return cleanSection;
            });
        });

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`[PROCESSED] ${data.name}`);
        } else {
            console.log(`[NO CHANGE] ${data.name}`);
        }

    } catch (e) {
        console.error(`Error in ${filePath}:`, e);
    }
}

function run() {
    console.log("Starting Deep Migration & Cleanup...");
    const getAllFiles = (dir: string): string[] => {
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
            console.error(`Error reading directory ${dir}:`, e);
        }
        return results;
    };

    if (!fs.existsSync(PROCESSED_DIR)) {
        console.error(`ERROR: Directory not found: ${PROCESSED_DIR}`);
        process.exit(1);
    }

    const files = getAllFiles(PROCESSED_DIR);
    files.forEach(f => processCountryFile(f));
    console.log("Done.");
}

run();
