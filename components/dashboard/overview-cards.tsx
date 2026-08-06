import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CarIcon, KeyIcon, WrenchIcon, AlertTriangleIcon } from '@/components/dashboard/dashboard-icons';
import { CheckIcon } from '@/components/landing-icons';
import type { Vehicle } from '@/lib/types/vehicle';

interface OverviewCardsProps {
  vehicles: Vehicle[];
  vehicleAlertCount: number;
  contractAlertCount: number;
}

type Tone = 'neutral' | 'success' | 'info' | 'warning';

/** Cor do número — mesma paleta de `STATUS_COLORS` (`lib/vehicle-status.ts`) e da lista de alertas,
 * pra "âmbar"/"verde" significarem a mesma coisa em toda a página do painel. `neutral` fica sem cor
 * de propósito: uma célula sem nada pra sinalizar (frota total, zero alertas) não deve competir
 * visualmente com uma que precisa de atenção. */
const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-foreground',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
};

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export function OverviewCards({ vehicles, vehicleAlertCount, contractAlertCount }: OverviewCardsProps) {
  const t = useTranslations('dashboard.overview');

  const counts = {
    total: vehicles.length,
    disponivel: vehicles.filter((v) => v.status === 'disponivel').length,
    alugado: vehicles.filter((v) => v.status === 'alugado').length,
    manutencao: vehicles.filter((v) => v.status === 'manutencao').length,
  };

  // Cada célula leva pra onde o número dela pode ser explicado: as 4 de status filtram `/vehicles`
  // (mesmo `?status=` que os pills dessa página já leem via `useSearchParams`); as 2 de alerta pulam
  // pra subseção correspondente em `AlertsList`, que fica na mesma página logo abaixo.
  const cells: Array<{ key: string; value: number; tone: Tone; href: string; Icon: typeof CarIcon }> = [
    { key: 'total', value: counts.total, tone: 'neutral', href: '/vehicles', Icon: CarIcon },
    { key: 'disponivel', value: counts.disponivel, tone: 'success', href: '/vehicles?status=disponivel', Icon: CheckIcon },
    { key: 'alugado', value: counts.alugado, tone: 'info', href: '/vehicles?status=alugado', Icon: KeyIcon },
    { key: 'manutencao', value: counts.manutencao, tone: 'warning', href: '/vehicles?status=manutencao', Icon: WrenchIcon },
    {
      key: 'alertasVeiculos',
      value: vehicleAlertCount,
      tone: vehicleAlertCount > 0 ? 'warning' : 'neutral',
      href: '#alerts-veiculos',
      Icon: AlertTriangleIcon,
    },
    {
      key: 'alertasContratos',
      value: contractAlertCount,
      tone: contractAlertCount > 0 ? 'warning' : 'neutral',
      href: '#alerts-contratos',
      Icon: AlertTriangleIcon,
    },
  ];

  return (
    // Uma única régua de instrumentos em vez de 6 cards separados — cada célula divide a borda com
    // a vizinha (como um painel físico), não flutua como uma caixa própria. Ícone monocromático
    // discreto (não um badge colorido): a cor do número já carrega o sinal de status, o ícone só
    // ajuda a escanear qual célula é qual.
    <div className="grid grid-cols-2 divide-x divide-y divide-border rounded-lg border border-border bg-surface sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
      {cells.map(({ Icon, ...cell }) => (
        <Link
          key={cell.key}
          href={cell.href}
          className={`group flex flex-col gap-3 px-5 py-5 transition-colors hover:bg-surface-2 ${FOCUS_RING}`}
        >
          <Icon size={16} className="text-foreground-faint transition-colors group-hover:text-foreground-dim" />
          <div className="min-w-0">
            <p className={`font-mono text-4xl leading-none font-medium tracking-tight ${TONE_TEXT[cell.tone]}`}>
              {cell.value}
            </p>
            <p className="mt-2 truncate text-xs text-foreground-dim">{t(cell.key)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
