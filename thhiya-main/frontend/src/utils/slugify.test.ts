import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('returns empty string for nullish or empty values', () => {
    expect(slugify(undefined)).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify('')).toBe('');
  });

  it('maps known aliases to canonical slugs', () => {
    expect(slugify('Mergers & Acquisitions')).toBe('msa');
    expect(slugify('Payroll')).toBe('global-payroll');
    expect(slugify('Employer of Record')).toBe('eor-peo-aor');
    expect(slugify('MSP Services')).toBe('marketing-agency');
  });

  it('normalizes casing, punctuation, and trailing service word', () => {
    expect(slugify('  Global Payroll Services  ')).toBe('global-payroll');
    expect(slugify('Tax Services')).toBe('taxation');
    expect(slugify('Software Solutions')).toBe('software-technology-solutions');
    expect(slugify('Custom Compliance / Risk Service')).toBe('custom-compliance-risk');
  });
});
