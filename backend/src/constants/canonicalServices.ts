/**
 * CANONICAL SERVICE SLUGS - STRICT ENFORCEMENT
 * 
 * ⚠️ CRITICAL: Only these 14 slugs are valid for country data.
 * Any service not in this list MUST be removed or remapped.
 * 
 * These slugs are used by:
 * - Frontend filters (InsightsHubPage.tsx)
 * - Backend validation (validate_country_data.ts)
 * - Data seeding (seed_countries.ts)
 * 
 * DO NOT ADD NEW SLUGS without updating all dependent files.
 */
export const TOP_13_SERVICES = [
    'global-payroll',
    'hris-hrms-ats',
    'contractor-management',
    'eor-peo-aor',
    'incorporation-entity-setup',
    'msa',
    'marketing-agency',
    'software-technology-solutions',
    'staffing-recruiting',
    'accounting-compliances',
    'taxation',
    'human-resource-benefits',
    'immigration-visa',
    'it-provisioning'
] as const;

export type CanonicalServiceSlug = typeof TOP_13_SERVICES[number];

/**
 * VALID SECTION TYPES - STRICT ENFORCEMENT
 * 
 * Only these section types are rendered by the frontend.
 * Any other type will not display correctly.
 */
export const VALID_SECTION_TYPES = [
    'cost_breakdown',
    'key_steps',
    'essentials',
    'insights',
    'good_to_know',
    'deductions',
    'faq',
    'custom',
    'table'
] as const;

export type ValidSectionType = typeof VALID_SECTION_TYPES[number];
