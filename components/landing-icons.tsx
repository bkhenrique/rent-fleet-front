/** Ícones e ilustração da landing (`app/[locale]/page.tsx`) — SVG original, sem dependência externa. */

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
