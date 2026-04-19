import { z } from 'zod';

const emptyDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
} as const;

export const noteContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(z.unknown()).optional(),
});

export const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  folderId: z.string().uuid().optional().nullable(),
});

export const updateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(200).optional(),
  contentJson: noteContentSchema.optional(),
  contentText: z.string().optional(),
});

export const toggleFavoriteSchema = z.object({
  id: z.string().uuid(),
  value: z.boolean(),
});

export const idSchema = z.object({ id: z.string().uuid() });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;

export function defaultNoteContent() {
  return emptyDoc;
}
