import { describe, expect, it } from 'vitest';
import {
  isRequiredQuestionForService,
  validateQuestionnaireAnswersForMatrix,
} from './complianceQuestionnaire';

describe('validateQuestionnaireAnswersForMatrix', () => {
  it('returns null when required answers are present for selected service and country', () => {
    const serviceMatrix = [
      { countries: ['United Arab Emirates'], services: ['EOR / PEO Services'] },
    ];

    const answers = {
      'group-0': {
        general: {
          legal_entity: 'Own entity',
          years_active: '3–5 years',
        },
        'EOR / PEO Services': {
          pricing_model: ['Per employee per month'],
          contract_commitment: '6 months',
          support_languages: 'English, Arabic',
          onboarding_time: 7,
          worker_types: ['Local citizens'],
          full_handling: ['Income Tax', 'Social Security'],
        },
      },
    };

    expect(validateQuestionnaireAnswersForMatrix(serviceMatrix, answers)).toBeNull();
  });

  it('fails when required general answers are missing', () => {
    const serviceMatrix = [
      { countries: ['India'], services: ['Global Payroll'] },
    ];

    const answers = {
      'group-0': {
        general: {},
        'Global Payroll': {
          pricing_model: ['% of payroll'],
          contract_commitment: 'No minimum',
          support_languages: 'English',
          worker_types: ['Contractors/freelancers'],
          full_handling: ['Mandatory Filings'],
        },
      },
    };

    const error = validateQuestionnaireAnswersForMatrix(serviceMatrix, answers);
    expect(error).toContain('Please complete');
    expect(error).toContain('India');
  });

  it('does not require marketing-specific fields for non-marketing services', () => {
    const serviceMatrix = [
      { countries: ['Brazil'], services: ['Tax Services'] },
    ];

    const answers = {
      'group-0': {
        general: {
          legal_entity: 'Partner',
          years_active: '1–3 years',
        },
        'Tax Services': {
          pricing_model: ['Fixed monthly fee'],
          contract_commitment: '3 months',
          support_languages: 'Portuguese',
        },
      },
    };

    expect(validateQuestionnaireAnswersForMatrix(serviceMatrix, answers)).toBeNull();
  });

  it('requires marketing channels for marketing services', () => {
    const serviceMatrix = [
      { countries: ['UAE', 'Saudi Arabia', 'Qatar'], services: ['Marketing Agencies'] },
    ];

    const answers = {
      'group-0': {
        general: {
          legal_entity: 'Own entity',
          years_active: '5+ years',
        },
        'Marketing Agencies': {
          pricing_model: ['Fixed monthly fee'],
          contract_commitment: 'No minimum',
          support_languages: 'English, Arabic',
        },
      },
    };

    const error = validateQuestionnaireAnswersForMatrix(serviceMatrix, answers);
    expect(error).toContain('Marketing Agencies');
    expect(error).toContain('UAE, Saudi Arabia +1');
  });

  it('ignores incomplete matrix rows and validates only complete selections', () => {
    const serviceMatrix = [
      { countries: [], services: ['Global Payroll'] },
      { countries: ['India'], services: [] },
      { countries: ['Germany'], services: ['Global Payroll'] },
    ];

    const answers = {
      'group-0': {
        general: {
          legal_entity: 'Partner',
          years_active: '1–3 years',
        },
        'Global Payroll': {
          pricing_model: ['% of payroll'],
          contract_commitment: '12 months',
          support_languages: 'English, German',
          worker_types: ['Expatriates'],
          full_handling: ['Income Tax'],
        },
      },
    };

    expect(validateQuestionnaireAnswersForMatrix(serviceMatrix, answers)).toBeNull();
  });

  it('validates each selected service independently in a group', () => {
    const serviceMatrix = [
      { countries: ['Singapore'], services: ['Global Payroll', 'Marketing Agencies'] },
    ];

    const answers = {
      'group-0': {
        general: {
          legal_entity: 'Own entity',
          years_active: '3–5 years',
        },
        'Global Payroll': {
          pricing_model: ['Per employee per month'],
          contract_commitment: '6 months',
          support_languages: 'English',
          worker_types: ['Contractors/freelancers'],
          full_handling: ['Mandatory Filings'],
        },
        'Marketing Agencies': {
          pricing_model: ['Fixed monthly fee'],
          contract_commitment: 'No minimum',
          support_languages: 'English',
        },
      },
    };

    const error = validateQuestionnaireAnswersForMatrix(serviceMatrix, answers);
    expect(error).toContain('Marketing Agencies');
    expect(error).toContain('Singapore');
  });
});

describe('isRequiredQuestionForService', () => {
  it('returns baseline required for general group', () => {
    expect(isRequiredQuestionForService('general', 'legal_entity')).toBe(true);
    expect(isRequiredQuestionForService('general', 'years_active')).toBe(true);
    expect(isRequiredQuestionForService('general', 'pricing_model')).toBe(false);
  });

  it('returns service-specific required fields for EOR and marketing', () => {
    expect(isRequiredQuestionForService('EOR / PEO Services', 'onboarding_time')).toBe(true);
    expect(isRequiredQuestionForService('EOR / PEO Services', 'marketing_channels')).toBe(false);
    expect(isRequiredQuestionForService('Marketing Agencies', 'marketing_channels')).toBe(true);
  });
});
