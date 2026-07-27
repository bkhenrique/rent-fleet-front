import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTranslations } from 'next-intl/server';

export const alt = 'RentFleet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// next/og (Satori) não aceita React Fragment como filho ("Cannot convert a Symbol value to a
// string") — por isso é um array de elementos, não `<>...</>`.
const LOGO_PATHS = [
  <path
    key="body"
    d="M3.5 16.2v-3l1.3-3.3a1.8 1.8 0 0 1 1.7-1.1h6.3c.7 0 1.4.4 1.7 1.1l1.3 3.3v3"
    stroke="#10120f"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />,
  <path
    key="wheels-arch"
    d="M3.5 16.2h11.8v1.3a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-.6H6v.6a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9z"
    stroke="#10120f"
    strokeWidth="2.1"
    strokeLinejoin="round"
    fill="none"
  />,
  <circle key="wheel-l" cx="6.4" cy="13.4" r="0.9" fill="#10120f" />,
  <circle key="wheel-r" cx="12.6" cy="13.4" r="0.9" fill="#10120f" />,
  <path
    key="pin"
    d="M18.2 2.6a2.9 2.9 0 0 0-2.9 2.9c0 2.2 2.9 5 2.9 5s2.9-2.8 2.9-5a2.9 2.9 0 0 0-2.9-2.9zm0 4.3a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"
    fill="#10120f"
    fillRule="evenodd"
  />,
];

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
              {LOGO_PATHS}
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
