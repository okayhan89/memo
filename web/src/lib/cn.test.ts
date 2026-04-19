import { describe, expect, test } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  test('joins truthy class names with spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  test('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  test('returns empty string when nothing is truthy', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});
