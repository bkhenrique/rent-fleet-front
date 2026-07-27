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

export function LogoMarkIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M5 17h14M6 17l1.5-5.5A2 2 0 0 1 9.4 10h5.2a2 2 0 0 1 1.9 1.5L18 17" />
      <circle cx="7.5" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
    </svg>
  );
}
