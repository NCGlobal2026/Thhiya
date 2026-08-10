export const CANONICAL_SERVICES = [
    { name: 'Global Payroll', slug: 'global-payroll', category: 'Payroll' },
    { name: 'HRIS/HRSM/ATS', slug: 'hris-hrms-ats', category: 'Technology' },
    { name: 'Contractor Management', slug: 'contractor-management', category: 'HR' },
    { name: 'EOR, PEO & AOR', slug: 'eor-peo-aor', category: 'Employment' },
    { name: 'Incorporation & Registration (Entity Setup)', slug: 'incorporation-entity-setup', category: 'Legal' },
    { name: 'M & A', slug: 'msa', category: 'Strategy' },
    { name: 'Marketing Agency', slug: 'marketing-agency', category: 'Marketing' },
    { name: 'Software & Technology Solutions', slug: 'software-technology-solutions', category: 'Technology' },
    { name: 'Staffing and Recruiting', slug: 'staffing-recruiting', category: 'Recruitment' },
    { name: 'Accounting & Compliances', slug: 'accounting-compliances', category: 'Finance' },
    { name: 'Taxation', slug: 'taxation', category: 'Finance' },
    { name: 'Human Resource and Benefits', slug: 'human-resource-benefits', category: 'HR' },
    { name: 'Immigration and Visa', slug: 'immigration-visa', category: 'Legal' },
    { name: 'IT Provisioning', slug: 'it-provisioning', category: 'Technology' }
];

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
];

export const SLUG_MAPPING: Record<string, string> = {
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

    'incorporation-registration-entity-setup': 'incorporation-entity-setup',
    'incorporation-entity-setup': 'incorporation-entity-setup',
    'incorporation-and-entity-setup': 'incorporation-entity-setup',
    'incorporation': 'incorporation-entity-setup',

    'staffing-talent-acquisition': 'staffing-recruiting',
    'staffing-and-talent-acquisition': 'staffing-recruiting',
    'staffing-and-recruiting': 'staffing-recruiting',
    'staffing-recruiting': 'staffing-recruiting',
    'staffing': 'staffing-recruiting',
    'talent-acquisition': 'staffing-recruiting',

    'hris': 'hris-hrms-ats',
    'hris-hrsm-ats': 'hris-hrms-ats',
    'hris-hrms-ats': 'hris-hrms-ats',
    'hris-human-resources-information-system': 'hris-hrms-ats',

    'accounting-services': 'accounting-compliances',
    'accounting': 'accounting-compliances',
    'accounting-compliances': 'accounting-compliances',
    'compliance-services': 'accounting-compliances',
    'compliance': 'accounting-compliances',
    'finance': 'accounting-compliances',

    'tax-services': 'taxation',
    'taxation': 'taxation',
    'tax': 'taxation',

    'bank-account-opening': 'accounting-compliances',
    'bank-account': 'accounting-compliances',
    'global-payments': 'accounting-compliances',
    'payments': 'accounting-compliances',
    'global-payments-services': 'accounting-compliances',

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
    'immigration-and-visa': 'immigration-visa',
    'visa': 'immigration-visa',
    'immigration': 'immigration-visa',
    'immigration-visa': 'immigration-visa',

    'benefits': 'human-resource-benefits',
    'benefits-administration': 'human-resource-benefits',
    'human-resource-benefits': 'human-resource-benefits',
    'human-resource-and-benefits': 'human-resource-benefits',
    'human-resources': 'human-resource-benefits',
    'hr': 'human-resource-benefits',

    'contractor-management': 'contractor-management',
    'contractor-management-services': 'contractor-management',

    'employee-equipment-management': 'it-provisioning',
    'equipment-management': 'it-provisioning',
    'equipment': 'it-provisioning',
    'it-provisioning': 'it-provisioning'
};

export const normalizeSlug = (val: string) =>
    String(val || '').toLowerCase().trim()
        .replace(/\s+services?$/i, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
