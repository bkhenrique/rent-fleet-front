import { ImageResponse } from 'next/og';
import { BRAND_MARK_PATHS } from '@/lib/brand-mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Apple touch icon — iOS aplica a própria máscara arredondada, por isso sem `borderRadius` aqui. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFB020, #FF8A1F)',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          {BRAND_MARK_PATHS.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill={path.fill ?? 'none'}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeLinecap={path.strokeLinecap}
              strokeLinejoin={path.strokeLinejoin}
              fillRule={path.fillRule}
            />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
