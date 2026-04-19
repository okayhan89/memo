import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeScript } from '@/components/theme/ThemeScript';
import { PWARegister } from '@/components/pwa/PWARegister';
import { clientEnv } from '@/lib/env';
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

const APP_URL = clientEnv.NEXT_PUBLIC_APP_URL;
const TITLE = 'Memo — 생각을 붙잡는 가장 빠른 방법';
const DESCRIPTION =
  '가입 없이 지금 바로 쓰고, 원할 때만 로그인해서 모든 기기로 이어쓰세요. 한국어 검색, 오프라인 저장, 버전 히스토리까지.';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: '%s · Memo',
  },
  description: DESCRIPTION,
  applicationName: 'Memo',
  authors: [{ name: 'Memo', url: APP_URL }],
  keywords: [
    '메모 앱',
    '한국어 메모',
    '노트 앱',
    'Tiptap',
    '오프라인 메모',
    'Notion 대안',
    '한국어 검색',
    'Memo',
  ],
  creator: 'Memo',
  publisher: 'Memo',
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: APP_URL,
    siteName: 'Memo',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'productivity',
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
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
