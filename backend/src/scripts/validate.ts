import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const PROCESSED_DIR = path.join(process.cwd(), 'data/seed/countries/processed');

// --- CONSTANTS: Canonical Services ---
import { TOP_13_SERVICES, VALID_SECTION_TYPES } from '../constants/canonicalServices.ts';

// --- MINIMUM DEPTH REQUIREMENTS ---
const MIN_REQUIREMENTS = {
    // Per Service Minimums
    minSectionsPerService: 5,       // Each service must have at least 5 sections
    minItemsPerSection: 3,          // Each section must have at least 3 items/rows/steps

    // Per Country Minimums (Tier-based)
    tier1: {
        minTotalSections: 50,       // 50+ sections total
        minLines: 2000,             // 2000+ lines in JSON
        minTotalItems: 150,         // 150+ total items
        services: 12,               // All 12 services required
        // Required per service: Cost, Legal(essentials), Key Steps, Insights, FAQ
        requiredTypesPerService: ['cost_breakdown', 'key_steps', 'insights', 'faq', 'essentials']
    },
    tier2: {
        minTotalSections: 50,       // 50+ sections total
        minLines: 2000,             // 2000+ lines in JSON
        minTotalItems: 150,         // 150+ total items
        services: 12,               // All 12 services required
        // Required per service: Cost, Key Steps, Compliance(insights)
        requiredTypesPerService: ['cost_breakdown', 'key_steps', 'insights']
    },
    tier3: {
        minTotalSections: 50,       // 50+ sections total
        minLines: 2000,             // 2000+ lines in JSON
        minTotalItems: 150,         // 150+ total items
        services: 12,               // All 12 services required
        // Required per service: just basic depth
        requiredTypesPerService: ['key_steps', 'insights']
    },

    // Section Type Mix Requirements (Global minimums)
    requiredSectionTypes: ['key_steps', 'insights']
};

// Tier 1 countries (require highest depth)
const TIER_1_COUNTRIES = [
    'united-states', 'united-kingdom', 'germany', 'brazil', 'india',
    'china', 'japan', 'france', 'canada', 'australia'
];

// Tier 2 countries
const TIER_2_COUNTRIES = [
    'singapore', 'netherlands', 'switzerland', 'ireland', 'spain',
    'italy', 'south-korea', 'mexico', 'poland', 'united-arab-emirates'
];

// --- TYPES ---
interface ValidationError {
    file: string;
    path: string;
    message: string;
    severity: 'error' | 'warning';
}

interface DepthStats {
    totalSections: number;
    totalItems: number;
    servicesWithSections: number;
    servicesWithoutSections: string[];
    sectionTypeCoverage: Record<string, number>;
    avgItemsPerSection: number;
    lineCount: number;
}

interface ValidationResult {
    file: string;
    countryName: string;
    tier: 1 | 2 | 3;
    serviceCount: number;
    sectionCount: number;
    depthStats: DepthStats;
    errors: ValidationError[];
    warnings: ValidationError[];
    isValid: boolean;
    meetsDepthRequirements: boolean;
}

interface SectionContent {
    table?: { rows?: unknown[]; headers?: unknown[] };
    steps?: unknown[];
    items?: unknown[];
    faqs?: unknown[];
    html?: string;
    markdown?: string;
}

interface Section {
    id?: string;
    type: string;
    title?: string;
    content?: SectionContent;
}

interface HeroData {
    title?: string;
    subtitle?: string;
    description?: string;
    bestFor?: string;
    icon?: string;
}

interface Service {
    serviceSlug: string;
    slug?: string; // Frontend filter slug
    service?: string;
    heroData?: HeroData;
    sections?: Section[];
}

interface CountryData {
    name?: string;
    code?: string;
    slug?: string;
    flag?: string;
    region?: string;
    languages?: string[];
    currencies?: string[];
    services?: Service[];
}

// --- HELPER FUNCTIONS ---

function getTier(slug: string): 1 | 2 | 3 {
    if (TIER_1_COUNTRIES.includes(slug)) return 1;
    if (TIER_2_COUNTRIES.includes(slug)) return 2;
    return 3;
}

// function getItemCount(content: SectionContent | undefined): number {
//     if (!content) return 0;
//     if (content.items && Array.isArray(content.items)) return content.items.length;
//     if (content.steps && Array.isArray(content.steps)) return content.steps.length;
//     if (content.faqs && Array.isArray(content.faqs)) return content.faqs.length;
//     if (content.table?.rows && Array.isArray(content.table.rows)) return content.table.rows.length;
//     return 0;
// }

