import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Memo — 생각을 붙잡는 가장 빠른 방법',
    short_name: 'Memo',
    description:
      '오프라인에서도 멈추지 않는 메모 앱. 한국어 검색, 멀티 디바이스 동기화, 버전 히스토리.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5f0',
    theme_color: '#f7f5f0',
    orientation: 'portrait',
    lang: 'ko',
    categories: ['productivity', 'utilities'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: '새 메모',
        short_name: '새 메모',
        description: '빈 메모를 바로 연다',
        url: '/notes?new=1',
      },
      {
        name: '검색',
        short_name: '검색',
        description: '전체 메모에서 검색',
        url: '/search',
      },
    ],
  };
}
