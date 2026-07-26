'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import type { Customer } from '@/lib/types/customer';

function CustomersList() {
  const t = useTranslations('customers');
  const apiClient = useApiClient();

  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient<Customer[]>('/customers')
      .then(setCustomers)
      .catch(() => setError(true));
  }, [apiClient]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Link href="/customers/new" className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background">
          {t('newCustomer')}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}
      {customers && customers.length === 0 && <p className="text-sm text-foreground/60">{t('empty')}</p>}

      {customers && customers.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-2 pr-4 font-medium">{t('table.nome')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.documento')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.telefone')}</th>
              <th className="py-2 pr-4 font-medium">{t('table.email')}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4">
                  <Link href={`/customers/${customer.id}`} className="underline">
                    {customer.nome}
                  </Link>
                </td>
                <td className="py-2 pr-4">{customer.documento}</td>
                <td className="py-2 pr-4">{customer.telefone ?? '—'}</td>
                <td className="py-2 pr-4">{customer.email ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <CustomersList />
    </RequireRole>
  );
}
