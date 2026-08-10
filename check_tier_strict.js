const fs = require('fs');
const path = require('path');

/**
 * Thhiya Country Data Tier Validator
 * Validates JSON files against Tier-specific requirements.
 */

const TIER_CONFIGS = {
    1: { name: 'Strategic', minLines: 2000, minSections: 50, mandatoryTypes: ['key_steps', 'insights'] },
    2: { name: 'Growth', minLines: 1200, minSections: 30, mandatoryTypes: ['key_steps', 'insights', 'cost_breakdown'] },
    3: { name: 'Standard', minLines: 800, minSections: 20, mandatoryTypes: ['key_steps'] }
};

const TOP_12_SERVICES = [
    "eor-peo", "global-payroll", "incorporation-entity-setup", "staffing-talent-acquisition",
    "hris", "accounting", "tax", "compliance", "msa", "software-solutions",
    "marketing-agencies", "payroll-calculator"
];

function validateFile(filePath, forcedTier = null) {
    if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File not found: ${filePath}`);
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const data = JSON.parse(content);

    // Auto-detect tier from path if not forced
    let tier = forcedTier;
    if (!tier) {
        if (filePath.includes('tier-1')) tier = 1;
        else if (filePath.includes('tier-2')) tier = 2;
        else if (filePath.includes('tier-3')) tier = 3;
        else tier = 3; // Default to Tier 3
    }

    const config = TIER_CONFIGS[tier];
    console.log(`\n>>> Validating ${path.basename(filePath)} (Tier ${tier}: ${config.name})`);
    console.log(`- Detected Lines: ${lines} (Min: ${config.minLines})`);

    let totalSections = 0;
    let failures = [];

    TOP_12_SERVICES.forEach(slug => {
        const service = data.services.find(s => s.serviceSlug === slug);
        if (!service) {
            failures.push(`Service "${slug}" is missing!`);
            return;
        }

        const sections = service.sections || [];
        totalSections += sections.length;
        const types = sections.map(s => s.type);

        // Check mandatory types per service
        config.mandatoryTypes.forEach(type => {
            if (!types.includes(type)) {
                failures.push(`Service "${slug}" missing required section: ${type}`);
            }
        });

        // Check min sections per service (Tier 1 & 2 requirement)
        if (tier <= 2 && sections.length < 4) {
            failures.push(`Service "${slug}" has only ${sections.length} sections (need 4)`);
        }
    });

    console.log(`- Total Sections: ${totalSections} (Min: ${config.minSections})`);

    if (lines < config.minLines) failures.push(`Line count ${lines} is below requirement ${config.minLines}`);
    if (totalSections < config.minSections) failures.push(`Total sections ${totalSections} is below requirement ${config.minSections}`);

    if (failures.length > 0) {
        console.log(`\n[FAIL] ${path.basename(filePath)} has ${failures.length} issues:`);
        failures.forEach(f => console.log(`  - ${f}`));
        return false;
    }

    console.log(`\n[PASS] ${path.basename(filePath)} meets all Tier ${tier} requirements.`);
    return true;
}

// CLI Handling
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node check_tier_strict.js <file_path> [--tier 1|2|3]");
    process.exit(1);
}

const targetFile = args[0];
let forcedTier = null;
if (args.includes('--tier')) {
    forcedTier = parseInt(args[args.indexOf('--tier') + 1]);
}

if (!validateFile(targetFile, forcedTier)) {
    process.exit(1);
}
