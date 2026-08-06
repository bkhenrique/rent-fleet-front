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
  ativo: 'text-success',
  // Inadimplente ainda está operando, só atrasado no pagamento — âmbar, não vermelho, pra não
  // parecer tão grave quanto suspenso (acesso já cortado).
  inadimplente: 'text-warning',
  suspenso: 'text-danger',
  cortesia: 'text-info',
};

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

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

  // Mesma régua de instrumentos do painel (`components/dashboard/overview-cards.tsx`) — uma
  // superfície só com divisórias, não 7 caixas soltas, pra manter o mesmo padrão visual em tudo.
  const statCells: Array<{ key: string; value: string; tone: string }> = [
    { key: 'total', value: String(counts.total), tone: 'text-foreground' },
    { key: 'ativo', value: String(counts.ativo), tone: STATUS_COLORS.ativo },
    { key: 'inadimplente', value: String(counts.inadimplente), tone: STATUS_COLORS.inadimplente },
    { key: 'suspenso', value: String(counts.suspenso), tone: STATUS_COLORS.suspenso },
    { key: 'cortesia', value: String(counts.cortesia), tone: STATUS_COLORS.cortesia },
    { key: 'totalVeiculos', value: String(counts.totalVeiculos), tone: 'text-foreground' },
    {
      key: 'mrr',
      value: mrrEntries.length > 0 ? mrrEntries.map(([currency, total]) => formatCurrency(total, currency)).join(' · ') : '—',
      tone: 'text-foreground',
    },
    {
      key: 'receivedInMonth',
      value: currentMonthEntry === undefined ? '—' : formatByCurrency(currentMonthEntry?.porMoeda ?? {}),
      tone: 'text-foreground',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tight">{t('title')}</h1>
        <Link
          href="/admin/new"
          className={`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 ${FOCUS_RING}`}
        >
          {t('newTenant')}
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 divide-x divide-y divide-border rounded-lg border border-border bg-surface sm:grid-cols-4 lg:grid-cols-4 lg:divide-y-0">
        {statCells.map((cell) => (
          <div key={cell.key} className="px-5 py-4">
            <p className={`font-mono text-2xl leading-none font-medium tracking-tight ${cell.tone}`}>{cell.value}</p>
            <p className="mt-2 truncate text-xs text-foreground-dim">
              {cell.key === 'total' || cell.key === 'totalVeiculos' || cell.key === 'mrr' || cell.key === 'receivedInMonth'
                ? cell.key === 'receivedInMonth'
                  ? t('overview.receivedInMonth', { month: currentMonthLabel })
                  : t(`overview.${cell.key}`)
                : t(`status.${cell.key}`)}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">{t('overview.monthlyReportTitle')}</h2>
        {reportError && <p className="text-sm text-danger">{t('loadError')}</p>}
        {monthlyReport && monthlyReport.length === 0 && (
          <p className="text-sm text-foreground-dim">{t('overview.monthlyReportEmpty')}</p>
        )}
        {monthlyReport && monthlyReport.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('overview.monthlyReportMonth')}</th>
                  <th className="py-3 pr-4 font-medium text-foreground-dim">{t('overview.monthlyReportTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((entry) => (
                  <tr key={entry.mes} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                    <td className="py-2.5 pr-4 pl-4 capitalize">{formatMonthLabel(entry.mes)}</td>
                    <td className="py-2.5 pr-4 font-mono">{formatByCurrency(entry.porMoeda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{t('loadError')}</p>}
      {tenants && tenants.length === 0 && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {tenants && tenants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('table.nome')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.documento')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.status')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.ciclo')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.valor')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.ativoAte')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.veiculos')}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant._id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                  <td className="py-2.5 pr-4 pl-4">
                    <Link href={`/admin/${tenant._id}`} className={`rounded-xs font-medium hover:underline ${FOCUS_RING}`}>
                      {tenant.nome}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-foreground-dim">{tenant.documento}</td>
                  <td className={`py-2.5 pr-4 font-medium ${STATUS_COLORS[tenant.status]}`}>
                    {t(`status.${tenant.status}`)}
                  </td>
                  <td className="py-2.5 pr-4 text-foreground-dim">{t(`ciclo.${tenant.billing.ciclo}`)}</td>
                  <td className="py-2.5 pr-4 font-mono">
                    {tenant.billing.valor === null ? '—' : formatCurrency(tenant.billing.valor, tenant.moeda)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-foreground-dim">
                    {new Date(tenant.billing.ativoAte).toLocaleDateString(locale)}
                  </td>
                  <td className="py-2.5 pr-4 font-mono">{tenant.totalVeiculos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