// --- VALIDATION FUNCTIONS ---

function validateHeroData(
    heroData: HeroData | undefined,
    servicePath: string,
    serviceSlug: string,
    errors: ValidationError[],
    file: string
): void {
    if (!heroData) {
        errors.push({
            file,
            path: `${servicePath}.heroData`,
            message: 'Missing required heroData object',
            severity: 'error'
        });
        return;
    }

    const requiredFields = ['title', 'description', 'icon'];
    for (const field of requiredFields) {
        if (!heroData[field as keyof HeroData]) {
            errors.push({
                file,
                path: `${servicePath}.heroData.${field}`,
                message: `Missing required field: ${field}`,
                severity: 'error'
            });
        }
    }

    // Icon alignment check
    if (heroData.icon && heroData.icon !== serviceSlug) {
        errors.push({
            file,
            path: `${servicePath}.heroData.icon`,
            message: `Icon mismatch: "${heroData.icon}" does not match serviceSlug "${serviceSlug}"`,
            severity: 'error'
        });
    }
}

function validateSectionContent(
    section: Section,
    sectionPath: string,
    errors: ValidationError[],
    file: string
): number {
    const { type, content } = section;
    let itemCount = 0;

    if (!content) {
        errors.push({
            file,
            path: `${sectionPath}.content`,
            message: `Section type "${type}" is missing content object`,
            severity: 'error'
        });
        return 0;
    }

    // Placeholder check
    const contentStr = JSON.stringify(content).toLowerCase();
    const placeholders = ['tbd', 'coming soon', 'lorem ipsum', '[insert', 'todo'];
    for (const p of placeholders) {
        if (contentStr.includes(p)) {
            errors.push({
                file,
                path: `${sectionPath}.content`,
                message: `Placeholder text "${p}" detected in section content`,
                severity: 'error'
            });
        }
    }

    switch (type) {
        case 'cost_breakdown':
            if (!content.table) {
                errors.push({
                    file,
                    path: `${sectionPath}.content.table`,
                    message: 'cost_breakdown section requires content.table object',
                    severity: 'error'
                });
            } else if (!content.table.rows || !Array.isArray(content.table.rows)) {
                errors.push({
                    file,
                    path: `${sectionPath}.content.table.rows`,
                    message: 'cost_breakdown table requires rows array',
                    severity: 'error'
                });
            } else {
                itemCount = content.table.rows.length;
                if (itemCount < MIN_REQUIREMENTS.minItemsPerSection) {
                    errors.push({
                        file,
                        path: `${sectionPath}.content.table.rows`,
                        message: `cost_breakdown needs at least ${MIN_REQUIREMENTS.minItemsPerSection} rows, found ${itemCount}`,
                        severity: 'warning'
                    });
                }
            }
            break;

        case 'key_steps':
            if (!content.steps || !Array.isArray(content.steps)) {
                errors.push({
                    file,
                    path: `${sectionPath}.content.steps`,
                    message: 'key_steps section requires content.steps array',
                    severity: 'error'
                });
            } else {
                itemCount = content.steps.length;
                if (itemCount < MIN_REQUIREMENTS.minItemsPerSection) {
                    errors.push({
                        file,
                        path: `${sectionPath}.content.steps`,
                        message: `key_steps needs at least ${MIN_REQUIREMENTS.minItemsPerSection} steps, found ${itemCount}`,
                        severity: 'warning'
                    });
                }
            }
            break;

        case 'insights':
        case 'good_to_know':
        case 'essentials':
            if (!content.items || !Array.isArray(content.items)) {
                errors.push({
                    file,
                    path: `${sectionPath}.content.items`,
                    message: `${type} section requires content.items array`,
                    severity: 'error'
                });
            } else {
                itemCount = content.items.length;
                if (itemCount < MIN_REQUIREMENTS.minItemsPerSection) {
                    errors.push({
                        file,
                        path: `${sectionPath}.content.items`,
                        message: `${type} needs at least ${MIN_REQUIREMENTS.minItemsPerSection} items, found ${itemCount}`,
                        severity: 'warning'
                    });
                }
            }
            break;

        case 'table':
            if (!content.table) {
                errors.push({
                    file,
                    path: `${sectionPath}.content.table`,
                    message: 'table section requires content.table object',
                    severity: 'error'
                });
            } else if (!content.table.rows || !Array.isArray(content.table.rows)) {
                errors.push({
                    file,
                    path: `${sectionPath}.content.table.rows`,
                    message: 'table requires rows array',
                    severity: 'error'
                });
            } else {
                itemCount = content.table.rows.length;
                if (itemCount < MIN_REQUIREMENTS.minItemsPerSection) {
                    errors.push({
                        file,
                        path: `${sectionPath}.content.table.rows`,
                        message: `table needs at least ${MIN_REQUIREMENTS.minItemsPerSection} rows, found ${itemCount}`,
                        severity: 'warning'
                    });
                }
            }
            break;

        case 'faq':
            if (!content.faqs && !content.items) {
                errors.push({
                    file,
                    path: `${sectionPath}.content`,
                    message: 'faq section requires content.faqs or content.items array',
                    severity: 'error'
                });
            } else {
                itemCount = (content.faqs?.length || 0) + (content.items?.length || 0);
                if (itemCount < MIN_REQUIREMENTS.minItemsPerSection) {
                    errors.push({
                        file,
                        path: `${sectionPath}.content`,
                        message: `faq needs at least ${MIN_REQUIREMENTS.minItemsPerSection} questions, found ${itemCount}`,
                        severity: 'warning'
                    });
                }
            }
            break;

        case 'custom':
            if (!content.html && !content.markdown) {
                errors.push({
                    file,
                    path: `${sectionPath}.content`,
                    message: 'custom section requires content.html or content.markdown',
                    severity: 'warning'
                });
            }
            itemCount = 1; // Custom sections count as 1 item
            break;
    }

    return itemCount;
}

