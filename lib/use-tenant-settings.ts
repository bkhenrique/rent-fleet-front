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

/** Só faz sentido pra papéis de locadora (tenant_admin/tenant_staff) — super_admin não tem tenant. */
export function useTenantSettings(): TenantSettings | null {
  const apiClient = useApiClient();
  const tenantId = useAuthStore((state) => state.user?.tenantId);
  const [settings, setSettings] = useState(cache);

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
