'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';
import { useAuthStore, type AuthUser } from '@/stores/auth-store';
import { LogoMarkIcon } from '@/components/landing-icons';

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const INPUT_CLASS = `rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent ${FOCUS_RING}`;

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();
  const apiClient = useApiClient();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(result.accessToken, result.user);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('invalidCredentials'));
      } else {
        setError(t('genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-57px)] max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <LogoMarkIcon size={22} />
        </span>
        <h1 className="font-serif text-3xl tracking-tight">{t('title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-elevated">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('email')}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('password')}</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-2 rounded-md bg-accent px-4 py-2.5 font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 ${FOCUS_RING}`}
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  );
}
