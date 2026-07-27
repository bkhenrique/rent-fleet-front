/**
 * Placeholder genérico de carregamento — bloco com animação de pulso (Tailwind nativo, sem lib
 * extra). Reaproveitável em qualquer lugar que precise de skeleton (ex: miniatura de veículo sem
 * foto ainda, ver `components/vehicles/vehicle-thumbnail.tsx`).
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-foreground/10 ${className}`} />;
}
