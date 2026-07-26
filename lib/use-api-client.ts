'use client';

import { useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch, TenantBlockedError } from './api-client';

/**
 * Hook client-side que injeta o JWT automaticamente e centraliza o 402 TENANT_ACCESS_BLOCKED:
 * qualquer chamada que caia nesse erro redireciona pra /blocked sem cada tela precisar tratar
 * isso individualmente. `useRouter` vem do next-intl (i18n/navigation), então o redirect já sai
 * com o prefixo de locale certo.
 */
export function useApiClient() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  return useCallback(
    async <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
      try {
        return await apiFetch<T>(path, { ...options, token });
      } catch (error) {
        if (error instanceof TenantBlockedError) {
          router.push('/blocked');
        }
        throw error;
      }
    },
    [token, router],
  );
}
