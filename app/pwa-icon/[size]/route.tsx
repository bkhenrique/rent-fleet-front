import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { BRAND_MARK_PATHS } from '@/lib/brand-mark';

/**
 * Ícones do manifest PWA (192/512, normal e "maskable") gerados por código — mesma marca do
 * header/favicon. `?maskable=1` desenha com margem de segurança maior, já que Android recorta
 * ícones maskable num círculo e cortaria as pontas do pino/carro sem essa folga.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dimension = Number(size) || 512;
  const maskable = request.nextUrl.searchParams.get('maskable') === '1';
  const logoSize = maskable ? dimension * 0.55 : dimension * 0.72;

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
          borderRadius: maskable ? 0 : dimension * 0.2,
        }}
      >
        <svg width={logoSize} height={logoSize} viewBox="0 0 24 24" fill="none">
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
    { width: dimension, height: dimension },
  );
}
