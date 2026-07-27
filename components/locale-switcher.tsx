'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALES, type AppLocale } from '@/i18n/routing';

const LOCALE_LABELS: Record<AppLocale, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES',
};

/** Sempre visível no layout — troca de idioma preservando a rota atual (ver bloco 9 do TAREFAS.md). */
export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  return (
    <div role="group" aria-label={t('language')} className="flex gap-1">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={loc === locale}
          className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
            loc === locale
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground/70 hover:bg-foreground/10'
          }`}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
