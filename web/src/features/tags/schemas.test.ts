import { describe, expect, test } from 'vitest';
import {
  attachTagSchema,
  createTagSchema,
  normalizeTagName,
  tagKey,
  tagNameSchema,
} from './schemas';

const VALID_UUID = '11111111-1111-4111-8111-111111111111';

describe('tagNameSchema', () => {
  test('accepts Korean and Latin names', () => {
    expect(tagNameSchema.safeParse('프로젝트').success).toBe(true);
    expect(tagNameSchema.safeParse('ideas').success).toBe(true);
    expect(tagNameSchema.safeParse('개인 · 일상').success).toBe(true);
  });

  test('rejects empty and overlong input', () => {
    expect(tagNameSchema.safeParse('   ').success).toBe(false);
    expect(tagNameSchema.safeParse('x'.repeat(41)).success).toBe(false);
  });

  test('trims whitespace before validating length', () => {
    const result = tagNameSchema.safeParse('  일상  ');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('일상');
  });
});

describe('normalizeTagName', () => {
  test('collapses internal whitespace', () => {
    expect(normalizeTagName('  개인\t\t일상  ')).toBe('개인 일상');
  });
});

describe('tagKey', () => {
  test('is case-insensitive and whitespace-collapsing', () => {
    expect(tagKey('Ideas')).toBe(tagKey('  ideas  '));
    expect(tagKey('개인 일상')).toBe(tagKey('개인\t일상'));
  });
});

describe('createTagSchema + attachTagSchema', () => {
  test('createTagSchema accepts optional color', () => {
    expect(createTagSchema.safeParse({ name: 'ideas' }).success).toBe(true);
    expect(createTagSchema.safeParse({ name: 'ideas', color: '#cc5533' }).success).toBe(true);
  });

  test('attachTagSchema requires uuid noteId + valid name', () => {
    expect(attachTagSchema.safeParse({ noteId: VALID_UUID, name: 'ideas' }).success).toBe(true);
    expect(attachTagSchema.safeParse({ noteId: 'bad', name: 'ideas' }).success).toBe(false);
    expect(attachTagSchema.safeParse({ noteId: VALID_UUID, name: '' }).success).toBe(false);
  });
});
