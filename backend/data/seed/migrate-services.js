const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of 13 Canonical Services
const TARGET_SERVICES = [
    'global-payroll',
    'hris-hrms-ats',
    'contractor-management',
    'eor-peo-aor',
    'incorporation-entity-setup',
    'msa',
    'marketing-agency',
    'software-technology-solutions',
    'staffing-recruiting',
    'finance-tax-accounting',
    'human-resource-benefits',
    'immigration-visa',
    'it-provisioning'
];

// Mapping from old/variant slugs to the new canonical slugs
const SLUG_MAPPING = {
    // Canonical and common variants
    'eor-peo-services': 'eor-peo-aor',
    'eor-peo-aor-services': 'eor-peo-aor',
    'eor-peo-aor': 'eor-peo-aor',
    'eor-peo': 'eor-peo-aor',
    'eor': 'eor-peo-aor',
    'peo': 'eor-peo-aor',
    'employer-of-record': 'eor-peo-aor',
    'eor-peo-services-in-dubai-uae': 'eor-peo-aor',

    'global-payroll': 'global-payroll',
    'payroll': 'global-payroll',
    'payroll-calculator': 'global-payroll',

    'incorporation-entity-setup': 'incorporation-entity-setup',
    'incorporation-and-entity-setup': 'incorporation-entity-setup',
    'incorporation': 'incorporation-entity-setup',

    'staffing-talent-acquisition': 'staffing-recruiting',
    'staffing-and-talent-acquisition': 'staffing-recruiting',
    'staffing-recruiting': 'staffing-recruiting',
    'staffing': 'staffing-recruiting',
    'talent-acquisition': 'staffing-recruiting',

    'hris': 'hris-hrms-ats',
    'hris-hrsm-ats': 'hris-hrms-ats',
    'hris-hrms-ats': 'hris-hrms-ats',
    'hris-human-resources-information-system': 'hris-hrms-ats',

    'accounting-services': 'finance-tax-accounting',
    'accounting': 'finance-tax-accounting',
    'accounting-compliances': 'finance-tax-accounting',
    'compliance-services': 'finance-tax-accounting',
    'compliance': 'finance-tax-accounting',
    'tax-services': 'finance-tax-accounting',
    'taxation': 'finance-tax-accounting',
    'tax': 'finance-tax-accounting',
    'finance-tax-accounting': 'finance-tax-accounting',
    'finance': 'finance-tax-accounting',
    'bank-account-opening': 'finance-tax-accounting',
    'bank-account': 'finance-tax-accounting',
    'global-payments': 'finance-tax-accounting',
    'payments': 'finance-tax-accounting',
    'global-payments-services': 'finance-tax-accounting',

    'mergers-acquisitions': 'msa',
    'mergers-and-acquisitions': 'msa',
    'm-a-services': 'msa',
    'm-a': 'msa',
    'msa': 'msa',
    'market-entry-advice': 'msa',
    'market-entry-advice-mca': 'msa',
    'mca': 'msa',

    'software-solutions': 'software-technology-solutions',
    'software-technology-solutions': 'software-technology-solutions',
    'software': 'software-technology-solutions',

    'msp-services': 'marketing-agency',
    'msp-managed-service-provider': 'marketing-agency',
    'marketing-agencies': 'marketing-agency',
    'marketing-agency': 'marketing-agency',
    'msp': 'marketing-agency',

    'visa-immigration': 'immigration-visa',
    'immigration-support': 'immigration-visa',
    'visa': 'immigration-visa',
    'immigration': 'immigration-visa',
    'immigration-visa': 'immigration-visa',

    'benefits': 'human-resource-benefits',
    'benefits-administration': 'human-resource-benefits',
    'human-resource-benefits': 'human-resource-benefits',
    'human-resources': 'human-resource-benefits',
    'hr': 'human-resource-benefits',

    'contractor-management': 'contractor-management',
    'contractor-management-services': 'contractor-management',

    'employee-equipment-management': 'it-provisioning',
    'equipment-management': 'it-provisioning',
    'equipment': 'it-provisioning',
    'it-provisioning': 'it-provisioning'
};

const processedDir = path.join(__dirname, 'countries', 'processed');

