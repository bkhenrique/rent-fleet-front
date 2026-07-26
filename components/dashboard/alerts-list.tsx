import { useTranslations, useLocale } from 'next-intl';
import type { VehicleWithAlerts } from '@/lib/types/vehicle';
import type { RentalContractWithAlert } from '@/lib/types/rental-contract';
import type { Customer } from '@/lib/types/customer';

interface AlertsListProps {
  vehicleAlerts: VehicleWithAlerts[];
  contractAlerts: RentalContractWithAlert[];
  vehiclesById: Record<string, { placa: string; marca: string; modelo: string }>;
  customersById: Record<string, Customer>;
}

export function AlertsList({ vehicleAlerts, contractAlerts, vehiclesById, customersById }: AlertsListProps) {
  const t = useTranslations('dashboard.alerts');
  const locale = useLocale();

  const hasAlerts = vehicleAlerts.length > 0 || contractAlerts.length > 0;

  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/10">
      <h2 className="mb-3 text-sm font-semibold">{t('title')}</h2>

      {!hasAlerts && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      <ul className="flex flex-col gap-2">
        {vehicleAlerts.flatMap(({ vehicle, alerts }) =>
          alerts.map((alert) => (
            <li
              key={`${vehicle._id}-${alert.item}`}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span>
                <span className="font-medium">{vehicle.placa}</span> — {t(`item.${alert.item}`)} (
                {new Date(alert.validade).toLocaleDateString(locale)})
              </span>
              <span className={alert.vencido ? 'font-medium text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}>
                {alert.vencido ? t('vencido') : t('venceEm', { dias: alert.diasRestantes })}
              </span>
            </li>
          )),
        )}

        {contractAlerts.map(({ contract, alert }) => {
          const vehicle = vehiclesById[contract.vehicleId];
          const customer = customersById[contract.customerId];
          return (
            <li key={contract.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <span className="font-medium">{vehicle ? vehicle.placa : contract.vehicleId}</span> —{' '}
                {customer ? customer.nome : contract.customerId} ({t('devolucao')}{' '}
                {new Date(contract.dataFim).toLocaleDateString(locale)})
              </span>
              <span className={alert.atrasado ? 'font-medium text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}>
                {alert.atrasado ? t('atrasado') : t('venceEm', { dias: alert.diasRestantes })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
