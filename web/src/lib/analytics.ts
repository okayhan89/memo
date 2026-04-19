import { clientEnv } from './env';

// Zero-dep analytics façade. Becomes a real PostHog / Sentry integration
// once the corresponding env vars are present. Until then every call is a
// no-op, which keeps production code free of `if (posthog) posthog.capture(...)`
// scaffolding.

type EventName =
  | 'note_created'
  | 'note_deleted'
  | 'note_restored'
  | 'note_favorited'
  | 'search_ran'
  | 'note_exported'
  | 'login_link_sent';

type EventProps = Record<string, string | number | boolean | null | undefined>;

// Indirect dynamic import keeps TypeScript from trying to resolve the module at
// build time, so these integrations stay fully optional. Install the package
// and set the env key to enable capture with no code change.
const dynImport = (spec: string): Promise<unknown> =>
  (new Function('s', 'return import(s)') as (s: string) => Promise<unknown>)(spec).catch(
    () => null,
  );

type PosthogModule = {
  default: {
    __loaded?: boolean;
    init: (key: string, options: Record<string, unknown>) => void;
    capture: (event: string, props?: Record<string, unknown>) => void;
  };
};

type SentryModule = {
  captureException: (error: unknown, context?: { extra?: Record<string, unknown> }) => void;
};

export function track(event: EventName, props?: EventProps) {
  if (typeof window === 'undefined') return;
  if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return;
  void dynImport('posthog-js').then((imported) => {
    if (!imported) return;
    const { default: posthog } = imported as PosthogModule;
    if (!posthog.__loaded) {
      posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
        capture_pageview: true,
        autocapture: false,
      });
    }
    posthog.capture(event, props as Record<string, unknown> | undefined);
  });
}

export function captureError(error: unknown, context?: EventProps) {
  if (typeof window === 'undefined') return;
  if (!clientEnv.NEXT_PUBLIC_SENTRY_DSN) return;
  void dynImport('@sentry/browser').then((imported) => {
    if (!imported) return;
    const Sentry = imported as SentryModule;
    Sentry.captureException(error, { extra: context });
  });
}
