'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Não renderiza nada — só dispara o redirect quando um usuário já logado acessa `/` (a landing
 * pública, ver `app/[locale]/page.tsx`). `super_admin` cai em `/admin`, o resto em `/dashboard`.
 * Usuário deslogado (ou ainda não hidratado) não é afetado: a landing renderizada pelo Server
 * Component ao redor continua visível normalmente (ver LANDING.md, seção 3).
 */
export function AuthRedirect() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated || !user) return;

    if (user.role === 'super_admin') {
      router.replace('/admin');
    } else {
      router.replace('/dashboard');
    }
  }, [user, hasHydrated, router]);

  return null;
}
