'use client';

import { useActionState } from 'react';
import { sendMagicLink, type LoginActionState } from '@/features/auth/actions';

const initialState: LoginActionState = { status: 'idle' };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  if (state.status === 'sent') {
    return (
      <div className="border-line bg-paper-raised mt-8 rounded-lg border p-6">
        <p className="text-ink font-serif text-(length:--text-lg) leading-tight">
          메일함을 확인해주세요.
        </p>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          <span className="text-ink font-medium">{state.message}</span>로 로그인 링크를 보냈어요.
          이메일이 오지 않는다면 스팸함을 확인하거나 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label htmlFor="email" className="text-ink-muted text-xs tracking-wider uppercase">
        이메일
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        className="border-line focus:border-ink bg-paper-raised text-ink h-12 rounded-md border px-4 text-base transition outline-none"
      />

      {state.status === 'error' && state.message ? (
        <p role="alert" className="text-danger text-xs">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper mt-2 h-12 rounded-md font-medium transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? '보내는 중…' : '로그인 링크 받기'}
      </button>
    </form>
  );
}
