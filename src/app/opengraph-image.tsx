import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

export const alt = `${site.name}, Jagannath University`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The link preview for every public page that has no image of its own.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: 'linear-gradient(135deg, #fdf6f7 0%, #f0ecf8 100%)',
          color: '#2a2230',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, color: '#4b2a52' }}>HALLMATE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ fontSize: 36, color: '#5c5163' }}>Jagannath University, Dhaka · notices, admission and the residents&apos; portal</div>
        </div>
        <div style={{ display: 'flex', width: 96, height: 8, borderRadius: 4, background: '#4b2a52' }} />
      </div>
    ),
    size,
  );
}
