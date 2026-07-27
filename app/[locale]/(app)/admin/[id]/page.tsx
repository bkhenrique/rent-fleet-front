'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireRole } from '@/components/require-role';
import { SUPER_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import type { BillingCycle, Country, Currency, Tenant, TenantStatus, UpdateTenantPayload } from '@/lib/types/tenant';

const STATUS_OPTIONS: TenantStatus[] = ['ativo', 'inadimplente', 'suspenso', 'cortesia'];
const COUNTRIES: Country[] = ['BR', 'ES', 'US'];
const CURRENCIES: Currency[] = ['BRL', 'EUR', 'USD'];

function TenantDetail({ id }: { id: string }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const apiClient = useApiClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [ciclo, setCiclo] = useState<BillingCycle>('mensal');
  const [pais, setPais] = useState<Country>('BR');
  const [moeda, setMoeda] = useState<Currency>('BRL');
  const [enderecoFiscal, setEnderecoFiscal] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<TenantStatus>('ativo');

  const [savingForm, setSavingForm] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [markPaidMessage, setMarkPaidMessage] = useState<string | null>(null);

  function loadTenant() {
    apiClient<Tenant[]>('/tenants')
      .then((tenants) => {
        const found = tenants.find((item) => item._id === id);
        if (!found) {
          setLoadError(true);
          return;
        }
        setTenant(found);
        setNome(found.nome);
        setDocumento(found.documento);
        setCiclo(found.billing.ciclo);
        setPais(found.pais);
        setMoeda(found.moeda);
        setEnderecoFiscal(found.enderecoFiscal ?? '');
        setTelefone(found.telefone ?? '');
        setEmail(found.email ?? '');
        setStatus(found.status);
      })
      .catch(() => setLoadError(true));
  }

  useEffect(loadTenant, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveForm(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSavingForm(true);
    try {
      const payload: UpdateTenantPayload = {
        nome,
        documento,
        ciclo,
        pais,
        moeda,
        enderecoFiscal: enderecoFiscal || undefined,
        telefone: telefone || undefined,
        email: email || undefined,
      };
      const updated = await apiClient<Tenant>(`/tenants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setTenant(updated);
    } catch {
      setFormError(t('form.genericError'));
    } finally {
      setSavingForm(false);
    }
  }

  async function handleSaveStatus() {
    setSavingStatus(true);
    setFormError(null);
    try {
      const updated = await apiClient<Tenant>(`/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setTenant(updated);
    } catch {
      setFormError(t('form.genericError'));
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleMarkAsPaid() {
    setMarkingPaid(true);
    setMarkPaidMessage(null);
    try {
      const updated = await apiClient<Tenant>(`/tenants/${id}/mark-paid`, { method: 'POST' });
      setTenant(updated);
      setStatus(updated.status);
      setMarkPaidMessage(t('detail.markPaidSuccess'));
    } catch {
      setFormError(t('form.genericError'));
    } finally {
      setMarkingPaid(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>
        <Link href="/admin" className="mt-4 inline-block text-sm underline">
          {t('backToList')}
        </Link>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        {t('backToList')}
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold">{tenant.nome}</h1>

      <form onSubmit={handleSaveForm} className="flex flex-col gap-4">
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
              onChange={(e) => setPais(e.target.value as Country)}
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

        <button
          type="submit"
          disabled={savingForm}
          className="self-start rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {savingForm ? t('form.saving') : t('form.save')}
        </button>
      </form>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-medium">{t('table.ativoAte')}</dt>
        <dd>{new Date(tenant.billing.ativoAte).toLocaleDateString(locale)}</dd>
        <dt className="font-medium">{t('detail.lastPayment')}</dt>
        <dd>
          {tenant.billing.ultimoPagamentoEm
            ? new Date(tenant.billing.ultimoPagamentoEm).toLocaleDateString(locale)
            : t('detail.never')}
        </dd>
      </dl>

      <button
        type="button"
        onClick={handleMarkAsPaid}
        disabled={markingPaid}
        className="mt-4 self-start rounded border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-white/25"
      >
        {markingPaid ? t('detail.markingAsPaid') : t('detail.markAsPaid')}
      </button>
      {markPaidMessage && <p className="mt-2 text-sm text-green-700 dark:text-green-400">{markPaidMessage}</p>}

      <fieldset className="mt-6 flex flex-col gap-3 rounded border border-black/10 p-4 dark:border-white/15">
        <legend className="px-1 text-sm font-medium">{t('detail.changeStatusTitle')}</legend>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TenantStatus)}
          className="rounded border border-black/15 px-3 py-2 dark:border-white/25"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(`status.${option}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSaveStatus}
          disabled={savingStatus}
          className="self-start rounded border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-white/25"
        >
          {savingStatus ? t('form.saving') : t('form.save')}
        </button>
      </fieldset>

      {formError && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      )}
    </div>
  );
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={SUPER_ADMIN_ONLY}>
      <TenantDetail id={id} />
    </RequireRole>
  );
}
