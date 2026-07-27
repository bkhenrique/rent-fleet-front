import { useTranslations } from 'next-intl';
import type { Vehicle } from '@/lib/types/vehicle';

interface OverviewCardsProps {
  vehicles: Vehicle[];
  vehicleAlertCount: number;
  contractAlertCount: number;
}

export function OverviewCards({ vehicles, vehicleAlertCount, contractAlertCount }: OverviewCardsProps) {
  const t = useTranslations('dashboard.overview');

  const counts = {
    total: vehicles.length,
    disponivel: vehicles.filter((v) => v.status === 'disponivel').length,
    alugado: vehicles.filter((v) => v.status === 'alugado').length,
    manutencao: vehicles.filter((v) => v.status === 'manutencao').length,
  };

  const cards = [
    { key: 'total', value: counts.total },
    { key: 'disponivel', value: counts.disponivel },
    { key: 'alugado', value: counts.alugado },
    { key: 'manutencao', value: counts.manutencao },
    { key: 'alertasVeiculos', value: vehicleAlertCount },
    { key: 'alertasContratos', value: contractAlertCount },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded border border-black/10 px-4 py-3 dark:border-white/15"
        >
          <p className="text-2xl font-semibold">{card.value}</p>
          <p className="text-xs text-foreground/60">{t(card.key)}</p>
        </div>
      ))}
    </div>
  );
}
