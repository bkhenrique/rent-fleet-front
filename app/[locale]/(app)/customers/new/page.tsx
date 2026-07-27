'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { TENANT_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import type { Customer, CreateCustomerPayload, DocumentType } from '@/lib/types/customer';

const DOCUMENT_TYPE_OPTIONS: DocumentType[] = ['cnh_br', 'dni_nie_es', 'passport', 'driver_license_us', 'other'];

/** Categoria (A/B/AB etc.) só faz sentido pra documentos que incluem carteira/carné de habilitação. */
const DOCUMENT_TYPES_WITH_CATEGORIA: DocumentType[] = ['cnh_br', 'dni_nie_es', 'driver_license_us'];

function NewCustomerForm() {
  const t = useTranslations('customers');
  const router = useRouter();
  const apiClient = useApiClient();

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType>('cnh_br');
  const [endereco, setEndereco] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cnhNumero, setCnhNumero] = useState('');
  const [cnhCategoria, setCnhCategoria] = useState('');
  const [cnhValidade, setCnhValidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showCategoria = DOCUMENT_TYPES_WITH_CATEGORIA.includes(tipoDocumento);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateCustomerPayload = {
      nome,
      documento,
      tipoDocumento,
      endereco: endereco || undefined,
      dataNascimento: dataNascimento || undefined,
      cnh: {
        numero: cnhNumero || undefined,
        categoria: showCategoria ? cnhCategoria || undefined : undefined,
        validade: cnhValidade || undefined,
      },
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
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.documento')}</span>
          <input
            required
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.endereco')}</span>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.dataNascimento')}</span>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.tipoDocumento')}</span>
          <select
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value as DocumentType)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`tipoDocumentoOptions.${option}`)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-4 rounded border border-black/10 p-4 dark:border-white/15">
          <legend className="px-1 text-sm font-medium">{t('form.cnhSectionTitle')}</legend>
          <div className={`grid gap-3 ${showCategoria ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('form.cnhNumero')}</span>
              <input
                value={cnhNumero}
                onChange={(e) => setCnhNumero(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
            {showCategoria && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">{t('form.cnhCategoria')}</span>
                <input
                  value={cnhCategoria}
                  onChange={(e) => setCnhCategoria(e.target.value)}
                  className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
                />
              </label>
            )}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">{t('form.cnhValidade')}</span>
              <input
                type="date"
                value={cnhValidade}
                onChange={(e) => setCnhValidade(e.target.value)}
                className="rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
              />
            </label>
          </div>
        </fieldset>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.telefone')}</span>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t('form.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
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
