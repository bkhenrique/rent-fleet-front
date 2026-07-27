'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { SUPER_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import type { BillingCycle, Country, CreateTenantPayload, Currency, Tenant } from '@/lib/types/tenant';

const COUNTRIES: Country[] = ['BR', 'ES', 'US'];
const CURRENCIES: Currency[] = ['BRL', 'EUR', 'USD'];
const DEFAULT_CURRENCY_BY_COUNTRY: Record<Country, Currency> = { BR: 'BRL', ES: 'EUR', US: 'USD' };

function NewTenantForm() {
  const t = useTranslations('admin');
  const router = useRouter();
  const apiClient = useApiClient();

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [ciclo, setCiclo] = useState<BillingCycle>('mensal');
  const [pais, setPais] = useState<Country>('BR');
  const [moeda, setMoeda] = useState<Currency>('BRL');
  const [enderecoFiscal, setEnderecoFiscal] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePaisChange(value: Country) {
    setPais(value);
    setMoeda(DEFAULT_CURRENCY_BY_COUNTRY[value]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateTenantPayload = {
      nome,
      documento,
      ciclo,
      pais,
      moeda,
      enderecoFiscal: enderecoFiscal || undefined,
      telefone: telefone || undefined,
      email: email || undefined,
      admin: { name: adminName, email: adminEmail },
    };

    try {
      const tenant = await apiClient<Tenant>('/tenants', { method: 'POST', body: JSON.stringify(payload) });
      router.push(`/admin/${tenant._id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('form.conflictError'));
      } else {
        setError(t('form.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">{t('newTenant')}</h1>

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
          <span className="text-sm font-medium">{t('form.ciclo')}</span>
          <select
            value={ciclo}
            onChange={(e) => setCiclo(e.target.value as BillingCycle)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
          >
            <option value="mensal">{t('ciclo.mensal')}</option>
            <option value="anual">{t('ciclo.anual')}</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.pais')}</span>
            <select
              value={pais}
              onChange={(e) => handlePaisChange(e.target.value as Country)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            >
              {COUNTRIES.map((option) => (
                <option key={option} value={option}>
                  {t(`pais.${option}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.moeda')}</span>
            <select
              value={moeda}
              onChange={(e) => setMoeda(e.target.value as Currency)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            >
              {CURRENCIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="flex flex-col gap-4 rounded border border-black/10 p-4 dark:border-white/15">
          <legend className="px-1 text-sm font-medium">{t('form.fiscalSectionTitle')}</legend>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.enderecoFiscal')}</span>
            <input
              value={enderecoFiscal}
              onChange={(e) => setEnderecoFiscal(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t('form.telefone')}</span>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t('form.emailLocadora')}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded border border-black/10 p-4 dark:border-white/15">
          <legend className="px-1 text-sm font-medium">{t('form.adminSectionTitle')}</legend>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.adminName')}</span>
            <input
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('form.adminEmail')}</span>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
            />
          </label>

          <p className="text-xs text-foreground/60">{t('form.adminPasswordNotice')}</p>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-60"
          >
            {isSubmitting ? t('form.saving') : t('form.create')}
          </button>
          <button type="button" onClick={() => router.push('/admin')} className="rounded px-4 py-2 text-sm underline">
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTenantPage() {
  return (
    <RequireRole roles={SUPER_ADMIN_ONLY}>
      <NewTenantForm />
    </RequireRole>
  );
}
