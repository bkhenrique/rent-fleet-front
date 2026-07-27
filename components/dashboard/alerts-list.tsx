import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { VehicleThumbnail } from '@/components/vehicles/vehicle-thumbnail';
import type { VehicleAlert, VehicleWithAlerts } from '@/lib/types/vehicle';
import type { RentalContractWithAlert } from '@/lib/types/rental-contract';
import type { Customer } from '@/lib/types/customer';

interface AlertsListProps {
  vehicleAlerts: VehicleWithAlerts[];
  contractAlerts: RentalContractWithAlert[];
  vehiclesById: Record<string, { placa: string; marca: string; modelo: string; fotos: string[] }>;
  customersById: Record<string, Customer>;
}

/** Alerta mais urgente de um veículo: vencido antes de "vence em N dias", e entre alertas do mesmo
 * tipo (vencidos ou não), o de menor `diasRestantes` primeiro — assume a mesma convenção de sinal já
 * usada em `rental-contracts/page.tsx` (`diasRestantes` negativo quando já venceu). */
function mostUrgentAlert(alerts: VehicleAlert[]): VehicleAlert {
  return alerts.slice().sort((a, b) => a.diasRestantes - b.diasRestantes)[0];
}

function urgencyClassName(vencido: boolean): string {
  return vencido ? 'font-medium text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400';
}

export function AlertsList({ vehicleAlerts, contractAlerts, vehiclesById, customersById }: AlertsListProps) {
  const t = useTranslations('dashboard.alerts');
  const locale = useLocale();

  const hasAlerts = vehicleAlerts.length > 0 || contractAlerts.length > 0;

  // Um veículo já vem com todos os seus alertas agrupados na mesma entrada (`VehicleWithAlerts`) —
  // só falta ordenar os grupos pelo mais urgente primeiro (ver bloco 35 do MELHORIAS3.md).
  const sortedVehicleAlerts = vehicleAlerts
    .slice()
    .sort((a, b) => mostUrgentAlert(a.alerts).diasRestantes - mostUrgentAlert(b.alerts).diasRestantes);

  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/15">
      <h2 className="mb-3 text-sm font-semibold">{t('title')}</h2>

      {!hasAlerts && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      <ul className="flex flex-col gap-2">
        {sortedVehicleAlerts.map(({ vehicle, alerts }) => {
          const urgent = mostUrgentAlert(alerts);
          return (
            <li key={vehicle._id} className="rounded border border-black/5 p-2 dark:border-white/5">
              <div className="flex items-center gap-2 text-sm">
                <VehicleThumbnail fotos={vehicle.fotos} alt={vehicle.placa} className="h-8 w-8" />
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span>
                    <Link href={`/vehicles/${vehicle._id}?tab=documentos`} className="font-medium hover:underline">
                      {vehicle.placa}
                    </Link>{' '}
                    — {t('pendencias', { count: alerts.length })}
                  </span>
                  <span className={urgencyClassName(urgent.vencido)}>
                    {urgent.vencido ? t('vencido') : t('venceEm', { dias: urgent.diasRestantes })}
                  </span>
                </div>
              </div>

              <details className="mt-1 ml-10">
                <summary className="cursor-pointer text-xs text-foreground/60 select-none">{t('detalhes')}</summary>
                <ul className="mt-1 flex flex-col gap-1 border-l border-black/10 pl-3 dark:border-white/15">
                  {alerts.map((alert) => (
                    <li key={alert.item} className="flex items-center justify-between gap-2 text-xs">
                      <span>
                        {t(`item.${alert.item}`)} ({new Date(alert.validade).toLocaleDateString(locale)})
                      </span>
                      <span className={urgencyClassName(alert.vencido)}>
                        {alert.vencido ? t('vencido') : t('venceEm', { dias: alert.diasRestantes })}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}

        {contractAlerts.map(({ contract, alert }) => {
          const vehicle = vehiclesById[contract.vehicleId];
          const customer = customersById[contract.customerId];
          return (
            <li key={contract.id} className="flex items-center gap-2 text-sm">
              <VehicleThumbnail fotos={vehicle?.fotos ?? []} alt={vehicle ? vehicle.placa : contract.vehicleId} className="h-8 w-8" />
              <div className="flex flex-1 items-center justify-between gap-2">
                <span>
                  {vehicle ? (
                    <Link href={`/vehicles/${contract.vehicleId}`} className="font-medium hover:underline">
                      {vehicle.placa}
                    </Link>
                  ) : (
                    <span className="font-medium">{contract.vehicleId}</span>
                  )}{' '}
                  — {customer ? customer.nome : contract.customerId} ({t('devolucao')}{' '}
                  {new Date(contract.dataFim).toLocaleDateString(locale)})
                  {' · '}
                  <Link href={`/rental-contracts/${contract.id}`} className="text-xs underline">
                    {t('verContrato')}
                  </Link>
                </span>
                <span className={urgencyClassName(alert.atrasado)}>
                  {alert.atrasado ? t('atrasado') : t('venceEm', { dias: alert.diasRestantes })}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
