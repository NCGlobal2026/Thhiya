import { describe, expect, it } from 'bun:test';
import { getInsightSchema } from './validators';

describe('getInsightSchema', () => {
  it('accepts valid service and country', () => {
    const parsed = getInsightSchema.parse({ service: 'eor-peo', country: 'United Arab Emirates' });
    expect(parsed.service).toBe('eor-peo');
    expect(parsed.country).toBe('United Arab Emirates');
  });

  it('rejects empty values', () => {
    const result = getInsightSchema.safeParse({ service: '', country: '' });
    expect(result.success).toBe(false);
  });
});