function validateDepthRequirements(
    result: ValidationResult,
    tier: 1 | 2 | 3,
    errors: ValidationError[],
    warnings: ValidationError[],
    file: string
): boolean {
    const requirements = tier === 1 ? MIN_REQUIREMENTS.tier1 :
        tier === 2 ? MIN_REQUIREMENTS.tier2 :
            MIN_REQUIREMENTS.tier3;

    let meetsRequirements = true;

    // Check total sections
    if (result.depthStats.totalSections < requirements.minTotalSections) {
        errors.push({
            file,
            path: 'services',
            message: `Tier ${tier} requires at least ${requirements.minTotalSections} total sections, found ${result.depthStats.totalSections}`,
            severity: 'error'
        });
        meetsRequirements = false;
    }



    // Check line count
    if (result.depthStats.lineCount < requirements.minLines) {
        errors.push({
            file,
            path: '',
            message: `Tier ${tier} requires at least ${requirements.minLines} lines, found ${result.depthStats.lineCount}`,
            severity: 'error'
        });
        meetsRequirements = false;
    }

    // Check total items
    if (result.depthStats.totalItems < requirements.minTotalItems) {
        errors.push({
            file,
            path: '',
            message: `Tier ${tier} requires at least ${requirements.minTotalItems} total items, found ${result.depthStats.totalItems}`,
            severity: 'error'
        });
        meetsRequirements = false;
    }

    // Check service count
    if (result.serviceCount < requirements.services) {
        errors.push({
            file,
            path: 'services',
            message: `Tier ${tier} requires all ${requirements.services} services, found ${result.serviceCount}`,
            severity: 'error'
        });
        meetsRequirements = false;
    }

    // Check for services without sections
    if (result.depthStats.servicesWithoutSections.length > 0) {
        errors.push({
            file,
            path: 'services',
            message: `${result.depthStats.servicesWithoutSections.length} services have no sections: ${result.depthStats.servicesWithoutSections.join(', ')}`,
            severity: 'error'
        });
        meetsRequirements = false;
    }

    // Check section type coverage
    const requiredTypes = MIN_REQUIREMENTS.requiredSectionTypes;
    for (const reqType of requiredTypes) {
        if ((result.depthStats.sectionTypeCoverage[reqType] || 0) < 6) {
            warnings.push({
                file,
                path: 'services',
                message: `Should have at least 6 ${reqType} sections across services, found ${result.depthStats.sectionTypeCoverage[reqType] || 0}`,
                severity: 'warning'
            });
        }
    }

    return meetsRequirements;
}

