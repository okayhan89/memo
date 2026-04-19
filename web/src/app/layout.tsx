import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://memo.local'),
  title: {
    default: 'Memo — 생각을 붙잡는 가장 빠른 방법',
    template: '%s · Memo',
  },
  description:
    '오프라인에서도 흐르는 생각을 즉시 붙잡고, 한국어 검색과 CRDT 동기화로 언제 어디서든 이어쓰세요.',
  applicationName: 'Memo',
  authors: [{ name: 'Memo' }],
  openGraph: {
    title: 'Memo — 생각을 붙잡는 가장 빠른 방법',
    description:
      '오프라인에서도 흐르는 생각을 즉시 붙잡고, 한국어 검색과 CRDT 동기화로 이어쓰세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0e12' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
