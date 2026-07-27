'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api-client';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Captura de e-mail da landing pública — não há cadastro self-service (só o Super Admin cria locadora), então isso vira lead. */
export function LeadForm() {
  const t = useTranslations('landing.ctaFinal');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('submitting');

    try {
      await apiFetch('/leads', { method: 'POST', body: JSON.stringify({ email }) });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p className="font-medium text-green-600 dark:text-green-400">{t('success')}</p>;
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full flex-1 rounded-full border border-black/15 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent dark:border-white/25"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === 'submitting' ? t('submitting') : t('submit')}
        </button>
      </form>
      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t('error')}
        </p>
      )}
    </div>
  );
}
