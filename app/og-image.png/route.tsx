import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Malta Luxury Real Estate';
  const subtitle = searchParams.get('subtitle') ?? 'Premium Properties in Malta & Gozo';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1208 50%, #0A0A0A 100%)',
          padding: '80px',
          fontFamily: 'serif',
        }}
      >
        {/* Gold accent line */}
        <div style={{ width: '80px', height: '3px', background: '#C5A059', marginBottom: '24px', display: 'flex' }} />

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? '42px' : '52px',
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '20px',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#C5A059',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          {subtitle}
        </div>

        {/* Logo area */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#C5A059',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#0A0A0A', fontWeight: 'bold', fontSize: '24px', display: 'flex' }}>M</span>
          </div>
          <span style={{ color: '#ffffff', fontSize: '18px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex' }}>
            Malta <span style={{ color: '#C5A059', marginLeft: '8px', display: 'flex' }}>Luxury</span>
          </span>
        </div>

        {/* Bottom watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          maltaluxuryrealestate.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
