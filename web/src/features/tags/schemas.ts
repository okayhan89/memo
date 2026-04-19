import { z } from 'zod';

// Tag display name: 1–40 chars, any unicode (한국어 포함). Normalized for
// uniqueness by lowercasing + trimming — the DB enforces that uniqueness via
// a unique index on (owner_id, lower(name)).
export const tagNameSchema = z
  .string()
  .trim()
  .min(1, { message: '태그 이름을 적어주세요.' })
  .max(40, { message: '태그는 40자 이내로 적어주세요.' });

export const createTagSchema = z.object({
  name: tagNameSchema,
  color: z.string().max(20).optional(),
});

export const attachTagSchema = z.object({
  noteId: z.string().uuid(),
  name: tagNameSchema,
});

export const detachTagSchema = z.object({
  noteId: z.string().uuid(),
  tagId: z.string().uuid(),
});

export const deleteTagSchema = z.object({ tagId: z.string().uuid() });

export function normalizeTagName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function tagKey(raw: string): string {
  return normalizeTagName(raw).toLowerCase();
}
