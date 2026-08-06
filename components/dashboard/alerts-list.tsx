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
  return `font-mono text-xs ${vencido ? 'font-medium text-danger' : 'text-warning'}`;
}

/** Vencido ganha um fundo tingido de verdade, não só texto vermelho — precisa ser a linha que salta
 * aos olhos primeiro numa lista longa, não algo que só se nota lendo palavra por palavra. */
function rowClassName(vencido: boolean): string {
  return `rounded-md px-2 py-2 transition-colors ${vencido ? 'bg-danger/10 hover:bg-danger/15' : 'hover:bg-surface-2'}`;
}

const FOCUS_RING = 'rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
/** Placa é literalmente um código alfanumérico — mono não é decoração aqui, é o registro correto
 * pra esse tipo de dado (mesma lógica de por que um número de série ou timestamp usa mono). */
const PLATE_CLASS = 'font-mono font-medium tracking-wide hover:underline';

export function AlertsList({ vehicleAlerts, contractAlerts, vehiclesById, customersById }: AlertsListProps) {
  const t = useTranslations('dashboard.alerts');
  // Reaproveita os labels dos cards de overview ("Alertas de veículos" / "Contratos vencendo") como
  // título das duas subseções abaixo — mesmo texto, sem duplicar chave de tradução.
  const tOverview = useTranslations('dashboard.overview');
  const locale = useLocale();

  const hasAlerts = vehicleAlerts.length > 0 || contractAlerts.length > 0;

  // Um veículo já vem com todos os seus alertas agrupados na mesma entrada (`VehicleWithAlerts`) —
  // só falta ordenar os grupos pelo mais urgente primeiro (ver bloco 35 do MELHORIAS3.md).
  const sortedVehicleAlerts = vehicleAlerts
    .slice()
    .sort((a, b) => mostUrgentAlert(a.alerts).diasRestantes - mostUrgentAlert(b.alerts).diasRestantes);

  return (
    <div id="alerts" className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold">{t('title')}</h2>

      {!hasAlerts && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {hasAlerts && (
        <div className="flex flex-col gap-5">
          {sortedVehicleAlerts.length > 0 && (
            <div id="alerts-veiculos">
              <h3 className="mb-2 text-xs font-medium tracking-wide text-foreground-faint uppercase">
                {tOverview('alertasVeiculos')} ({sortedVehicleAlerts.length})
              </h3>
              <ul className="flex flex-col gap-1">
                {sortedVehicleAlerts.map(({ vehicle, alerts }) => {
                  const urgent = mostUrgentAlert(alerts);
                  return (
                    <li key={vehicle._id} className={rowClassName(urgent.vencido)}>
                      <div className="flex items-center gap-2.5 text-sm">
                        <VehicleThumbnail fotos={vehicle.fotos} alt={vehicle.placa} className="h-8 w-8" />
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <span>
                            <Link href={`/vehicles/${vehicle._id}?tab=documentos`} className={`${PLATE_CLASS} ${FOCUS_RING}`}>
                              {vehicle.placa}
                            </Link>{' '}
                            <span className="text-foreground-dim">— {t('pendencias', { count: alerts.length })}</span>
                          </span>
                          <span className={urgencyClassName(urgent.vencido)}>
                            {urgent.vencido ? t('vencido') : t('venceEm', { dias: urgent.diasRestantes })}
                          </span>
                        </div>
                      </div>

                      <details className="mt-1 ml-10.5">
                        <summary className={`cursor-pointer text-xs text-foreground-faint select-none ${FOCUS_RING}`}>
                          {t('detalhes')}
                        </summary>
                        <ul className="mt-1 flex flex-col gap-1 border-l border-border pl-3">
                          {alerts.map((alert) => (
                            <li key={alert.item} className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-foreground-dim">
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
              </ul>
            </div>
          )}

          {contractAlerts.length > 0 && (
            <div id="alerts-contratos">
              <h3 className="mb-2 text-xs font-medium tracking-wide text-foreground-faint uppercase">
                {tOverview('alertasContratos')} ({contractAlerts.length})
              </h3>
              <ul className="flex flex-col gap-1">
                {contractAlerts.map(({ contract, alert }) => {
                  const vehicle = vehiclesById[contract.vehicleId];
                  const customer = customersById[contract.customerId];
                  return (
                    <li key={contract.id} className={`flex items-center gap-2.5 text-sm ${rowClassName(alert.atrasado)}`}>
                      <VehicleThumbnail
                        fotos={vehicle?.fotos ?? []}
                        alt={vehicle ? vehicle.placa : contract.vehicleId}
                        className="h-8 w-8"
                      />
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span>
                          {vehicle ? (
                            <Link href={`/vehicles/${contract.vehicleId}`} className={`${PLATE_CLASS} ${FOCUS_RING}`}>
                              {vehicle.placa}
                            </Link>
                          ) : (
                            <span className="font-mono font-medium">{contract.vehicleId}</span>
                          )}{' '}
                          <span className="text-foreground-dim">
                            — {customer ? customer.nome : contract.customerId} ({t('devolucao')}{' '}
                            {new Date(contract.dataFim).toLocaleDateString(locale)})
                          </span>
                          {' · '}
                          <Link href={`/rental-contracts/${contract.id}`} className={`text-xs text-accent-strong underline ${FOCUS_RING}`}>
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
          )}
        </div>
      )}
    </div>
  );
}
