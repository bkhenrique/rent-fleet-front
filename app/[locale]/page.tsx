'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Placeholder até os blocos 10/11 existirem (área do Super Admin / dashboard da locadora) — por
 * enquanto só confirma que o login/estado de auth funcionam de ponta a ponta.
 */
export default function HomePage() {
  const t = useTranslations('home');
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center">
      <p>{t('welcome', { name: user.name })}</p>
      <p className="text-sm text-foreground/60">{user.role}</p>
      <button type="button" onClick={handleLogout} className="mt-4 self-center text-sm underline">
        {t('logout')}
      </button>
    </div>
  );
}
