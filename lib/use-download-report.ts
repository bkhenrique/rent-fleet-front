'use client';

import { useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Baixa um relatório em PDF (bloco 46 do MELHORIAS5.md) — diferente de `useApiClient`, que sempre
 * espera JSON, então não dá pra reaproveitar pra binário. Mesmo tratamento de bloqueio (402) que o
 * `useApiClient` já faz, pra não deixar o usuário bloqueado tentando baixar relatório sem feedback.
 */
export function useDownloadReport() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  return useCallback(
    async (path: string, filename: string): Promise<void> => {
      const response = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 402) {
        router.push('/blocked');
        return;
      }
      if (!response.ok) {
        throw new Error('report_download_failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    [token, router],
  );
}
