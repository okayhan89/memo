import { ImageResponse } from 'next/og';

export const alt = 'Memo — 생각을 붙잡는 가장 빠른 방법';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PAPER = '#f7f5f0';
const INK = '#1a1a2e';
const INK_MUTED = '#5a5a70';
const ACCENT = '#cc5533';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 88px',
        background: PAPER,
        fontFamily: '"Georgia", "Times New Roman", serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: INK,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 20,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: INK,
              color: PAPER,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 600,
              position: 'relative',
            }}
          >
            M
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: 999,
                background: ACCENT,
              }}
            />
          </div>
          <span>MEMO</span>
        </div>
        <div
          style={{
            color: ACCENT,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Editorial · Offline-first · Open
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 960 }}>
        <h1
          style={{
            margin: 0,
            color: INK,
            fontSize: 128,
            lineHeight: 1.02,
            letterSpacing: -3,
            fontWeight: 500,
          }}
        >
          생각을 붙잡는
          <br />
          <em style={{ color: ACCENT, fontStyle: 'italic' }}>가장 빠른</em> 방법.
        </h1>
        <p
          style={{
            margin: 0,
            color: INK_MUTED,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 28,
            lineHeight: 1.5,
            maxWidth: 820,
          }}
        >
          이메일도, 계정도 필요 없이 지금 바로. 한국어 검색, 멀티 디바이스 동기화, 버전 히스토리.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${INK_MUTED}33`,
          paddingTop: 28,
          color: INK_MUTED,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 20,
        }}
      >
        <span>memo.ggogom.co.kr</span>
        <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 2 }}>V0.1</span>
      </div>
    </div>,
    { ...size },
  );
}
