/** Ícones da landing (`app/[locale]/page.tsx`) — path data portado do mockup em RentFleet Landing.dc.html. */

function Icon({ paths }: { paths: string[] }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function VehicleIcon() {
  return <Icon paths={['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5M9 13h6M9 17h4']} />;
}

export function TrackingIcon() {
  return (
    <Icon
      paths={[
        'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z',
        'M14.6 10a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0z',
      ]}
    />
  );
}

export function ContractIcon() {
  return (
    <Icon
      paths={['M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z', 'M9 16c2.5-1 3-6 4.5-6S15 15 17 13']}
    />
  );
}

export function DashboardIcon() {
  return <Icon paths={['M4 5h7v6H4zM13 5h7v10h-7zM4 13h7v6H4z']} />;
}

export function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

/**
 * Marca do RentFleet: silhueta de carro + pino de localização (o diferencial do produto é saber
 * onde cada carro está, não só cadastrar frota — o pino existe pra deixar isso óbvio no ícone).
 * Mesmo path usado no header/footer (`currentColor`, tamanho variável) e em `public/icon.svg`
 * (versão standalone com fundo próprio, pro favicon/PWA).
 */
export function LogoMarkIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 16.2v-3l1.3-3.3a1.8 1.8 0 0 1 1.7-1.1h6.3c.7 0 1.4.4 1.7 1.1l1.3 3.3v3"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 16.2h11.8v1.3a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-.6H6v.6a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <circle cx="6.4" cy="13.4" r="0.9" fill="currentColor" />
      <circle cx="12.6" cy="13.4" r="0.9" fill="currentColor" />
      <path
        d="M18.2 2.6a2.9 2.9 0 0 0-2.9 2.9c0 2.2 2.9 5 2.9 5s2.9-2.8 2.9-5a2.9 2.9 0 0 0-2.9-2.9zm0 4.3a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
