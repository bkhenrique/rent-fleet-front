'use client';

import { Suspense, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { formatCurrency } from '@/lib/currency';
import { ASSINATURA_COLORS, CONTRACT_STATUS_COLORS } from '@/lib/rental-contract-status';
import type { RentalContract, RentalContractStatus } from '@/lib/types/rental-contract';

const STATUS_FILTERS: Array<RentalContractStatus | 'todos'> = ['todos', 'ativo', 'finalizado'];
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function daysRemaining(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function RentalContractsList() {
  const t = useTranslations('rentalContracts');
  const locale = useLocale();
  const apiClient = useApiClient();
  const tenantSettings = useTenantSettings();
  const searchParams = useSearchParams();

  const vehicleId = searchParams.get('vehicleId');
  const customerId = searchParams.get('customerId');

  const [contracts, setContracts] = useState<RentalContract[] | null>(null);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<RentalContractStatus | 'todos'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== 'todos') params.set('status', status);
    if (dataInicio) params.set('dataInicio', dataInicio);
    if (dataFim) params.set('dataFim', dataFim);
    if (vehicleId) params.set('vehicleId', vehicleId);
    if (customerId) params.set('customerId', customerId);

    const query = params.toString();
    apiClient<RentalContract[]>(`/rental-contracts${query ? `?${query}` : ''}`)
      .then(setContracts)
      .catch(() => setError(true));
  }, [apiClient, status, dataInicio, dataFim, vehicleId, customerId]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tight">{t('title')}</h1>
        <Link
          href="/rental-contracts/new"
          className={`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 ${FOCUS_RING}`}
        >
          {t('newContract')}
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${FOCUS_RING} ${
                status === option ? 'bg-accent text-accent-foreground' : 'text-foreground-dim hover:bg-surface-2'
              }`}
            >
              {t(`statusFilter.${option}`)}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground-dim">
          {t('filters.dataInicio')}
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className={`rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent ${FOCUS_RING}`}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground-dim">
          {t('filters.dataFim')}
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className={`rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent ${FOCUS_RING}`}
          />
        </label>
      </div>

      {error && <p className="text-sm text-danger">{t('loadError')}</p>}
      {contracts && contracts.length === 0 && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {contracts && contracts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('table.dataInicio')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.dataFim')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.veiculo')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.cliente')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.valor')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.status')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.assinatura')}</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => {
                const dias = daysRemaining(contract.dataFim);
                const isLate = contract.status === 'ativo' && dias < 0;
                const isDueSoon = contract.status === 'ativo' && dias >= 0 && dias <= 5;
                return (
                  <tr key={contract.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                    <td className="py-2.5 pr-4 pl-4">
                      <Link
                        href={`/rental-contracts/${contract.id}`}
                        className={`rounded-xs font-mono hover:underline ${FOCUS_RING}`}
                      >
                        {new Date(contract.dataInicio).toLocaleDateString(locale)}
                      </Link>
                    </td>
                    <td
                      className={`py-2.5 pr-4 font-mono ${
                        isLate ? 'font-medium text-danger' : isDueSoon ? 'font-medium text-warning' : 'text-foreground-dim'
                      }`}
                    >
                      {new Date(contract.dataFim).toLocaleDateString(locale)}
                    </td>
                    <td className="py-2.5 pr-4">
                      {contract.veiculo ? (
                        <>
                          <span className="font-mono font-medium tracking-wide">{contract.veiculo.placa}</span>{' '}
                          <span className="text-foreground-dim">
                            ({contract.veiculo.marca} {contract.veiculo.modelo})
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 pr-4">{contract.clienteNome ?? '—'}</td>
                    <td className="py-2.5 pr-4 font-mono">
                      {tenantSettings ? formatCurrency(contract.valor, tenantSettings.moeda) : contract.valor}
                    </td>
                    <td className={`py-2.5 pr-4 font-medium ${CONTRACT_STATUS_COLORS[contract.status]}`}>
                      {t(`status.${contract.status}`)}
                    </td>
                    <td className={`py-2.5 pr-4 font-medium ${ASSINATURA_COLORS[contract.assinaturaDigital.status]}`}>
                      {t(`detail.assinaturaDigital.statusLabel.${contract.assinaturaDigital.status}`)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function RentalContractsPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <Suspense fallback={null}>
        <RentalContractsList />
      </Suspense>
    </RequireRole>
  );
}
