import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

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
          {LOGO_PATHS}
        </svg>
      </div>
    ),
    { width: dimension, height: dimension },
  );
}
