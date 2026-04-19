import { describe, expect, test } from 'vitest';
import {
  createNoteSchema,
  defaultNoteContent,
  idSchema,
  toggleFavoriteSchema,
  updateNoteSchema,
} from './schemas';

const VALID_UUID = '11111111-1111-4111-8111-111111111111';

describe('notes schemas', () => {
  test('createNoteSchema accepts empty input', () => {
    expect(createNoteSchema.safeParse({}).success).toBe(true);
  });

  test('createNoteSchema rejects long titles', () => {
    const longTitle = 'x'.repeat(201);
    expect(createNoteSchema.safeParse({ title: longTitle }).success).toBe(false);
  });

  test('updateNoteSchema requires a uuid id', () => {
    expect(updateNoteSchema.safeParse({ id: 'not-a-uuid' }).success).toBe(false);
    expect(updateNoteSchema.safeParse({ id: VALID_UUID, contentText: 'hi' }).success).toBe(true);
  });

  test('toggleFavoriteSchema requires a boolean value', () => {
    expect(toggleFavoriteSchema.safeParse({ id: VALID_UUID, value: true }).success).toBe(true);
    expect(toggleFavoriteSchema.safeParse({ id: VALID_UUID, value: 'yes' }).success).toBe(false);
  });

  test('idSchema narrows to uuid only', () => {
    expect(idSchema.safeParse({ id: VALID_UUID }).success).toBe(true);
  });

  test('defaultNoteContent returns a ProseMirror empty doc', () => {
    const doc = defaultNoteContent();
    expect(doc.type).toBe('doc');
    expect(doc.content[0]?.type).toBe('paragraph');
  });
});
