'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { RequireRole } from '@/components/require-role';
import { TENANT_ADMIN_ONLY } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { updateTenantSettingsCache } from '@/lib/use-tenant-settings';
import type { Tenant, UpdateTenantProfilePayload } from '@/lib/types/tenant';

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const INPUT_CLASS = `rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent ${FOCUS_RING}`;

/**
 * Self-service da locadora sobre os próprios dados cadastrais (bloco 44 do MELHORIAS5.md) —
 * `PATCH /tenants/me/profile`, restrito a nome/endereço/telefone/e-mail/idioma padrão. `documento`
 * (CNPJ/NIF/EIN), `status` e `billing` continuam editáveis só pelo Super Admin (ver
 * `UpdateTenantProfileDto` no backend pra explicação de por que esse recorte).
 */
function ProfileForm() {
  const t = useTranslations('account.profile');
  const apiClient = useApiClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [nome, setNome] = useState('');
  const [enderecoFiscal, setEnderecoFiscal] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiClient<Tenant>('/tenants/me')
      .then((found) => {
        setTenant(found);
        setNome(found.nome);
        setEnderecoFiscal(found.enderecoFiscal ?? '');
        setTelefone(found.telefone ?? '');
        setEmail(found.email ?? '');
      })
      .catch(() => setLoadError(true));
  }, [apiClient]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccess(false);
    setSaving(true);

    const payload: UpdateTenantProfilePayload = {
      nome,
      enderecoFiscal: enderecoFiscal || undefined,
      telefone: telefone || undefined,
      email: email || undefined,
    };

    try {
      const updated = await apiClient<Tenant>('/tenants/me/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setTenant(updated);
      updateTenantSettingsCache({ nome: updated.nome });
      setSuccess(true);
    } catch {
      setFormError(t('genericError'));
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <p className="text-sm text-danger">{t('loadError')}</p>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl tracking-tight">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('nome')}</span>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={INPUT_CLASS} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('documento')}</span>
          <input
            disabled
            value={tenant.documento}
            className={`${INPUT_CLASS} cursor-not-allowed text-foreground-faint`}
          />
          <span className="text-xs text-foreground-faint">{t('documentoNotice')}</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('enderecoFiscal')}</span>
          <input value={enderecoFiscal} onChange={(e) => setEnderecoFiscal(e.target.value)} className={INPUT_CLASS} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('telefone')}</span>
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={INPUT_CLASS} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('email')}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} />
        </label>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
        {success && <p className="text-sm text-success">{t('success')}</p>}

        <button
          type="submit"
          disabled={saving}
          className={`self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 ${FOCUS_RING}`}
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireRole roles={TENANT_ADMIN_ONLY}>
      <ProfileForm />
    </RequireRole>
  );
}
