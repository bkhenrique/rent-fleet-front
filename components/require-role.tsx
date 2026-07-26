'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore, type Role } from '@/stores/auth-store';

/**
 * Guard de rota client-side. Espera `hasHydrated` antes de decidir qualquer coisa (ver
 * auth-store.ts) — senão um F5 numa rota protegida jogaria um usuário já logado pro /login.
 *
 * Passe `roles` como uma constante de módulo (`const ALLOWED = ['super_admin'] as const`), não um
 * array literal inline — evita recriar a referência (e disparar o efeito) a cada render.
 */
export function RequireRole({ roles, children }: { roles: readonly Role[]; children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

  const isAllowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAllowed) {
      router.replace('/');
    }
  }, [hasHydrated, user, isAllowed, router]);

  if (!hasHydrated || !isAllowed) return null;

  return <>{children}</>;
}
