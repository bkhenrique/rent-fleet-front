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
import type { RentalContract, RentalContractStatus } from '@/lib/types/rental-contract';

const STATUS_FILTERS: Array<RentalContractStatus | 'todos'> = ['todos', 'ativo', 'finalizado'];

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Link href="/rental-contracts/new" className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
          {t('newContract')}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                status === option ? 'bg-foreground text-background' : 'text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              {t(`statusFilter.${option}`)}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground/70">
          {t('filters.dataInicio')}
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/25"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground/70">
          {t('filters.dataFim')}
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/25"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
      {contracts && contracts.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {contracts && contracts.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">{t('table.dataInicio')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.dataFim')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.veiculo')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.cliente')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.valor')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => {
              const dias = daysRemaining(contract.dataFim);
              const isLate = contract.status === 'ativo' && dias < 0;
              const isDueSoon = contract.status === 'ativo' && dias >= 0 && dias <= 5;
              return (
                <tr key={contract.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">
                    <Link href={`/rental-contracts/${contract.id}`} className="underline">
                      {new Date(contract.dataInicio).toLocaleDateString(locale)}
                    </Link>
                  </td>
                  <td
                    className={`py-2 pr-4 ${
                      isLate
                        ? 'font-medium text-red-700 dark:text-red-400'
                        : isDueSoon
                          ? 'font-medium text-amber-700 dark:text-amber-400'
                          : ''
                    }`}
                  >
                    {new Date(contract.dataFim).toLocaleDateString(locale)}
                  </td>
                  <td className="py-2 pr-4">
                    {contract.veiculo ? (
                      <>
                        <span className="font-medium">{contract.veiculo.placa}</span>{' '}
                        <span className="text-foreground/60">
                          ({contract.veiculo.marca} {contract.veiculo.modelo})
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2 pr-4">{contract.clienteNome ?? '—'}</td>
                  <td className="py-2 pr-4">
                    {tenantSettings ? formatCurrency(contract.valor, tenantSettings.moeda) : contract.valor}
                  </td>
                  <td className="py-2 pr-4">{t(`status.${contract.status}`)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
