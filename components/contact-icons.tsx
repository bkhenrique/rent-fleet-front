/** Ícones de contato (ligar/e-mail/WhatsApp) — mesma convenção de `components/landing-icons.tsx` e
 * `components/dashboard/dashboard-icons.tsx` (viewBox 24, traço 1.8, pontas arredondadas). */

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

export function PhoneIcon({ size, className }: IconProps) {
  return (
    <Icon
      size={size}
      className={className}
      paths={[
        'M6.5 3h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2L20.5 14v3a2 2 0 0 1-2 2.2C11.7 18.7 5.3 12.3 4.8 5.5A2 2 0 0 1 6.5 3z',
      ]}
    />
  );
}

export function MailIcon({ size, className }: IconProps) {
  return (
    <Icon
      size={size}
      className={className}
      paths={['M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'M3.5 6.5 12 13l8.5-6.5']}
    />
  );
}

/** Glifo do WhatsApp (balão de fala + fone) — não é o logo oficial pixel-a-pixel, é um desenho
 * próprio na mesma linguagem de traço dos outros ícones, só reconhecível o suficiente pro contexto
 * (link de contato), sem reproduzir a marca registrada. */
export function WhatsAppIcon({ size, className }: IconProps) {
  return (
    <Icon
      size={size}
      className={className}
      paths={[
        'M12 4a8 8 0 0 0-6.9 12l-1 3.8 3.9-1A8 8 0 1 0 12 4z',
        'M9 9.3c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5s.6 1.6.7 1.7c.1.1.1.3 0 .5-.1.2-.2.3-.3.5s-.3.3-.1.6c.2.3.8 1.2 1.7 1.9 1.1.9 1.9 1.1 2.2 1.2.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.2.3-.2.6-.1s1.6.7 1.9.9c.3.1.4.2.5.3.1.2.1.9-.2 1.4-.4.5-1.4 1-2.2 1-.7 0-2.2-.2-3.9-1.5-2.1-1.6-3.4-3.8-3.5-4.1-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.9z',
      ]}
    />
  );
}