function migrateFile(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;

        if (data.metadata) {
            // 1. Array of strings (old format)
            if (Array.isArray(data.metadata.services)) {
                const newServices = new Set();
                data.metadata.services.forEach(s => {
                    const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const mapped = SLUG_MAPPING[slug];
                    if (mapped) {
                        newServices.add(mapped);
                    } else {
                        console.warn(`Unmapped service string in ${path.basename(filePath)}: ${s}`);
                    }
                });
                if (newServices.size > 0 && Array.from(newServices).sort().join(',') !== data.metadata.services.sort().join(',')) {
                    data.metadata.services = Array.from(newServices);
                    modified = true;
                }
            }

            // 2. Array of objects (new format)
            if (Array.isArray(data.metadata.servicesDetail)) {
                const uniqueDetailsMap = new Map();

                data.metadata.servicesDetail.forEach(detail => {
                    let slug = detail.slug;
                    if (!slug && detail.name) {
                        slug = detail.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    }

                    if (slug) {
                        const mappedSlug = SLUG_MAPPING[slug] || SLUG_MAPPING[slug.replace(/s$/, '')];
                        if (mappedSlug) {
                            // Keep the first instance of details for a group, or merge them.
                            // Here we just keep the first one found for simplicity and update its slug/name.
                            if (!uniqueDetailsMap.has(mappedSlug)) {
                                // Find canonical name from our TARGET_SERVICES list or hardcode
                                let canonicalName = mappedSlug;
                                if (mappedSlug === 'global-payroll') canonicalName = 'Global Payroll';
                                if (mappedSlug === 'hris-hrms-ats') canonicalName = 'HRIS/HRMS/ATS';
                                if (mappedSlug === 'contractor-management') canonicalName = 'Contractor Management';
                                if (mappedSlug === 'eor-peo-aor') canonicalName = 'EOR, PEO & AOR';
                                if (mappedSlug === 'incorporation-entity-setup') canonicalName = 'INCORPORATION & REGISTRATION(ENTITY SETUP)';
                                if (mappedSlug === 'msa') canonicalName = 'M & A';
                                if (mappedSlug === 'marketing-agency') canonicalName = 'MARKETING AGENCY';
                                if (mappedSlug === 'software-technology-solutions') canonicalName = 'Software & Technology Solutions';
                                if (mappedSlug === 'staffing-recruiting') canonicalName = 'Staffing and Recruiting';
                                if (mappedSlug === 'finance-tax-accounting') canonicalName = 'Finance, Tax and Accounting';
                                if (mappedSlug === 'human-resource-benefits') canonicalName = 'Human Resource and Benefits';
                                if (mappedSlug === 'immigration-visa') canonicalName = 'Immigration and Visa';
                                if (mappedSlug === 'it-provisioning') canonicalName = 'IT Provisioning';

                                uniqueDetailsMap.set(mappedSlug, {
                                    ...detail,
                                    slug: mappedSlug,
                                    name: canonicalName
                                });
                            } else {
                                // Optional: merge features/pricing if needed, but often we just deduplicate over canonical slug.
                            }
                        } else {
                            console.warn(`Unmapped serviceDetail slug in ${path.basename(filePath)}: ${slug}`);
                        }
                    }
                });

                const newDetails = Array.from(uniqueDetailsMap.values());
                if (newDetails.length !== data.metadata.servicesDetail.length || JSON.stringify(newDetails) !== JSON.stringify(data.metadata.servicesDetail)) {
                    data.metadata.servicesDetail = newDetails;
                    modified = true;
                }
            }
        }

        // 3. Update top level services array if it exists
        if (Array.isArray(data.services)) {
            const newServicesMap = new Map();

            data.services.forEach(serviceObj => {
                const slug = serviceObj.slug || serviceObj.serviceSlug;
                if (slug) {
                    const mappedSlug = SLUG_MAPPING[slug] || SLUG_MAPPING[slug.replace(/s$/, '')];
                    if (mappedSlug) {
                        if (!newServicesMap.has(mappedSlug)) {

                            let canonicalName = mappedSlug;
                            if (mappedSlug === 'global-payroll') canonicalName = 'Global Payroll';
                            if (mappedSlug === 'hris-hrms-ats') canonicalName = 'HRIS/HRMS/ATS';
                            if (mappedSlug === 'contractor-management') canonicalName = 'Contractor Management';
                            if (mappedSlug === 'eor-peo-aor') canonicalName = 'EOR, PEO & AOR';
                            if (mappedSlug === 'incorporation-entity-setup') canonicalName = 'INCORPORATION & REGISTRATION(ENTITY SETUP)';
                            if (mappedSlug === 'msa') canonicalName = 'M & A';
                            if (mappedSlug === 'marketing-agency') canonicalName = 'MARKETING AGENCY';
                            if (mappedSlug === 'software-technology-solutions') canonicalName = 'Software & Technology Solutions';
                            if (mappedSlug === 'staffing-recruiting') canonicalName = 'Staffing and Recruiting';
                            if (mappedSlug === 'finance-tax-accounting') canonicalName = 'Finance, Tax and Accounting';
                            if (mappedSlug === 'human-resource-benefits') canonicalName = 'Human Resource and Benefits';
                            if (mappedSlug === 'immigration-visa') canonicalName = 'Immigration and Visa';
                            if (mappedSlug === 'it-provisioning') canonicalName = 'IT Provisioning';

                            newServicesMap.set(mappedSlug, {
                                ...serviceObj,
                                name: canonicalName,
                                service: canonicalName,
                                serviceName: canonicalName,
                                slug: mappedSlug,
                                serviceSlug: mappedSlug,
                                heroData: {
                                    ...(serviceObj.heroData || {}),
                                    title: (serviceObj.heroData && serviceObj.heroData.title) || `${canonicalName} in ${data.name}`
                                }
                            });
                        } else {
                            // Merge sections if multiple old services map to the same canonical service
                            const existing = newServicesMap.get(mappedSlug);
                            if (serviceObj.sections && Array.isArray(serviceObj.sections)) {
                                existing.sections = [...(existing.sections || []), ...serviceObj.sections];
                            }
                        }
                    } else {
                        console.warn(`Unmapped root service slug in ${path.basename(filePath)}: ${slug}`);
                    }
                }
            });

            const newServicesArray = Array.from(newServicesMap.values());
            if (newServicesArray.length !== data.services.length || JSON.stringify(newServicesArray) !== JSON.stringify(data.services)) {
                data.services = newServicesArray;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
            console.log(`Updated ${path.basename(filePath)}`);
        }

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

glob(processedDir + '/**/*.json', (err, files) => {
    if (err) {
        console.error('Error finding JSON files:', err);
        return;
    }

    console.log(`Found ${files.length} JSON files. Migrating services...`);
    files.forEach(migrateFile);
    console.log('Migration complete.');
});
