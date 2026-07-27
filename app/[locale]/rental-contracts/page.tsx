'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useTenantSettings } from '@/lib/use-tenant-settings';
import { formatCurrency } from '@/lib/currency';
import type { RentalContract } from '@/lib/types/rental-contract';

function daysRemaining(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function RentalContractsList() {
  const t = useTranslations('rentalContracts');
  const locale = useLocale();
  const apiClient = useApiClient();
  const tenantSettings = useTenantSettings();

  const [contracts, setContracts] = useState<RentalContract[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient<RentalContract[]>('/rental-contracts')
      .then(setContracts)
      .catch(() => setError(true));
  }, [apiClient]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Link href="/rental-contracts/new" className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background">
          {t('newContract')}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
      {contracts && contracts.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {contracts && contracts.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-2 pr-4 font-medium">{t('table.dataInicio')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.dataFim')}</th>
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
      <RentalContractsList />
    </RequireRole>
  );
}
