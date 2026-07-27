import { ImageResponse } from 'next/og';
import { BRAND_MARK_PATHS } from '@/lib/brand-mark';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Favicon gerado por código — mesma marca (carro + pino + seta) usada no header/footer da landing. */
export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
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
