'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';

/** Home só existe pra rotear pra área certa após o login — nada é renderizado aqui. */
export default function HomePage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace('/login');
    } else if (user.role === 'super_admin') {
      router.replace('/admin');
    } else {
      router.replace('/dashboard');
    }
  }, [user, hasHydrated, router]);

  return null;
}
