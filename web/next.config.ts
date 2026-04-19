import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const supabaseOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
})();

// NOTE: Supabase Auth, Storage, and Realtime (WebSocket) all need to be in connect-src.
const connectSrc = ["'self'", supabaseOrigin, supabaseOrigin.replace('https://', 'wss://')]
  .filter(Boolean)
  .join(' ');

// CSP: relax script-src in development to let Next.js HMR + react-refresh work.
const csp = [
  `default-src 'self'`,
  `script-src 'self' ${isProd ? '' : "'unsafe-eval' 'unsafe-inline'"} 'unsafe-inline' blob:`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com data:`,
  `img-src 'self' data: https: blob:`,
  `connect-src ${connectSrc}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `form-action 'self'`,
]
  .map((rule) => rule.replace(/\s+/g, ' ').trim())
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

if (isProd) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  });
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
