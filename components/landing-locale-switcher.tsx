'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALES, type AppLocale } from '@/i18n/routing';

const LOCALE_LABELS: Record<AppLocale, string> = { pt: 'PT', en: 'EN', es: 'ES' };

/** Pill de idioma com o visual da landing (`--surface-2`/`--accent`) — troca de locale de verdade via next-intl, diferente do estado só-visual do mockup original. */
export function LandingLocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 3,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 999,
      }}
    >
      {LOCALES.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            className="mono"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={active}
            style={{
              padding: '9px 11px',
              minHeight: 36,
              borderRadius: 999,
              border: 0,
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '.04em',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#10120f' : 'var(--text-dim)',
              fontWeight: active ? 600 : 400,
              transition: 'all 140ms ease',
            }}
          >
            {LOCALE_LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
