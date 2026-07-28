'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api-client';
import type { Country } from '@/lib/types/tenant';
import type { AppLocale } from '@/i18n/routing';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const COUNTRIES: Country[] = ['BR', 'ES', 'US'];

const DDI_BY_COUNTRY: Record<Country, string> = {
  BR: '+55',
  ES: '+34',
  US: '+1',
};

/** Palpite de país a partir do locale da URL — só sugestão inicial, sempre editável pelo usuário. */
const DEFAULT_COUNTRY_BY_LOCALE: Record<AppLocale, Country> = {
  pt: 'BR',
  en: 'US',
  es: 'ES',
};

/** Captura de lead da landing pública — não há cadastro self-service (só o Super Admin cria locadora). */
export function LeadForm() {
  const t = useTranslations('landing.contact');
  const locale = useLocale() as AppLocale;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY_BY_LOCALE[locale] ?? 'BR');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fleetSize, setFleetSize] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('submitting');

    try {
      await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          email,
          telefonePais: phoneCountry,
          telefoneNumero: phoneNumber,
          tamanhoFrota: Number(fleetSize),
          locale,
          message: message || undefined,
        }),
      });
      setStatus('success');
      setNome('');
      setEmail('');
      setPhoneCountry(DEFAULT_COUNTRY_BY_LOCALE[locale] ?? 'BR');
      setPhoneNumber('');
      setFleetSize('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 460, marginTop: 8 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        <input
          type="text"
          required
          autoComplete="name"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder={t('namePlaceholder')}
          className="input"
          style={{ padding: '12px 14px', fontSize: 14 }}
        />
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
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <select
            aria-label={t('phoneLabel')}
            value={phoneCountry}
            onChange={(event) => setPhoneCountry(event.target.value as Country)}
            className="input"
            style={{ padding: '12px 14px', fontSize: 14, flex: '0 0 auto', width: 'auto' }}
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {t(`country${country}`)}
              </option>
            ))}
          </select>
          <input
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel-national"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ''))}
            placeholder={`${DDI_BY_COUNTRY[phoneCountry]} ${t('phoneLabel')}`}
            aria-label={t('phoneLabel')}
            className="input"
            style={{ padding: '12px 14px', fontSize: 14, flex: 1 }}
          />
        </div>
        <input
          type="number"
          min="1"
          required
          value={fleetSize}
          onChange={(event) => setFleetSize(event.target.value)}
          placeholder={t('fleetSizePlaceholder')}
          className="input"
          style={{ padding: '12px 14px', fontSize: 14 }}
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t('messagePlaceholder')}
          rows={3}
          className="input"
          style={{ padding: '12px 14px', fontSize: 14, resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className="btn btn-lg btn-primary"
          style={{ fontWeight: 600, width: '100%' }}
        >
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
