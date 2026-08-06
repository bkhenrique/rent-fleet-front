'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import type { Tenant, UpdatePortfolioSettingsPayload } from '@/lib/types/tenant';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

interface SharePortfolioModalProps {
  onClose: () => void;
}

/**
 * Modal de compartilhamento do portfólio público (bloco 4 do PORTFOLIO_PUBLICO.md). Carrega o
 * tenant atual direto (não reaproveita `useTenantSettings` — aquele hook cacheia só um subconjunto
 * de campos e não inclui `portfolio`) e faz PATCH otimista a cada mudança de toggle, sempre
 * mandando o estado completo dos 3 campos (`ativo` fica implicitamente `true` uma vez ativado —
 * não existe fluxo de regenerar/desativar nessa tela, o link é único e eterno).
 */
export function SharePortfolioModal({ onClose }: SharePortfolioModalProps) {
  const t = useTranslations('vehicles.portfolio');
  const locale = useLocale();
  const apiClient = useApiClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient<Tenant>('/tenants/me')
      .then(setTenant)
      .catch(() => setLoadError(true));
  }, [apiClient]);

  async function updatePortfolio(payload: UpdatePortfolioSettingsPayload) {
    setSaving(true);
    setSaveError(false);
    try {
      const updated = await apiClient<Tenant>('/tenants/me/portfolio', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setTenant(updated);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  function handleActivate() {
    updatePortfolio({ ativo: true, mostrarValor: false, mostrarStatus: true });
  }

  function handleToggle(field: 'mostrarValor' | 'mostrarStatus') {
    if (!tenant) return;
    updatePortfolio({
      ativo: true,
      mostrarValor: tenant.portfolio.mostrarValor,
      mostrarStatus: tenant.portfolio.mostrarStatus,
      [field]: !tenant.portfolio[field],
    });
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const origin = SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const publicUrl = tenant?.portfolio.token ? `${origin}/${locale}/portfolio/${tenant.portfolio.token}` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <p className="mt-1 text-sm text-foreground-dim">{t('description')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xs text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t('close')}
          </button>
        </div>

        {!tenant && !loadError && <p className="text-sm text-foreground-dim">{t('loading')}</p>}
        {loadError && <p className="text-sm text-danger">{t('loadError')}</p>}

        {tenant && !tenant.portfolio.ativo && (
          <button
            type="button"
            disabled={saving}
            onClick={handleActivate}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {saving ? t('activating') : t('activate')}
          </button>
        )}

        {tenant && tenant.portfolio.ativo && (
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{t('mostrarValor')}</span>
              <input
                type="checkbox"
                checked={tenant.portfolio.mostrarValor}
                disabled={saving}
                onChange={() => handleToggle('mostrarValor')}
                className="h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{t('mostrarStatus')}</span>
              <input
                type="checkbox"
                checked={tenant.portfolio.mostrarStatus}
                disabled={saving}
                onChange={() => handleToggle('mostrarStatus')}
                className="h-4 w-4"
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t('linkLabel')}</span>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={publicUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(publicUrl)}
                  className="shrink-0 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
            </div>
          </div>
        )}

        {saveError && <p className="mt-3 text-sm text-danger">{t('saveError')}</p>}
      </div>
    </div>
  );
}
