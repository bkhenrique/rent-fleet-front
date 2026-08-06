/** Ícones dos cards do painel — mesma convenção de `components/landing-icons.tsx` (viewBox 24,
 * traço 1.8, pontas arredondadas) pra manter uma única linguagem de ícone no app inteiro. */

interface IconProps {
  size?: number;
  className?: string;
}

function Icon({ paths, size = 16, className }: IconProps & { paths: string[] }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function CarIcon({ size, className }: IconProps) {
  return (
    <Icon
      size={size}
      className={className}
      paths={[
        'M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13',
        'M3 13h18v3.2a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1V16H6.2v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
        'M7 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
        'M20 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
      ]}
    />
  );
}

export function KeyIcon({ size, className }: IconProps) {
  return (
    <Icon
      size={size}
      className={className}
      paths={['M8 15.5a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5z', 'M10.3 13 19 4.3', 'M15.5 7.8 18 5.3']}
    />
  );
}

export function WrenchIcon({ size, className }: IconProps) {
  return (
    <Icon
      size={size}
      className={className}
      paths={['M14.7 6.3a4 4 0 0 0-5.35 4.7L4 16.3l3.7 3.7 5.3-5.35a4 4 0 0 0 4.7-5.35l-2.65 2.65-2-2z']}
    />
  );
}

export function AlertTriangleIcon({ size, className }: IconProps) {
  return <Icon size={size} className={className} paths={['M12 4 21 19H3z', 'M12 10.2v3.3', 'M12 16.7h.01']} />;
}
