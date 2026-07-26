'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import type { Customer, CreateCustomerPayload } from '@/lib/types/customer';

function NewCustomerForm() {
  const t = useTranslations('customers');
  const router = useRouter();
  const apiClient = useApiClient();

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [cnh, setCnh] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateCustomerPayload = {
      nome,
      documento,
      cnh: cnh || undefined,
      telefone: telefone || undefined,
      email: email || undefined,
    };

    try {
      const customer = await apiClient<Customer>('/customers', { method: 'POST', body: JSON.stringify(payload) });
      router.push(`/customers/${customer.id}`);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t('form.conflictError') : t('form.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t('newCustomer')}</h1>

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

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
          >
            {isSubmitting ? t('form.saving') : t('form.create')}
          </button>
          <button type="button" onClick={() => router.push('/customers')} className="rounded px-4 py-2 text-sm underline">
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewCustomerPage() {
  return (
    <RequireRole roles={TENANT_ROLES}>
      <NewCustomerForm />
    </RequireRole>
  );
}
