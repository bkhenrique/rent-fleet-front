/** Ícones e ilustração da landing (`app/[locale]/page.tsx`) — SVG original, sem dependência externa. */

import type { ReactNode } from 'react';

export function VehicleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M4 16V11.5L5.8 7.2C6.1 6.5 6.8 6 7.6 6h8.8c.8 0 1.5.5 1.8 1.2L20 11.5V16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16h16v2a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H7.5v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="13.2" r="1.1" fill="currentColor" />
      <circle cx="16.5" cy="13.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function TrackingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ContractIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M7 3.5h7l3.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 12h7M8.5 15h7M8.5 9h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 4 5.3 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.3-4-8.5s1.4-6.1 4-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="6" y="2.5" width="12" height="19" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 18.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M12 3.5 19 6.5V11c0 5-3 8.3-7 9.5-4-1.2-7-4.5-7-9.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DocumentAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M7 3.5h7l3.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function ClockAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12.5" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 3.5l16 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BadgeChip({
  transform,
  delay,
  color,
  children,
}: {
  transform: string;
  delay: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <g transform={transform}>
      <g className="animate-float" style={{ animationDelay: delay }}>
        <rect
          x="-22"
          y="-22"
          width="44"
          height="44"
          rx="13"
          className="fill-background stroke-black/10 dark:stroke-white/10"
          strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 6px 10px rgb(0 0 0 / 0.15))' }}
        />
        <g stroke={color} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {children}
        </g>
      </g>
    </g>
  );
}

/** Ilustração de personagem (estilo flat-illustration) pro hero — pessoa + carro + badges flutuantes. */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="animate-drift absolute -inset-10 -z-10 rounded-full bg-accent/20 blur-3xl"
      />

      <svg viewBox="0 0 480 400" className="w-full">
        <ellipse cx="240" cy="345" rx="170" ry="18" className="fill-foreground/6" />

        {/* estrada pontilhada sob o carro, sugerindo movimento */}
        <path
          d="M40 330 H 440"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-dash text-foreground/15"
        />

        {/* carro (visão lateral) */}
        <g transform="translate(150, 200)">
          <path
            d="M6 88 C -6 88 -10 76 -6 64 L 8 30 C 12 18 24 10 38 10 H 150 C 166 10 180 18 188 32 L 202 64 C 208 76 202 88 190 88 Z"
            className="fill-accent"
          />
          <path
            d="M46 10 L 60 -22 C 63 -28 69 -32 76 -32 H 138 C 146 -32 153 -28 156 -21 L 168 10 Z"
            className="fill-accent"
          />
          <path
            d="M58 6 L 68 -20 C 70 -24 74 -27 79 -27 H 134 C 139 -27 143 -24 145 -20 L 154 6 Z"
            fill="#0f172a"
            opacity="0.55"
          />
          <line x1="106" y1="-27" x2="106" y2="6" stroke="#0f172a" strokeOpacity="0.35" strokeWidth="2" />

          <circle cx="46" cy="90" r="26" fill="#111827" />
          <circle cx="46" cy="90" r="11" className="fill-foreground/70" />
          <circle cx="168" cy="90" r="26" fill="#111827" />
          <circle cx="168" cy="90" r="11" className="fill-foreground/70" />

          <circle cx="196" cy="46" r="6" fill="#fde68a" />
          <rect x="-4" y="50" width="10" height="8" rx="3" fill="#ef4444" />
        </g>

        {/* pessoa segurando um tablet com pino de mapa */}
        <g transform="translate(340, 168)">
          <path d="M-16 130 L -20 176 H -4 L 2 138 Z" fill="#1f2937" />
          <path d="M16 130 L 22 176 H 38 L 30 138 Z" fill="#1f2937" />
          <rect x="-26" y="46" width="56" height="92" rx="20" fill="#10b981" />
          <circle cx="2" cy="20" r="24" fill="#f3b28c" />
          <path d="M-20 10 C -22 -8 26 -12 24 8 C 24 -2 -18 -2 -20 10 Z" fill="#3f2d1d" />
          <g transform="translate(-52, 60) rotate(-8)">
            <rect x="-26" y="-34" width="52" height="68" rx="8" className="fill-background stroke-black/10 dark:stroke-white/15" strokeWidth="2" />
            <rect x="-18" y="-24" width="36" height="8" rx="2" className="fill-foreground/15" />
            <rect x="-18" y="-10" width="24" height="6" rx="2" className="fill-foreground/10" />
            <g transform="translate(4, 16)">
              <path d="M0 -14C-8-14-14-8-14 0c0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14Z" className="fill-accent" />
              <circle cx="0" cy="0" r="5" className="fill-background" />
            </g>
          </g>
          <path d="M-40 60 C -50 66 -54 76 -50 86" fill="none" stroke="#f3b28c" strokeWidth="10" strokeLinecap="round" />
        </g>

        <BadgeChip transform="translate(96, 130)" delay="0s" color="#10b981">
          <path d="M-9 0 L -2 8 L 10 -8" />
        </BadgeChip>
        <BadgeChip transform="translate(410, 90)" delay="0.6s" color="#f59e0b">
          <path d="M0 -9 V 1" />
          <circle cx="0" cy="7" r="0.8" fill="#f59e0b" stroke="none" />
        </BadgeChip>
        <BadgeChip transform="translate(250, 60)" delay="1.1s" color="#6366f1">
          <path d="M0 9C0 9-8-2-8-8a8 8 0 0 1 16 0c0 6-8 17-8 17Z" />
          <circle cx="0" cy="-8" r="2.6" />
        </BadgeChip>
      </svg>
    </div>
  );
}

