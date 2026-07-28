'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { SUPER_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { formatCurrency } from '@/lib/currency';
import type { Currency, PaymentsReportEntry, Tenant, TenantStatus } from '@/lib/types/tenant';

const STATUS_COLORS: Record<TenantStatus, string> = {
  ativo: 'text-green-700 dark:text-green-400',
  inadimplente: 'text-red-700 dark:text-red-400',
  suspenso: 'text-red-700 dark:text-red-400',
  cortesia: 'text-blue-700 dark:text-blue-400',
};

function AdminTenantsList() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const apiClient = useApiClient();

  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState(false);

  const [currentMonthEntry, setCurrentMonthEntry] = useState<PaymentsReportEntry | null | undefined>(undefined);
  const [monthlyReport, setMonthlyReport] = useState<PaymentsReportEntry[] | null>(null);
  const [reportError, setReportError] = useState(false);

  useEffect(() => {
    apiClient<Tenant[]>('/tenants')
      .then(setTenants)
      .catch(() => setError(true));
  }, [apiClient]);

  useEffect(() => {
    apiClient<PaymentsReportEntry[]>('/tenants/payments-report?meses=1')
      .then((entries) => setCurrentMonthEntry(entries[0] ?? null))
      .catch(() => setCurrentMonthEntry(null));
  }, [apiClient]);

  useEffect(() => {
    apiClient<PaymentsReportEntry[]>('/tenants/payments-report?meses=12')
      .then(setMonthlyReport)
      .catch(() => setReportError(true));
  }, [apiClient]);

  const counts = {
    total: tenants?.length ?? 0,
    ativo: tenants?.filter((tenant) => tenant.status === 'ativo').length ?? 0,
    inadimplente: tenants?.filter((tenant) => tenant.status === 'inadimplente').length ?? 0,
    suspenso: tenants?.filter((tenant) => tenant.status === 'suspenso').length ?? 0,
    cortesia: tenants?.filter((tenant) => tenant.status === 'cortesia').length ?? 0,
    totalVeiculos: tenants?.reduce((sum, tenant) => sum + tenant.totalVeiculos, 0) ?? 0,
  };

  const mrrByCurrency = (tenants ?? []).reduce<Partial<Record<Currency, number>>>((acc, tenant) => {
    if (tenant.status !== 'ativo' || tenant.billing.valor === null) return acc;
    const mensal = tenant.billing.ciclo === 'anual' ? tenant.billing.valor / 12 : tenant.billing.valor;
    acc[tenant.moeda] = (acc[tenant.moeda] ?? 0) + mensal;
    return acc;
  }, {});
  const mrrEntries = Object.entries(mrrByCurrency) as [Currency, number][];

  /** Junta valores por moeda no mesmo padrão visual usado pelo card de MRR (" · " entre moedas). */
  function formatByCurrency(porMoeda: Record<string, number>): string {
    const entries = Object.entries(porMoeda) as [Currency, number][];
    if (entries.length === 0) return '—';
    return entries.map(([currency, total]) => formatCurrency(total, currency)).join(' · ');
  }

  function formatMonthLabel(mes: string): string {
    const [ano, mesNumero] = mes.split('-').map(Number);
    const date = new Date(ano, mesNumero - 1, 1);
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
  }

  const currentMonthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Link href="/admin/new" className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
          {t('newTenant')}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {(['total', 'ativo', 'inadimplente', 'suspenso', 'cortesia', 'totalVeiculos'] as const).map((key) => (
          <div key={key} className="rounded border border-black/10 px-4 py-3 dark:border-white/15">
            <p className="text-2xl font-semibold">{counts[key]}</p>
            <p className="text-xs text-foreground/60">
              {key === 'total' || key === 'totalVeiculos' ? t(`overview.${key}`) : t(`status.${key}`)}
            </p>
          </div>
        ))}

        <div className="rounded border border-black/10 px-4 py-3 dark:border-white/15">
          {mrrEntries.length > 0 ? (
            <p className="text-lg font-semibold">
              {mrrEntries.map(([currency, total]) => formatCurrency(total, currency)).join(' · ')}
            </p>
          ) : (
            <p className="text-lg font-semibold">—</p>
          )}
          <p className="text-xs text-foreground/60">{t('overview.mrr')}</p>
        </div>

        <div className="rounded border border-black/10 px-4 py-3 dark:border-white/15">
          <p className="text-lg font-semibold">
            {currentMonthEntry === undefined ? '—' : formatByCurrency(currentMonthEntry?.porMoeda ?? {})}
          </p>
          <p className="text-xs text-foreground/60">{t('overview.receivedInMonth', { month: currentMonthLabel })}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">{t('overview.monthlyReportTitle')}</h2>
        {reportError && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
        {monthlyReport && monthlyReport.length === 0 && (
          <p className="text-sm text-foreground/60">{t('overview.monthlyReportEmpty')}</p>
        )}
        {monthlyReport && monthlyReport.length > 0 && (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/15">
                <th className="py-2 pr-4 font-medium">{t('overview.monthlyReportMonth')}</th>
                <th className="py-2 pr-4 font-medium">{t('overview.monthlyReportTotal')}</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReport.map((entry) => (
                <tr key={entry.mes} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 capitalize">{formatMonthLabel(entry.mes)}</td>
                  <td className="py-2 pr-4">{formatByCurrency(entry.porMoeda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
      {tenants && tenants.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {tenants && tenants.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">{t('table.nome')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.documento')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.status')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.ciclo')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.valor')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.ativoAte')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.veiculos')}</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant._id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4">
                  <Link href={`/admin/${tenant._id}`} className="underline">
                    {tenant.nome}
                  </Link>
                </td>
                <td className="py-2 pr-4">{tenant.documento}</td>
                <td className={`py-2 pr-4 font-medium ${STATUS_COLORS[tenant.status]}`}>
                  {t(`status.${tenant.status}`)}
                </td>
                <td className="py-2 pr-4">{t(`ciclo.${tenant.billing.ciclo}`)}</td>
                <td className="py-2 pr-4">
                  {tenant.billing.valor === null ? '—' : formatCurrency(tenant.billing.valor, tenant.moeda)}
                </td>
                <td className="py-2 pr-4">{new Date(tenant.billing.ativoAte).toLocaleDateString(locale)}</td>
                <td className="py-2 pr-4">{tenant.totalVeiculos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminTenantsPage() {
  return (
    <RequireRole roles={SUPER_ADMIN_ONLY}>
      <AdminTenantsList />
    </RequireRole>
  );
}