function validateCountryFile(filePath: string): ValidationResult {
    const fileName = path.basename(filePath);
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Get line count
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lineCount = fileContent.split('\n').length;

    let data: CountryData;
    try {
        data = JSON.parse(fileContent) as CountryData;
    } catch (e) {
        return {
            file: fileName,
            countryName: 'PARSE_ERROR',
            tier: 3,
            serviceCount: 0,
            sectionCount: 0,
            depthStats: {
                totalSections: 0,
                totalItems: 0,
                servicesWithSections: 0,
                servicesWithoutSections: [],
                sectionTypeCoverage: {},
                avgItemsPerSection: 0,
                lineCount
            },
            errors: [{
                file: fileName,
                path: '',
                message: `Failed to parse JSON: ${e}`,
                severity: 'error'
            }],
            warnings: [],
            isValid: false,
            meetsDepthRequirements: false
        };
    }

    const tier = getTier(data.slug || fileName.replace('.json', ''));

    // Validate global fields (METADATA)
    if (!data.name) {
        errors.push({ file: fileName, path: 'name', message: 'Missing country name', severity: 'error' });
    }
    if (!data.code) {
        errors.push({ file: fileName, path: 'code', message: 'Missing country code', severity: 'error' });
    }
    if (!data.slug) {
        errors.push({ file: fileName, path: 'slug', message: 'Missing country slug', severity: 'error' });
    }
    if (!data.flag) {
        errors.push({ file: fileName, path: 'flag', message: 'Missing flag URL', severity: 'error' });
    }
    if (!data.region) {
        errors.push({ file: fileName, path: 'region', message: 'Missing region', severity: 'error' });
    }
    if (!data.languages || !Array.isArray(data.languages) || data.languages.length === 0) {
        errors.push({ file: fileName, path: 'languages', message: 'Missing languages array', severity: 'error' });
    }
    if (!data.currencies || !Array.isArray(data.currencies) || data.currencies.length === 0) {
        errors.push({ file: fileName, path: 'currencies', message: 'Missing currencies array', severity: 'error' });
    }

    // Initialize depth stats
    const depthStats: DepthStats = {
        totalSections: 0,
        totalItems: 0,
        servicesWithSections: 0,
        servicesWithoutSections: [],
        sectionTypeCoverage: {},
        avgItemsPerSection: 0,
        lineCount
    };

    const sectionIds: Set<string> = new Set();

    // Validate services
    if (!data.services || !Array.isArray(data.services)) {
        errors.push({ file: fileName, path: 'services', message: 'Missing or invalid services array', severity: 'error' });
        return {
            file: fileName,
            countryName: data.name || 'UNKNOWN',
            tier,
            serviceCount: 0,
            sectionCount: 0,
            depthStats,
            errors,
            warnings,
            isValid: false,
            meetsDepthRequirements: false
        };
    }

    const foundSlugs: string[] = [];

    for (let i = 0; i < data.services.length; i++) {
        const service = data.services[i];
        const servicePath = `services[${i}]`;

        // Validate service slug
        if (!service.serviceSlug) {
            errors.push({
                file: fileName,
                path: `${servicePath}.serviceSlug`,
                message: 'Missing serviceSlug',
                severity: 'error'
            });
        } else if (!TOP_13_SERVICES.includes(service.serviceSlug as any)) {
            errors.push({
                file: fileName,
                path: `${servicePath}.serviceSlug`,
                message: `Invalid serviceSlug: "${service.serviceSlug}" is not in TOP_13_SERVICES`,
                severity: 'error'
            });
        } else {
            foundSlugs.push(service.serviceSlug);
        }

        // Validate frontend filter slug (service.slug)
        if (!service.slug) {
            errors.push({
                file: fileName,
                path: `${servicePath}.slug`,
                message: 'Missing service.slug (frontend filter slug)',
                severity: 'error'
            });
        } else if (service.slug !== service.serviceSlug) {
            errors.push({
                file: fileName,
                path: `${servicePath}.slug`,
                message: `service.slug "${service.slug}" does not match serviceSlug "${service.serviceSlug}"`,
                severity: 'warning'
            });
        }

        // Validate heroData
        validateHeroData(service.heroData, servicePath, service.serviceSlug, warnings, fileName);

        // Validate sections
        if (!service.sections || !Array.isArray(service.sections) || service.sections.length === 0) {
            errors.push({
                file: fileName,
                path: `${servicePath}.sections`,
                message: `Service "${service.serviceSlug}" has no sections - minimum ${MIN_REQUIREMENTS.minSectionsPerService} required`,
                severity: 'error'
            });
            depthStats.servicesWithoutSections.push(service.serviceSlug);
        } else {
            depthStats.servicesWithSections++;
            depthStats.totalSections += service.sections.length;

            // Check minimum sections per service
            if (service.sections.length < MIN_REQUIREMENTS.minSectionsPerService) {
                errors.push({
                    file: fileName,
                    path: `${servicePath}.sections`,
                    message: `Service "${service.serviceSlug}" has only ${service.sections.length} sections - minimum ${MIN_REQUIREMENTS.minSectionsPerService} required`,
                    severity: 'error'
                });
            }

            // Track section types for this service
            const serviceSectionTypes: string[] = [];

            for (let j = 0; j < service.sections.length; j++) {
                const section = service.sections[j];
                const sectionPath = `${servicePath}.sections[${j}]`;

                // Validate section ID (Strict)
                if (!section.id) {
                    errors.push({
                        file: fileName,
                        path: `${sectionPath}.id`,
                        message: 'Missing section ID (Strict Mode)',
                        severity: 'error'
                    });
                } else {
                    if (!/^[a-z0-9-]+$/.test(section.id)) {
                        errors.push({
                            file: fileName,
                            path: `${sectionPath}.id`,
                            message: `Invalid section ID format "${section.id}" (must be kebab-case)`,
                            severity: 'error'
                        });
                    }
                    if (sectionIds.has(section.id)) {
                        errors.push({
                            file: fileName,
                            path: `${sectionPath}.id`,
                            message: `Duplicate section ID detected: "${section.id}"`,
                            severity: 'error'
                        });
                    }
                    sectionIds.add(section.id);
                }

                // Validate section type
                if (!section.type) {
                    errors.push({
                        file: fileName,
                        path: `${sectionPath}.type`,
                        message: 'Missing section type',
                        severity: 'error'
                    });
                } else if (!VALID_SECTION_TYPES.includes(section.type as any)) {
                    errors.push({
                        file: fileName,
                        path: `${sectionPath}.type`,
                        message: `Invalid section type: "${section.type}"`,
                        severity: 'error'
                    });
                } else {
                    serviceSectionTypes.push(section.type);
                    depthStats.sectionTypeCoverage[section.type] =
                        (depthStats.sectionTypeCoverage[section.type] || 0) + 1;
                }

                // Validate content and count items
                const itemCount = validateSectionContent(section, sectionPath, errors, fileName);
                depthStats.totalItems += itemCount;
            }

            // STRICT: Check required section types per service based on Tier
            const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3';
            const requiredTypes = MIN_REQUIREMENTS[tierKey].requiredTypesPerService;

            for (const reqType of requiredTypes) {
                if (!serviceSectionTypes.includes(reqType)) {
                    errors.push({
                        file: fileName,
                        path: `${servicePath}.sections`,
                        message: `Tier ${tier} Service "${service.serviceSlug}" MUST have section type: ${reqType}`,
                        severity: 'error'
                    });
                }
            }
        }
    }

    // Check for missing services
    const missingSlugs = TOP_13_SERVICES.filter(slug => !foundSlugs.includes(slug));
    for (const slug of missingSlugs) {
        errors.push({
            file: fileName,
            path: 'services',
            message: `Missing required service: ${slug}`,
            severity: 'error'
        });
    }

    // Calculate average items per section
    depthStats.avgItemsPerSection = depthStats.totalSections > 0
        ? Math.round((depthStats.totalItems / depthStats.totalSections) * 10) / 10
        : 0;

    const result: ValidationResult = {
        file: fileName,
        countryName: data.name || 'UNKNOWN',
        tier,
        serviceCount: data.services.length,
        sectionCount: depthStats.totalSections,
        depthStats,
        errors: [],
        warnings: [],
        isValid: true,
        meetsDepthRequirements: true
    };

    // Validate depth requirements
    const meetsDepth = validateDepthRequirements(result, tier, errors, warnings, fileName);

    result.errors = errors.filter(e => e.severity === 'error');
    result.warnings = [...warnings, ...errors.filter(e => e.severity === 'warning')];
    result.isValid = result.errors.length === 0;
    result.meetsDepthRequirements = meetsDepth;

    return result;
}