/** Ilustração de personagem frustrado com planilha/papelada — ilustra a seção "problema". */
export function FrustrationIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="animate-drift absolute -inset-8 -z-10 rounded-full bg-red-500/10 blur-3xl"
      />

      <svg viewBox="0 0 360 320" className="w-full">
        <ellipse cx="180" cy="284" rx="120" ry="14" className="fill-foreground/6" />

        {/* mesa */}
        <rect x="60" y="220" width="240" height="12" rx="4" className="fill-foreground/15" />
        <rect x="76" y="232" width="10" height="44" className="fill-foreground/15" />
        <rect x="274" y="232" width="10" height="44" className="fill-foreground/15" />

        {/* pilha de papéis/planilha sobre a mesa */}
        <g transform="translate(150, 170) rotate(-4)">
          <rect x="-56" y="-8" width="112" height="70" rx="6" fill="#e5e7eb" />
          <rect x="-50" y="-2" width="100" height="58" rx="4" className="fill-background stroke-black/10 dark:stroke-white/15" strokeWidth="2" />
          <path d="M-40 14h80M-40 26h80M-40 38h56" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* pessoa sentada, mão na cabeça */}
        <g transform="translate(210, 214)">
          <path d="M-30 66 L -34 20 C -34 4 -22 -8 -6 -8 H 10 C 26 -8 38 4 38 20 L 34 66 Z" fill="#ef4444" />
          <circle cx="2" cy="-30" r="24" fill="#f3b28c" />
          <path d="M-22 -40 C -24 -58 28 -62 26 -42 C 26 -52 -20 -52 -22 -40 Z" fill="#3f2d1d" />
          {/* braço apoiado na cabeça, mão na testa */}
          <path d="M-20 -4 C -34 -14 -38 -30 -30 -42" fill="none" stroke="#f3b28c" strokeWidth="11" strokeLinecap="round" />
          <circle cx="-30" cy="-43" r="8" fill="#f3b28c" />
        </g>

        <BadgeChip transform="translate(70, 90)" delay="0s" color="#ef4444">
          <path d="M0 -9 V 1" />
          <circle cx="0" cy="7" r="0.8" fill="#ef4444" stroke="none" />
        </BadgeChip>
        <BadgeChip transform="translate(290, 130)" delay="0.5s" color="#ef4444">
          <path d="M0 -9 V 1" />
          <circle cx="0" cy="7" r="0.8" fill="#ef4444" stroke="none" />
        </BadgeChip>
      </svg>
    </div>
  );
}

/** Cartão "mapa da frota" que ilustra o hero — 100% SVG/CSS, sem imagem externa. */
export function FleetMapIllustration({ liveLabel }: { liveLabel: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden
        className="animate-drift absolute -inset-6 -z-10 rounded-[2rem] bg-accent/20 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-background/80 shadow-2xl shadow-black/20 backdrop-blur dark:border-white/10">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {liveLabel}
          </span>
        </div>

        <svg viewBox="0 0 400 260" className="h-64 w-full">
          <defs>
            <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path
                d="M 26 0 L 0 0 0 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-foreground/[0.06]"
              />
            </pattern>
          </defs>
          <rect width="400" height="260" fill="url(#grid)" />

          <path
            d="M20 210 C 90 210, 100 120, 170 120 S 260 60, 340 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-accent/40"
          />
          <path
            d="M20 210 C 90 210, 100 120, 170 120 S 260 60, 340 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-dash text-accent"
          />

          <circle cx="20" cy="210" r="6" className="fill-foreground/30" />
          <g transform="translate(170, 120)">
            <circle r="7" className="fill-background stroke-accent" strokeWidth="2" />
            <circle r="3" className="fill-accent" />
          </g>

          <g transform="translate(340, 50)">
            <circle r="13" className="animate-pulse-ring fill-accent/50" />
            <circle r="7" className="fill-accent" />
            <circle r="3" className="fill-background" />
          </g>
        </svg>
      </div>
    </div>
  );
}
