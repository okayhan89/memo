import { describe, expect, test } from 'vitest';
import { loginSchema } from './schemas';

describe('loginSchema', () => {
  test('accepts a valid email', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  test('rejects an invalid email with Korean message', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('이메일');
    }
  });

  test('allows an optional next path starting with /', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', next: '/notes/123' });
    expect(result.success).toBe(true);
  });

  test('rejects a next that is not a relative path', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', next: 'https://evil.com' });
    expect(result.success).toBe(false);
  });
});
