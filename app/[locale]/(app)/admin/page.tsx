'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { SUPER_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import type { Tenant, TenantStatus } from '@/lib/types/tenant';

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

  useEffect(() => {
    apiClient<Tenant[]>('/tenants')
      .then(setTenants)
      .catch(() => setError(true));
  }, [apiClient]);

  const counts = {
    total: tenants?.length ?? 0,
    ativo: tenants?.filter((tenant) => tenant.status === 'ativo').length ?? 0,
    inadimplente: tenants?.filter((tenant) => tenant.status === 'inadimplente').length ?? 0,
    suspenso: tenants?.filter((tenant) => tenant.status === 'suspenso').length ?? 0,
    cortesia: tenants?.filter((tenant) => tenant.status === 'cortesia').length ?? 0,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Link href="/admin/new" className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background">
          {t('newTenant')}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(['total', 'ativo', 'inadimplente', 'suspenso', 'cortesia'] as const).map((key) => (
          <div key={key} className="rounded border border-black/10 px-4 py-3 dark:border-white/15">
            <p className="text-2xl font-semibold">{counts[key]}</p>
            <p className="text-xs text-foreground/60">{key === 'total' ? t('overview.total') : t(`status.${key}`)}</p>
          </div>
        ))}
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
              <th className="py-2 pr-4 font-medium">{t('table.ativoAte')}</th>
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
                <td className="py-2 pr-4">{new Date(tenant.billing.ativoAte).toLocaleDateString(locale)}</td>
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
