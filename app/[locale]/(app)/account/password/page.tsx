'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { RequireRole } from '@/components/require-role';
import { ALL_ROLES } from '@/lib/roles';
import { useApiClient } from '@/lib/use-api-client';
import { ApiError } from '@/lib/api-client';

function ChangePasswordForm() {
  const t = useTranslations('account.password');
  const apiClient = useApiClient();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await apiClient('/auth/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      setSenhaAtual('');
      setNovaSenha('');
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('wrongCurrentPassword'));
      } else {
        setError(t('genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
  const inputClass = `rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent ${focusRing}`;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl tracking-tight">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('current')}</span>
          <input
            type="password"
            required
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('new')}</span>
          <input
            type="password"
            required
            minLength={6}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {success && <p className="text-sm text-success">{t('success')}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 ${focusRing}`}
        >
          {isSubmitting ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <RequireRole roles={ALL_ROLES}>
      <ChangePasswordForm />
    </RequireRole>
  );
}
