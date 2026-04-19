'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loginSchema } from './schemas';
import { clientEnv, isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type LoginActionState = {
  status: 'idle' | 'sent' | 'error';
  message?: string;
};

export async function sendMagicLink(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!isSupabaseConfigured) {
    return {
      status: 'error',
      message:
        'Supabase 환경 변수가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY를 추가하세요.',
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    next: formData.get('next') ?? undefined,
    claim: formData.get('claim') ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? '입력이 올바르지 않습니다.';
    return { status: 'error', message: first };
  }

  const supabase = await createSupabaseServerClient();
  const callbackUrl = new URL('/auth/callback', clientEnv.NEXT_PUBLIC_APP_URL);
  if (parsed.data.next) callbackUrl.searchParams.set('next', parsed.data.next);
  if (parsed.data.claim === '1') callbackUrl.searchParams.set('claim', '1');

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'sent', message: parsed.data.email };
}

export async function signOut(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
