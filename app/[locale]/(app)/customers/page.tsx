'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { useDownloadReport } from '@/lib/use-download-report';
import { ContactActions } from '@/components/contact-actions';
import type { Customer } from '@/lib/types/customer';

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function CustomersList() {
  const t = useTranslations('customers');
  const apiClient = useApiClient();
  const downloadReport = useDownloadReport();

  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState(false);
  const [reportError, setReportError] = useState(false);

  useEffect(() => {
    apiClient<Customer[]>('/customers')
      .then(setCustomers)
      .catch(() => setError(true));
  }, [apiClient]);

  async function handleExportPdf() {
    setReportError(false);
    try {
      await downloadReport('/reports/clientes', 'clientes.pdf');
    } catch {
      setReportError(true);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tight">{t('title')}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className={`rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2 ${FOCUS_RING}`}
          >
            {t('exportPdf')}
          </button>
          <Link
            href="/customers/new"
            className={`rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 ${FOCUS_RING}`}
          >
            {t('newCustomer')}
          </Link>
        </div>
      </div>

      {reportError && <p className="text-sm text-danger">{t('exportError')}</p>}
      {error && <p className="text-sm text-danger">{t('loadError')}</p>}
      {customers && customers.length === 0 && <p className="text-sm text-foreground-dim">{t('empty')}</p>}

      {customers && customers.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 pl-4 font-medium text-foreground-dim">{t('table.nome')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.documento')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.telefone')}</th>
                <th className="py-3 pr-4 font-medium text-foreground-dim">{t('table.email')}</th>
                <th className="py-3 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-b-0 hover:bg-surface-2">
                  <td className="py-2.5 pr-4 pl-4">
                    <Link href={`/customers/${customer.id}`} className={`rounded-xs font-medium hover:underline ${FOCUS_RING}`}>
                      {customer.nome}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-foreground-dim">{customer.documento}</td>
                  <td className="py-2.5 pr-4 text-foreground-dim">{customer.telefone ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-foreground-dim">{customer.email ?? '—'}</td>
                  <td className="py-2.5 pr-4">
                    <ContactActions telefone={customer.telefone} email={customer.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
