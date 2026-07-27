import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Favicon gerado por código — mesma marca (carro + pino) usada no header/footer da landing. */
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
          <path
            d="M3.5 16.2v-3l1.3-3.3a1.8 1.8 0 0 1 1.7-1.1h6.3c.7 0 1.4.4 1.7 1.1l1.3 3.3v3"
            stroke="#10120f"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M3.5 16.2h11.8v1.3a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-.6H6v.6a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9z"
            stroke="#10120f"
            strokeWidth="2.1"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="6.4" cy="13.4" r="0.9" fill="#10120f" />
          <circle cx="12.6" cy="13.4" r="0.9" fill="#10120f" />
          <path
            d="M18.2 2.6a2.9 2.9 0 0 0-2.9 2.9c0 2.2 2.9 5 2.9 5s2.9-2.8 2.9-5a2.9 2.9 0 0 0-2.9-2.9zm0 4.3a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"
            fill="#10120f"
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
