import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        fontSize: 128,
        fontWeight: 500,
        fontFamily: '"Georgia", serif',
        letterSpacing: -3,
        position: 'relative',
      }}
    >
      M
      <span
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: '#cc5533',
        }}
      />
    </div>,
    { ...size },
  );
}
