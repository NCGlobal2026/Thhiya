export const VENDOR_QUESTIONS = {
  general: [
    {
      id: 'legal_entity',
      question: 'Do you operate in this country via your own legal entity or a local partner?',
      type: 'radio',
      options: ['Own entity', 'Partner', 'Both']
    },
    {
      id: 'years_active',
      question: 'How many years have you been active in this country?',
      type: 'select',
      options: ['<1 year', '1–3 years', '3–5 years', '5+ years']
    },
    {
      id: 'tax_registration',
      question: 'Are you registered for all required local taxes and social contributions?',
      type: 'yes_no_explain',
    },
    {
      id: 'hr_experts',
      question: 'Do you have in-country legal / HR experts or rely on external counsel?',
      type: 'radio',
      options: ['Own team', 'External', 'Both']
    }
  ],
  services_available: {
    question: 'Which services are available in this country?',
    id: 'services_available',
    type: 'checkbox_group',
    options: [
      'EOR / PEO Services',
      'Incorporation / Entity Setup',
      'Staffing / Talent Acquisition',
      'Global Payroll',
      'HRIS (Human Resources Information System)',
      'Accounting Services',
      'Tax Services',
      'Compliance Services',
      'M&A Services',
      'Software Solutions',
      'MSP (Managed Service Provider)',
      'Marketing Agencies'
    ]
  },
  eor_specific: [
    {
      id: 'min_headcount',
      question: 'Minimum headcount per client engagement',
      type: 'number'
    },
    {
      id: 'max_headcount',
      question: 'Maximum headcount per client you can support here',
      type: 'number'
    },
    {
      id: 'onboarding_time',
      question: 'Typical onboarding time per employee in this country (days)',
      type: 'number'
    }
  ],
  pricing: [
    {
      id: 'pricing_model',
      question: 'How do you price your services?',
      type: 'checkbox_group',
      options: ['Per employee per month', '% of payroll', 'Fixed monthly fee', 'Project based', 'Hybrid']
    },
    {
      id: 'starting_price',
      question: 'Starting price range (USD)',
      type: 'select',
      options: ['0–99', '100–199', '200–499', '500+']
    }
  ],
  operational: [
    {
      id: 'contract_commitment',
      question: 'Minimum contract commitment',
      type: 'select',
      options: ['No minimum', '3 months', '6 months', '1 year+']
    },
    {
      id: 'client_profile',
      question: 'Typical client profile',
      type: 'checkbox_group',
      options: ['Startup', 'SME', 'Enterprise', 'Agency']
    }
  ],
  compliance: [
    {
      id: 'full_handling',
      question: 'Do you fully handle: income tax withholding, social security, statutory benefits, and mandatory filings?',
      type: 'checkbox_group',
      options: ['Income Tax', 'Social Security', 'Statutory Benefits', 'Mandatory Filings']
    },
    {
      id: 'bonus_rules',
      question: 'Are there 13th/14th month salary or similar mandatory bonus rules you manage?',
      type: 'yes_no_explain'
    },
    {
      id: 'law_updates',
      question: 'How often do you update your processes for law changes?',
      type: 'radio',
      options: ['Real-time', 'Quarterly', 'Annually']
    },
    {
      id: 'currencies',
      question: 'Can you run payroll in multiple currencies for this country? If yes, which ones?',
      type: 'input'
    }
  ],
  worker_types: [
      {
        id: 'worker_types',
        question: 'What hiring models do you support?',
        type: 'checkbox_group',
        options: [
          'Local citizens',
          'Foreign employees with sponsored visas',
          'Foreign employees with existing visas',
          'Contractors/freelancers'
        ]
      },
      {
        id: 'contract_types',
        question: 'Standard contract types you use here',
        type: 'checkbox_group',
        options: ['Indefinite', 'Fixed-term', 'Contractor', 'Part-time', 'Probation models']
      }
  ],
  benefits: [
    {
      id: 'mandatory_benefits',
      question: 'Do you provide/manage mandatory and market benefits (health, pension, etc.)?',
      type: 'checkbox_group',
      options: ['Health insurance', 'Pension', 'Paid leave', 'Meal vouchers', 'Others'] 
    },
    {
      id: 'additional_benefits',
      question: 'Can you offer additional, non-mandatory benefits?',
      type: 'yes_no_explain'
    }
  ],
  risk: [
    {
      id: 'restricted_sectors',
      question: 'Are there sectors or roles you cannot support due to regulation?',
      type: 'yes_no_explain'
    },
    {
      id: 'known_restrictions',
      question: 'Any known restrictions (e.g., remote-only limits)?',
      type: 'textarea'
    },
    {
      id: 'penalties',
      question: 'Have you faced any penalties or investigations in the last 5 years?',
      type: 'yes_no_explain'
    }
  ],
  support: [
    {
      id: 'support_languages',
      question: 'Local support languages available',
      type: 'input'
    },
    {
      id: 'working_hours',
      question: 'Local working hours / time zone coverage',
      type: 'input'
    },
    {
      id: 'response_times',
      question: 'Typical response/resolution times',
      type: 'input'
    }
  ],
  marketing_specific: [
    {
      id: 'marketing_channels',
      question: 'Which primary marketing channels do you specialize in?',
      type: 'checkbox_group',
      options: ['SEO', 'Google Ads (PPC)', 'Social Media', 'Content Marketing', 'Email Marketing', 'Affiliate Marketing']
    },
    {
      id: 'reporting_freq',
      question: 'How often do you provide performance reports to clients?',
      type: 'radio',
      options: ['Weekly', 'Bi-weekly', 'Monthly']
    },
    {
      id: 'ad_spend_mgmt',
      question: 'What is the maximum monthly ad spend you are comfortable managing?',
      type: 'select',
      options: ['<$5k', '$5k-$20k', '$20k-$50k', '$50k+']
    }
  ]
};
