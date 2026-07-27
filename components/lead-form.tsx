'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api-client';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Captura de e-mail da landing pública — não há cadastro self-service (só o Super Admin cria locadora), então isso vira lead. */
export function LeadForm() {
  const t = useTranslations('landing.contact');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 460, marginTop: 8 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, width: '100%' }}>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('emailPlaceholder')}
          className="input"
          style={{ padding: '12px 14px', fontSize: 14 }}
        />
        <button type="submit" disabled={status === 'submitting' || status === 'success'} className="btn btn-lg btn-primary" style={{ fontWeight: 600 }}>
          {status === 'success' ? t('success') : status === 'submitting' ? t('submitting') : t('submit')}
        </button>
      </form>
      {status === 'error' && (
        <p role="alert" className="dim" style={{ fontSize: 13, color: 'var(--danger)' }}>
          {t('error')}
        </p>
      )}
    </div>
  );
}
