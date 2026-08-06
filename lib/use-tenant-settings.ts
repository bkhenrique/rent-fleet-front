'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useApiClient } from './use-api-client';
import type { Country, Currency, Tenant } from './types/tenant';

export interface TenantSettings {
  nome: string;
  pais: Country;
  moeda: Currency;
}

/** Cache em memória do módulo — evita rebuscar `GET /tenants/me` toda vez que uma tela monta. */
let cache: TenantSettings | null = null;
let inflight: Promise<Tenant> | null = null;
const listeners = new Set<(value: TenantSettings | null) => void>();

/** Chamado depois de um `PATCH /tenants/me/profile` bem-sucedido (ver `account/profile/page.tsx`)
 * pra header/mapa refletirem o nome novo na hora, sem precisar de reload — sem isso, o cache em
 * módulo acima ficaria com o nome antigo até a aba inteira recarregar. */
export function updateTenantSettingsCache(patch: Partial<TenantSettings>): void {
  if (!cache) return;
  cache = { ...cache, ...patch };
  listeners.forEach((listener) => listener(cache));
}

/** Só faz sentido pra papéis de locadora (tenant_admin/tenant_staff) — super_admin não tem tenant. */
export function useTenantSettings(): TenantSettings | null {
  const apiClient = useApiClient();
  const tenantId = useAuthStore((state) => state.user?.tenantId);
  const [settings, setSettings] = useState(cache);

  useEffect(() => {
    listeners.add(setSettings);
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  useEffect(() => {
    if (!tenantId || cache) return;

    inflight ??= apiClient<Tenant>('/tenants/me');
    inflight
      .then((tenant) => {
        cache = { nome: tenant.nome, pais: tenant.pais, moeda: tenant.moeda };
        setSettings(cache);
      })
      .catch(() => {
        inflight = null;
      });
  }, [apiClient, tenantId]);

  return settings;
}