// --- MAIN EXECUTION ---

function main(): void {
    console.log('='.repeat(70));
    console.log('COUNTRY DATA VALIDATION REPORT - STRICT MODE');
    console.log('='.repeat(70));
    console.log(`Directory: ${PROCESSED_DIR}\n`);

    console.log('MINIMUM REQUIREMENTS:');
    console.log(`  - Sections per service: ${MIN_REQUIREMENTS.minSectionsPerService}+`);
    console.log(`  - Items per section: ${MIN_REQUIREMENTS.minItemsPerSection}+`);
    console.log(`  - Tier 1: ${MIN_REQUIREMENTS.tier1.minTotalSections}+ sections, ${MIN_REQUIREMENTS.tier1.minLines}+ lines`);
    console.log(`  - Tier 2: ${MIN_REQUIREMENTS.tier2.minTotalSections}+ sections, ${MIN_REQUIREMENTS.tier2.minLines}+ lines`);
    console.log(`  - Tier 3: ${MIN_REQUIREMENTS.tier3.minTotalSections}+ sections, ${MIN_REQUIREMENTS.tier3.minLines}+ lines`);
    console.log('');

    if (!fs.existsSync(PROCESSED_DIR)) {
        console.error(`ERROR: Directory not found: ${PROCESSED_DIR}`);
        process.exit(1);
    }

    // Recursive file finding
    const getAllFiles = (dir: string): string[] => {
        let results: string[] = [];
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
        console.log(`Filtering for country containing: "${targetCountry}"`);
        files = files.filter(file => {
            const baseName = path.basename(file).toLowerCase();
            return baseName.includes(targetCountry);
        });
    }

    console.log(`Found ${files.length} country file(s) to validate.\n`);

    const results: ValidationResult[] = [];

    for (const file of files) {
        const result = validateCountryFile(file);
        results.push(result);

        const depthStatus = result.meetsDepthRequirements ? '[PASS]' : '[FAIL]';
        const tierLabel = `T${result.tier}`;
        console.log(JSON.stringify(result.errors, null, 2)); console.log(`${depthStatus} ${result.file} (${tierLabel}): ${result.sectionCount} sections, ${result.depthStats.lineCount} lines, ${result.depthStats.totalItems} items`);

        if (result.warnings.length > 0) {
            result.warnings.forEach(warn => {
                console.log(`    [WARN] ${warn.message}`);
            });
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));

    const passCount = results.filter(r => r.meetsDepthRequirements).length;
    const failCount = results.filter(r => !r.meetsDepthRequirements).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const totalSections = results.reduce((sum, r) => sum + r.sectionCount, 0);
    const totalItems = results.reduce((sum, r) => sum + r.depthStats.totalItems, 0);

    console.log(`Countries: ${results.length} total (${passCount} pass, ${failCount} fail)`);
    console.log(`Total Sections: ${totalSections}`);
    console.log(`Total Items: ${totalItems}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Warnings: ${totalWarnings}`);

    // Tier breakdown
    console.log('\nBY TIER:');
    for (const tier of [1, 2, 3] as const) {
        const tierResults = results.filter(r => r.tier === tier);
        const tierPass = tierResults.filter(r => r.meetsDepthRequirements).length;
        const tierTotal = tierResults.length;
        console.log(`  Tier ${tier}: ${tierPass}/${tierTotal} pass`);
    }

    // Countries that need work
    if (failCount > 0) {
        console.log('\nCOUNTRIES NEEDING MORE DATA:');
        results
            .filter(r => !r.meetsDepthRequirements)
            .sort((a, b) => a.tier - b.tier)
            .forEach(r => {
                const requirements = r.tier === 1 ? MIN_REQUIREMENTS.tier1 :
                    r.tier === 2 ? MIN_REQUIREMENTS.tier2 :
                        MIN_REQUIREMENTS.tier3;
                const sectionGap = requirements.minTotalSections - r.sectionCount;
                const lineGap = requirements.minLines - r.depthStats.lineCount;
                console.log(`  - ${r.countryName} (T${r.tier}): needs ${sectionGap > 0 ? `+${sectionGap} sections` : ''} ${lineGap > 0 ? `+${lineGap} lines` : ''}`);
            });

        console.log('\n[FAIL] VALIDATION FAILED - Please expand data for countries above.');
        process.exit(1);
    } else {
        console.log('\n[PASS] ALL COUNTRIES MEET DEPTH REQUIREMENTS');
    }
}

main();
