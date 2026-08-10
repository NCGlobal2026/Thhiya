import { VENDOR_QUESTIONS } from '../features/auth/data/vendorQuestions';

type ServiceMatrixRow = { countries: string[]; services: string[] };
type AnswersByGroup = Record<string, any>;

const REQUIRED_GENERAL = ['legal_entity', 'years_active', 'tax_registration', 'hr_experts'];

const REQUIRED_BY_SERVICE = {
  common: ['pricing_model', 'contract_commitment', 'support_languages'],
  eor: ['onboarding_time', 'worker_types', 'full_handling'],
  payroll: ['worker_types', 'full_handling'],
  recruitment: ['worker_types'],
  compliance: ['full_handling'],
  marketing: ['marketing_channels'],
} as const;

const ALL_QUESTIONS = [
  ...VENDOR_QUESTIONS.general,
  ...VENDOR_QUESTIONS.eor_specific,
  ...VENDOR_QUESTIONS.pricing,
  ...VENDOR_QUESTIONS.operational,
  ...VENDOR_QUESTIONS.compliance,
  ...VENDOR_QUESTIONS.worker_types,
  ...VENDOR_QUESTIONS.benefits,
  ...VENDOR_QUESTIONS.risk,
  ...VENDOR_QUESTIONS.support,
  ...VENDOR_QUESTIONS.marketing_specific,
];

const QUESTION_MAP = new Map(ALL_QUESTIONS.map((q) => [q.id, q.question]));

const hasValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return value !== null && value !== undefined;
};

const getRequiredQuestionIdsForService = (service: string): string[] => {
  const required: string[] = [...REQUIRED_BY_SERVICE.common];

  const s = service.toLowerCase();
  if (s.includes('eor') || s.includes('peo')) required.push(...REQUIRED_BY_SERVICE.eor);
  if (s.includes('payroll')) required.push(...REQUIRED_BY_SERVICE.payroll);
  if (s.includes('recruitment') || s.includes('talent')) required.push(...REQUIRED_BY_SERVICE.recruitment);
  if (s.includes('legal') || s.includes('compliance')) required.push(...REQUIRED_BY_SERVICE.compliance);
  if (s.includes('marketing')) required.push(...REQUIRED_BY_SERVICE.marketing);

  return Array.from(new Set(required));
};

const toCountryLabel = (countries: string[]): string => {
  if (countries.length === 0) return 'selected market';
  if (countries.length === 1) return countries[0];
  if (countries.length <= 2) return countries.join(' & ');
  return `${countries[0]} and ${countries.length - 1} other(s)`;
};

export const isRequiredQuestionForService = (service: string, questionId: string): boolean => {
  if (service === 'general') return REQUIRED_GENERAL.includes(questionId);
  return getRequiredQuestionIdsForService(service).includes(questionId);
};

export const validateQuestionnaireAnswersForMatrix = (
  serviceMatrix: ServiceMatrixRow[],
  answers: AnswersByGroup
): string | null => {
  const validRows = serviceMatrix.filter((row) => row.countries.length > 0 && row.services.length > 0);

  for (let idx = 0; idx < validRows.length; idx += 1) {
    const row = validRows[idx];
    const groupKey = `group-${idx}`;
    const countryLabel = toCountryLabel(row.countries);

    // 1. Validate General Questions (Market Level)
    for (const qId of REQUIRED_GENERAL) {
      const value = answers[groupKey]?.general?.[qId];
      if (!hasValue(value)) {
        const qText = QUESTION_MAP.get(qId) || 'a required general question';
        return `Please complete "${qText}" for ${countryLabel}.`;
      }
    }

    // 2. Validate Service-Specific Questions
    for (const service of row.services) {
      const required = getRequiredQuestionIdsForService(service);
      for (const qId of required) {
        const value = answers[groupKey]?.[service]?.[qId];
        if (!hasValue(value)) {
          const qText = QUESTION_MAP.get(qId) || 'a required question';
          return `Please complete "${qText}" for ${service} in ${countryLabel}.`;
        }
      }
    }
  }

  return null;
};
