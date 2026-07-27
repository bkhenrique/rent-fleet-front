import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTranslations } from 'next-intl/server';
import { BRAND_MARK_PATHS } from '@/lib/brand-mark';

export const alt = 'RentFleet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Thumbnail exibido em compartilhamentos (WhatsApp, Slack, X, etc) — um por locale, com o headline traduzido. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  const [interRegular, interBold] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/Inter-Regular.woff')),
    readFile(join(process.cwd(), 'assets/fonts/Inter-Bold.woff')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#08090b',
          backgroundImage:
            'radial-gradient(ellipse 900px 500px at 78% 15%, rgba(255,176,32,0.35), transparent 70%)',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #FFB020, #FF8A1F)',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
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
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#f2f3f5', letterSpacing: -1 }}>
            RentFleet
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 66, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, color: '#f2f3f5' }}>
            <span>{t('hero.titleLine1')}</span>
            <span style={{ color: '#FFC24D' }}>{t('hero.titleLine2')}</span>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#939ba6', maxWidth: 820, lineHeight: 1.4 }}>
            {t('hero.subtitle')}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 20, color: '#616a75', letterSpacing: 2, textTransform: 'uppercase' }}>
          PT · EN · ES
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interRegular, style: 'normal', weight: 400 },
        { name: 'Inter', data: interBold, style: 'normal', weight: 700 },
      ],
    },
  );
}
