'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { DocumentsSection } from '@/components/customers/documents-section';
import type { Customer, UpdateCustomerPayload } from '@/lib/types/customer';

function CustomerDetail({ id }: { id: string }) {
  const t = useTranslations('customers');
  const apiClient = useApiClient();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [cnh, setCnh] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadCustomer() {
    apiClient<Customer>(`/customers/${id}`)
      .then((found) => {
        setCustomer(found);
        setNome(found.nome);
        setDocumento(found.documento);
        setCnh(found.cnh ?? '');
        setTelefone(found.telefone ?? '');
        setEmail(found.email ?? '');
      })
      .catch(() => setLoadError(true));
  }

  useEffect(loadCustomer, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload: UpdateCustomerPayload = {
      nome,
      documento,
      cnh: cnh || undefined,
      telefone: telefone || undefined,
      email: email || undefined,
    };

    try {
      const updated = await apiClient<Customer>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setCustomer(updated);
    } catch {
      setFormError(t('form.genericError'));
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>
        <Link href="/customers" className="mt-4 inline-block text-sm underline">
          {t('backToList')}
        </Link>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/customers" className="text-sm underline">
          {t('backToList')}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{customer.nome}</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.nome')}</span>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.documento')}</span>
          <input
            required
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.cnh')}</span>
          <input
            value={cnh}
            onChange={(e) => setCnh(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.telefone')}</span>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>

        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {saving ? t('form.saving') : t('form.save')}
        </button>
      </form>

      <DocumentsSection
        customerId={customer.id}
        fotosDocumentoUrls={customer.fotosDocumentoUrls}
        onDocumentAdded={loadCustomer}
      />
    </div>
  );
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={TENANT_ROLES}>
      <CustomerDetail id={id} />
    </RequireRole>
  );
}
