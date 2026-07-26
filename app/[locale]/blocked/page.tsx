'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useApiClient } from '@/lib/use-api-client';
import { useAuthStore } from '@/stores/auth-store';

interface TenantMe {
  nome: string;
  status: string;
  billing: { ativoAte: string };
}

/**
 * Sem link/navegação pra nenhuma outra rota do sistema enquanto bloqueado (só o layout raiz,
 * que já não tem links de navegação — só marca e seletor de idioma). Usa `GET /tenants/me`, que é
 * isento do bloqueio no backend justamente pra essa tela conseguir se buscar (ver
 * TenantAccessGuard/@SkipTenantBlockCheck no rent-fleet-back).
 */
export default function BlockedPage() {
  const t = useTranslations('blocked');
  const locale = useLocale();
  const router = useRouter();
  const apiClient = useApiClient();
  const { token, logout } = useAuthStore();

  const [tenant, setTenant] = useState<TenantMe | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient<TenantMe>('/tenants/me')
      .then(setTenant)
      .catch(() => setLoadError(true));
  }, [token, apiClient]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-red-600 dark:text-red-400">{t('title')}</h1>
      <p>{t('message')}</p>

      {tenant && (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-sm">
          <dt className="font-medium">{t('tenantLabel')}</dt>
          <dd>{tenant.nome}</dd>
          <dt className="font-medium">{t('statusLabel')}</dt>
          <dd>{tenant.status}</dd>
          <dt className="font-medium">{t('activeUntilLabel')}</dt>
          <dd>{new Date(tenant.billing.ativoAte).toLocaleDateString(locale)}</dd>
        </dl>
      )}
      {loadError && <p className="text-sm text-red-600 dark:text-red-400">{t('loadError')}</p>}

      <button type="button" onClick={handleLogout} className="mt-6 self-center text-sm underline">
        {t('logout')}
      </button>
    </div>
  );
}
