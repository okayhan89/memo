'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';

const BUCKET = 'note-images';
const MAX_BYTES = 10 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

function extFromType(type: string): string {
  return EXT_BY_MIME[type] ?? 'bin';
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; reason: string };

/**
 * Uploads a single image blob to Supabase Storage under
 *   {owner_id}/{YYYY}/{MM}/{uuid}.{ext}
 * and returns the public URL. RLS in migration 0005_storage.sql allows only
 * the owner to write into their own prefix, so an attacker cannot overwrite
 * another user's files even with a forged upload.
 */
export async function uploadNoteImage(file: Blob): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    return {
      status: 'error',
      reason: '클라우드 저장이 연결되지 않아 이미지 업로드가 꺼져 있어요.',
    };
  }
  if (!file.type.startsWith('image/')) {
    return { status: 'error', reason: '이미지 파일만 업로드할 수 있어요.' };
  }
  if (file.size > MAX_BYTES) {
    return { status: 'error', reason: '10MB 이하의 이미지만 업로드할 수 있어요.' };
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'error', reason: '로그인 후 이미지를 업로드할 수 있어요.' };

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const path = `${user.id}/${yyyy}/${mm}/${randomId()}.${extFromType(file.type)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { status: 'error', reason: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { status: 'ok', url: publicUrl };
}
