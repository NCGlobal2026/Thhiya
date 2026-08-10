import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges conditional class names', () => {
    const classes = cn('px-4', false && 'hidden', 'py-2', ['font-medium']);
    expect(classes).toBe('px-4 py-2 font-medium');
  });

  it('resolves tailwind conflicts by keeping the last class', () => {
    const classes = cn('text-sm', 'text-lg', 'bg-red-500', 'bg-blue-500');
    expect(classes).toBe('text-lg bg-blue-500');
  });
});
