import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#18182a',
        color: '#f7f5f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 42,
        fontWeight: 600,
        fontFamily: '"Georgia", serif',
        letterSpacing: -1,
        position: 'relative',
        borderRadius: 12,
      }}
    >
      M
      <span
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 10,
          height: 10,
          borderRadius: 999,
          background: '#cc5533',
        }}
      />
    </div>,
    { ...size },
  );
}
